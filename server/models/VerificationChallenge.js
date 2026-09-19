import mongoose from "mongoose";

// A single-use, short-lived nonce issued right before a clock-in verification.
// The clock-in request must carry a matching, unused, unexpired nonce — this
// binds each attendance to a fresh verification attempt and blocks replaying
// an old captured frame on another day (Step 16).
const verificationChallengeSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    nonce: { type: String, required: true, index: true },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index — MongoDB auto-removes expired challenges, so nothing accumulates.
verificationChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const VerificationChallenge =
  mongoose.models.VerificationChallenge ||
  mongoose.model("VerificationChallenge", verificationChallengeSchema);

export default VerificationChallenge;
