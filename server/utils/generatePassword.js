import crypto from "crypto";

// Unambiguous character sets (no 0/O, 1/l/I) so a temp password
// is easy to read out / copy without confusion.
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const ALL = LOWER + UPPER + DIGITS;

// Pick one random char from a set using a cryptographically secure RNG.
const pick = (set) => set[crypto.randomInt(set.length)];

/**
 * Generate a secure temporary password.
 * Guarantees at least one lowercase, one uppercase and one digit,
 * fills the rest randomly, then shuffles so the guaranteed chars
 * aren't always in the same position.
 */
export const generateTemporaryPassword = (length = 10) => {
  const size = Math.max(length, 8);

  const chars = [pick(LOWER), pick(UPPER), pick(DIGITS)];
  while (chars.length < size) {
    chars.push(pick(ALL));
  }

  // Fisher–Yates shuffle with a secure RNG.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
};

export default generateTemporaryPassword;
