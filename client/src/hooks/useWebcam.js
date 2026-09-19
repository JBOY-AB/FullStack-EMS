import { useCallback, useEffect, useRef, useState } from "react";

// Minimal webcam controller for the short attendance-verification flow.
//
// Privacy contract: the camera is ONLY ever started by an explicit start()
// call (triggered by a user click), and every path that ends verification
// calls stop(), which stops ALL MediaStream tracks. The unmount effect is a
// safety net so navigating away can never leave the camera running.
//
// status: "idle" | "starting" | "live" | "error"

const classifyError = (err) => {
  const name = err?.name || "";
  if (["NotAllowedError", "PermissionDeniedError", "SecurityError"].includes(name)) return "denied";
  if (["NotFoundError", "DevicesNotFoundError", "OverconstrainedError"].includes(name)) return "notfound";
  if (["NotReadableError", "TrackStartError", "AbortError"].includes(name)) return "inuse";
  if (name === "NoFramesError") return "noframes";
  return "unknown";
};

const ERROR_MESSAGES = {
  denied: "Camera access was blocked. Enable camera permission for this site, then try again.",
  notfound: "No camera was found on this device.",
  inuse: "Your camera is already in use by another app. Close it and try again.",
  noframes: "Your camera started but isn't sending any video. Close any other app using it, then try again.",
  unknown: "Could not start the camera. Please try again.",
};

// Resolve once the element is actually decoding frames.
//
// This guard is the whole reason verification used to fail silently: a video
// that never advances hands the liveness check identical frames forever, which
// reads as "you didn't move" rather than "the camera never started". Frames
// flowing — not play() resolving — is the real signal, so a rejected play()
// (autoplay policy, interrupted load) is not by itself treated as failure.
const waitForFrames = (video, timeoutMs = 5000) =>
  new Promise((resolve) => {
    if (!video) return resolve(false);
    const start = Date.now();
    const check = () => {
      if (video.readyState >= 2 && video.videoWidth > 0) return resolve(true);
      if (Date.now() - start >= timeoutMs) return resolve(false);
      setTimeout(check, 50);
    };
    check();
  });

export const useWebcam = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  // Stop tracks without touching status — used both by stop() and by the
  // failure path in start() (which needs to keep status === "error").
  const stopTracks = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stop = useCallback(() => {
    stopTracks();
    setStatus("idle");
  }, [stopTracks]);

  const start = useCallback(async () => {
    setError(null);
    setStatus("starting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw Object.assign(new Error("unsupported"), { name: "NotFoundError" });
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        // May reject under autoplay policy even when playback then succeeds —
        // waitForFrames below is the authoritative check.
        await video.play().catch(() => {});

        if (!(await waitForFrames(video))) {
          throw Object.assign(new Error("no video frames"), { name: "NoFramesError" });
        }
      }

      setStatus("live");
      return true;
    } catch (err) {
      const kind = classifyError(err);
      setError({ kind, message: ERROR_MESSAGES[kind] });
      stopTracks(); // clean up any partial stream, keep status === "error"
      setStatus("error");
      return false;
    }
  }, [stopTracks]);

  // Capture one downscaled JPEG frame from the live video as a data URL.
  const capture = useCallback((maxWidth = 320, quality = 0.7) => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    const w = Math.round(video.videoWidth * scale);
    const h = Math.round(video.videoHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  }, []);

  // Safety net: stop the camera if the consumer unmounts (e.g. route change).
  useEffect(() => () => stopTracks(), [stopTracks]);

  return { videoRef, streamRef, status, error, start, stop, capture };
};

export default useWebcam;
