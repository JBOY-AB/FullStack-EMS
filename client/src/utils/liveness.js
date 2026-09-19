// Motion-based liveness fallback, used only when the face model can't load
// (old browser, WASM blocked, slow network). See faceLiveness.js for the
// primary path.
//
// We sample the FACE-GUIDE REGION of the live video and measure how much those
// pixels change between frames. A static photo produces almost no frame-to-frame
// motion; a live person produces clearly more. This is a PRESENCE signal only —
// it is NOT identity or biometric recognition, and unlike the face path it
// cannot tell a person from any other moving object.
//
// Previous versions sampled the WHOLE frame at 48x48 against a fixed threshold
// of 8/255. Downscaling is a low-pass filter, so a blink (~1-2% of frame area)
// contributed a fraction of one gray level to the whole-frame mean and could
// never reach that threshold — the check demanded motion the instructions never
// asked for. Both the crop and the threshold below exist to fix that.

// Fraction of the video frame covered by the on-screen oval guide. The modal
// renders a 144x192 guide inside a 400x300 (4:3) preview of a 4:3 stream, so
// the guide spans ~36% of the width and ~64% of the height, centred.
const CROP_W = 0.38;
const CROP_H = 0.66;

// Higher than the old 48 so eye-sized detail survives the downscale.
const SAMPLE_SIZE = 128;

// Noise floor is measured per-session, but never trusted below this, so a
// pathologically clean sensor can't make the check trivial to pass.
const MIN_THRESHOLD = 1.5;
// How far above this camera's own noise floor counts as real motion.
const NOISE_MULTIPLIER = 4;

// One canvas for the whole run rather than one per sample.
const createSampler = (size) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  return (video) => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return null;

    // Centre crop matching the guide the person is aiming at.
    const sw = vw * CROP_W;
    const sh = vh * CROP_H;
    const sx = (vw - sw) / 2;
    const sy = (vh - sh) / 2;

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    const gray = new Uint8ClampedArray(size * size);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      // Rec. 601 luma
      gray[p] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0;
    }
    return gray;
  };
};

const meanAbsDiff = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
};

// 25th percentile, not the mean: if the person happens to move during the
// calibration window, a mean would inflate the "noise floor" and re-create the
// impossible-threshold bug. A low percentile still reflects the quiet frames.
const percentile25 = (values) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.25)];
};

// Resolves { passed, mode: "motion", peak, threshold }. Passing needs motion
// sustained across several samples, so one lighting flicker won't do it and a
// frozen frame can't.
export const runLivenessChallenge = (video, opts = {}) => {
  const {
    durationMs = 5000,
    calibrationMs = 700,
    intervalMs = 100,
    minMotionFrames = 3,
    onProgress,
    isCancelled,
  } = opts;

  return new Promise((resolve) => {
    if (!video) return resolve({ passed: false, mode: "motion", peak: 0, threshold: 0 });

    const sample = createSampler(SAMPLE_SIZE);
    const baseline = [];
    let prev = null;
    let peak = 0;
    let motionFrames = 0;
    let threshold = 0;
    let lastFrameTime = -1;
    const start = Date.now();

    const tick = () => {
      if (typeof isCancelled === "function" && isCancelled()) {
        return resolve({ passed: false, mode: "motion", peak, threshold });
      }

      const elapsed = Date.now() - start;

      // Only sample frames the decoder has actually advanced to; a repeated
      // frame yields a phoney zero that would drag the noise floor down.
      if (video.readyState >= 2 && video.currentTime !== lastFrameTime) {
        lastFrameTime = video.currentTime;

        let gray = null;
        try {
          gray = sample(video);
        } catch {
          gray = null;
        }

        if (gray && prev) {
          const diff = meanAbsDiff(gray, prev);
          if (elapsed < calibrationMs) {
            baseline.push(diff);
          } else {
            if (!threshold) {
              threshold = Math.max(percentile25(baseline) * NOISE_MULTIPLIER, MIN_THRESHOLD);
            }
            if (diff > peak) peak = diff;
            if (diff >= threshold) motionFrames++;
          }
        }
        if (gray) prev = gray;
      }

      if (typeof onProgress === "function") {
        onProgress({ progress: Math.min(1, elapsed / durationMs) });
      }

      // Nothing more to learn once it has passed.
      if (threshold && motionFrames >= minMotionFrames) {
        return resolve({ passed: true, mode: "motion", peak, threshold });
      }

      if (elapsed >= durationMs) {
        if (!threshold) threshold = MIN_THRESHOLD;
        return resolve({
          passed: motionFrames >= minMotionFrames,
          mode: "motion",
          peak,
          threshold,
        });
      }

      setTimeout(tick, intervalMs);
    };

    setTimeout(tick, intervalMs);
  });
};

export default runLivenessChallenge;
