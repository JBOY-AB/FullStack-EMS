// Face-based liveness challenge for attendance verification.
//
// Uses MediaPipe FaceLandmarker to confirm three things in sequence:
//   1. a real face is in frame,
//   2. the person blinks,
//   3. the person turns their head.
// A photo held up to the camera clears gate 1 but can never clear 2 or 3.
//
// Honest framing: this is face DETECTION, not face recognition. We never
// compute, compare or store a face descriptor — the landmarks exist only
// inside this loop and nothing derived from them leaves the browser.
// Identity still comes from the EMS login.

const ASSET_BASE = "/mediapipe";

// --- challenge thresholds -------------------------------------------------
// A blink is a closed->open transition. Two thresholds (not one) give us
// hysteresis, so an eyelid hovering near the line can't rattle the counter.
const EYE_CLOSED = 0.5;
const EYE_OPEN = 0.2;
// Frames a face must persist before we call it found — rejects a single
// spurious detection.
const FACE_CONFIRM_FRAMES = 3;
// Total yaw swing required, in degrees. Deliberately small: "turn your head
// slightly" should pass, which is exactly what the old motion check got wrong.
const YAW_RANGE_DEG = 12;

let landmarkerPromise = null;

// Cached across attempts: the model is several MB, so a retry after a failed
// challenge must not re-download it.
export const loadFaceLandmarker = () => {
  if (landmarkerPromise) return landmarkerPromise;

  landmarkerPromise = (async () => {
    const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(`${ASSET_BASE}/wasm`);

    const options = (delegate) => ({
      baseOptions: { modelAssetPath: `${ASSET_BASE}/face_landmarker.task`, delegate },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    });

    try {
      return await FaceLandmarker.createFromOptions(fileset, options("GPU"));
    } catch {
      // Plenty of office machines have no usable WebGL; CPU is slower but works.
      return FaceLandmarker.createFromOptions(fileset, options("CPU"));
    }
  })().catch((err) => {
    landmarkerPromise = null; // don't cache the failure — a later attempt may succeed
    throw err;
  });

  return landmarkerPromise;
};

const blendshapeScore = (categories, name) =>
  categories?.find((c) => c.categoryName === name)?.score ?? 0;

// Yaw from the 4x4 facial transformation matrix, which MediaPipe returns
// COLUMN-major: element (row r, col c) lives at data[c * 4 + r]. The rotation
// submatrix is therefore
//     [ d0  d4  d8  ]
//     [ d1  d5  d9  ]
//     [ d2  d6  d10 ]
// and rotation about the vertical axis is atan2(R02, R22) = atan2(d8, d10).
// Only the RANGE of this value is used, never its sign, so the mirrored
// preview and any axis-convention differences are harmless.
const yawDegrees = (matrix) => {
  const d = matrix?.data;
  if (!d || d.length < 16) return null;
  return (Math.atan2(d[8], d[10]) * 180) / Math.PI;
};

// Resolves { passed, mode: "face", gates, reason }. `reason` names the first
// unmet gate so the UI can say what actually went wrong instead of guessing.
export const runFaceLivenessChallenge = async (video, opts = {}) => {
  const { timeoutMs = 8000, onProgress, isCancelled } = opts;

  const landmarker = await loadFaceLandmarker(); // throws -> caller falls back

  return new Promise((resolve) => {
    const gates = { faceFound: false, blinked: false, turned: false };

    let faceFrames = 0;
    let eyesClosed = false;
    let yawMin = Infinity;
    let yawMax = -Infinity;
    let lastFrameTime = -1;
    let rafId = null;
    const start = performance.now();

    const finish = (passed, reason = null) => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      resolve({ passed, mode: "face", gates: { ...gates }, reason });
    };

    const tick = () => {
      if (typeof isCancelled === "function" && isCancelled()) return finish(false, "cancelled");

      const elapsed = performance.now() - start;

      // Skip frames the decoder hasn't advanced past yet — re-running detection
      // on an identical frame is pure waste.
      if (video && video.readyState >= 2 && video.currentTime !== lastFrameTime) {
        lastFrameTime = video.currentTime;

        let result = null;
        try {
          result = landmarker.detectForVideo(video, performance.now());
        } catch {
          result = null;
        }

        if (result?.faceLandmarks?.length > 0) {
          faceFrames++;
          if (faceFrames >= FACE_CONFIRM_FRAMES) gates.faceFound = true;

          // Gates 2 and 3 only make sense once we actually have a face.
          if (gates.faceFound) {
            const categories = result.faceBlendshapes?.[0]?.categories;
            if (categories) {
              // Both eyes, so a wink or one-sided tracking glitch doesn't count.
              const blink = Math.min(
                blendshapeScore(categories, "eyeBlinkLeft"),
                blendshapeScore(categories, "eyeBlinkRight")
              );
              if (!eyesClosed && blink >= EYE_CLOSED) {
                eyesClosed = true;
              } else if (eyesClosed && blink <= EYE_OPEN) {
                eyesClosed = false;
                gates.blinked = true; // a completed closed->open cycle
              }
            }

            const yaw = yawDegrees(result.facialTransformationMatrixes?.[0]);
            if (yaw !== null) {
              if (yaw < yawMin) yawMin = yaw;
              if (yaw > yawMax) yawMax = yaw;
              if (yawMax - yawMin >= YAW_RANGE_DEG) gates.turned = true;
            }
          }
        } else {
          // Lost the face: decay rather than reset, so a one-frame dropout
          // doesn't undo progress the person already made.
          faceFrames = Math.max(0, faceFrames - 1);
        }
      }

      if (typeof onProgress === "function") {
        onProgress({ ...gates, progress: Math.min(1, elapsed / timeoutMs) });
      }

      if (gates.faceFound && gates.blinked && gates.turned) return finish(true);

      if (elapsed >= timeoutMs) {
        // Report the EARLIEST unmet gate — that's the one the person needs to
        // act on, and the later gates were probably never reachable without it.
        const reason = !gates.faceFound ? "no_face" : !gates.blinked ? "no_blink" : "no_turn";
        return finish(false, reason);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  });
};

export default runFaceLivenessChallenge;
