import mongoose from "mongoose";

// Lightweight audit trail for attendance verification (Step 15). Records both
// successful and failed webcam verifications. Deliberately stores no image and
// no sensitive data — just who/when/outcome.
const verificationAuditLogSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, default: "CLOCK_IN" },
    verificationMethod: { type: String, default: "webcam" },
    status: { type: String, enum: ["verified", "failed"], required: true },
    reason: { type: String, default: null }, // failure reason, when status === "failed"
    attendanceId: { type: mongoose.Schema.Types.ObjectId, ref: "Attendance", default: null },
  },
  { timestamps: true }
);

const VerificationAuditLog =
  mongoose.models.VerificationAuditLog ||
  mongoose.model("VerificationAuditLog", verificationAuditLogSchema);

export default VerificationAuditLog;
