import crypto from "crypto";

// Secure numeric attendance-session code (e.g. "4829").
// Uses crypto.randomInt so codes aren't predictable. Mirrors the style of
// generateTemporaryPassword.js — no new dependencies.
export const generateSessionCode = (digits = 4) => {
  const size = Math.max(digits, 4);
  let code = "";
  for (let i = 0; i < size; i++) {
    code += crypto.randomInt(10).toString();
  }
  return code;
};

export default generateSessionCode;
