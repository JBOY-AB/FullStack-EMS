import mongoose from "mongoose";

// An employer-started attendance session. While one is active and unexpired,
// employees must supply its code to clock in. Expiry is enforced by the
// backend (expiresAt) — the frontend countdown is display only.
const attendanceSessionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Fast lookup of the current session.
attendanceSessionSchema.index({ isActive: 1, expiresAt: 1 });

const AttendanceSession =
  mongoose.models.AttendanceSession ||
  mongoose.model("AttendanceSession", attendanceSessionSchema);

export default AttendanceSession;
