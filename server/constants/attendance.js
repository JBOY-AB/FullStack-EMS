// Shared configuration for the webcam attendance-verification feature.
// Kept in one place so timings/retention can be tuned without hunting
// through controllers.

// How long an employer-started attendance session (code) stays valid.
export const SESSION_DURATION_MINUTES = 30;

// How long a single-use verification challenge (nonce) is accepted.
// Short window so an old capture cannot be replayed later.
export const CHALLENGE_TTL_MINUTES = 2;

// How long verification images are retained before the scheduled job
// strips them (the attendance record + metadata are always kept).
export const VERIFICATION_IMAGE_RETENTION_DAYS = 30;

// Capture constraints — the client downscales before upload, this is a
// server-side safety cap on the decoded image size.
export const MAX_VERIFICATION_IMAGE_BYTES = 500 * 1024; // 500 KB
