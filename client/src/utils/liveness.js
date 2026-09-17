// Lightweight, no-ML liveness signal for attendance verification.
//
// We sample small grayscale frames from the LIVE video over a couple of
// seconds and measure how much the pixels change between frames. A static
// photo held up to the camera produces almost no frame-to-frame motion; a
// live person (blinking, small head movement, the requested turn) produces
// clearly more. This is a PRESENCE signal only — it is NOT identity or
// biometric/face recognition, and it is deliberately simple.

const sampleGray = (video, size = 48) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(video, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const gray = new Uint8ClampedArray(size * size);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    // Rec. 601 luma
    gray[p] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0;
  }
  return gray;
};

const meanAbsDiff = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
};

// Resolves { passed, peak, motionFrames }. Passing requires BOTH a real motion
// peak AND motion sustained across a few samples, so a single lighting flicker
// won't pass and a frozen frame can't.
export const runLivenessChallenge = (video, opts = {}) => {
  const {
    durationMs = 4000,
    intervalMs = 150,
    threshold = 8,
    minMotionFrames = 2,
    onProgress,
  } = opts;

  return new Promise((resolve) => {
    if (!video) return resolve({ passed: false, peak: 0, motionFrames: 0 });

    let prev = null;
    let peak = 0;
    let motionFrames = 0;
    const start = Date.now();

    const tick = () => {
      let gray = null;
      try {
        gray = sampleGray(video);
      } catch {
        gray = null;
      }
      if (gray && prev) {
        const diff = meanAbsDiff(gray, prev);
        if (diff > peak) peak = diff;
        if (diff >= threshold) motionFrames++;
      }
      prev = gray;

      const elapsed = Date.now() - start;
      if (typeof onProgress === "function") {
        onProgress(Math.min(1, elapsed / durationMs));
      }

      if (elapsed >= durationMs) {
        resolve({
          passed: peak >= threshold && motionFrames >= minMotionFrames,
          peak,
          motionFrames,
        });
      } else {
        setTimeout(tick, intervalMs);
      }
    };

    setTimeout(tick, intervalMs);
  });
};

export default runLivenessChallenge;
