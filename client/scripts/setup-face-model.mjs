// One-time setup for the on-device face detector used by attendance
// verification (client/src/utils/faceLiveness.js).
//
// Copies the MediaPipe WASM runtime out of node_modules and downloads the
// face_landmarker model into client/public/mediapipe/, so the detector is
// SELF-HOSTED. That matters here: it works on an intranet, survives a CDN
// outage, and avoids an external request that would reveal an employee is
// clocking in.
//
// Run once after installing the dependency:
//   npm install @mediapipe/tasks-vision
//   npm run setup:face
//
// Both output paths must match ASSET_BASE in faceLiveness.js ("/mediapipe").

import { cp, mkdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const clientRoot = resolve(here, "..");

const WASM_SRC = resolve(clientRoot, "node_modules/@mediapipe/tasks-vision/wasm");
const OUT_DIR = resolve(clientRoot, "public/mediapipe");
const WASM_OUT = resolve(OUT_DIR, "wasm");
const MODEL_OUT = resolve(OUT_DIR, "face_landmarker.task");

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// The real model is ~3.7 MB. Anything much smaller is an error page or a
// truncated download — better to fail here than to ship a file that only
// breaks at runtime, inside a modal, while someone is trying to clock in.
const MIN_MODEL_BYTES = 1_000_000;

const die = (message) => {
  console.error(`\n  setup:face failed — ${message}\n`);
  process.exit(1);
};

const copyWasm = async () => {
  if (!existsSync(WASM_SRC)) {
    die(
      "@mediapipe/tasks-vision is not installed.\n" +
        "  Run:  npm install @mediapipe/tasks-vision"
    );
  }
  await mkdir(WASM_OUT, { recursive: true });
  await cp(WASM_SRC, WASM_OUT, { recursive: true });
  console.log(`  wasm runtime -> public/mediapipe/wasm`);
};

const downloadModel = async () => {
  if (existsSync(MODEL_OUT)) {
    const { size } = await stat(MODEL_OUT);
    if (size >= MIN_MODEL_BYTES) {
      console.log(`  model already present (${(size / 1e6).toFixed(1)} MB) — skipping`);
      return;
    }
    console.log("  existing model looks truncated — re-downloading");
  }

  console.log(`  downloading model...`);
  let response;
  try {
    response = await fetch(MODEL_URL);
  } catch (err) {
    die(`could not reach the model host: ${err.message}\n  URL: ${MODEL_URL}`);
  }
  if (!response.ok) {
    die(`model download returned HTTP ${response.status}.\n  URL: ${MODEL_URL}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < MIN_MODEL_BYTES) {
    die(
      `downloaded file is only ${buffer.length} bytes — that is not the model.\n` +
        `  The URL has probably moved. Check the current one at\n` +
        `  https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker`
    );
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(MODEL_OUT, buffer);
  console.log(`  model -> public/mediapipe/face_landmarker.task (${(buffer.length / 1e6).toFixed(1)} MB)`);
};

console.log("\nSetting up on-device face detection assets:");
await copyWasm();
await downloadModel();
console.log("\nDone. Commit public/mediapipe/ so builds don't need network access.\n");
