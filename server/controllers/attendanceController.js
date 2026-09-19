import crypto from "crypto";
import { inngest } from "../inngest/index.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import AttendanceSession from "../models/AttendanceSession.js";
import VerificationChallenge from "../models/VerificationChallenge.js";
import VerificationAuditLog from "../models/VerificationAuditLog.js";
import { generateSessionCode } from "../utils/generateSessionCode.js";
import {
  SESSION_DURATION_MINUTES,
  CHALLENGE_TTL_MINUTES,
  MAX_VERIFICATION_IMAGE_BYTES,
} from "../constants/attendance.js";

// clock in/out, view attendance records, attendance sessions, webcam verification


// ---------- helpers ----------

// Decode a "data:image/jpeg;base64,..." string into a Buffer, with guards.
const parseImageDataUrl = (dataUrl) => {
  if (typeof dataUrl !== "string") return null;
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  const mime = match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0 || buffer.length > MAX_VERIFICATION_IMAGE_BYTES) return null;
  return { mime, buffer };
};

// Which client-side check ran: on-device face detection, or the motion-only
// fallback used when the face model can't load.
//
// IMPORTANT: this is a CLIENT CLAIM. The server cannot confirm which check the
// browser actually ran, just as it could never confirm the liveness check ran
// at all. It is an operational/audit signal for the employer, NOT a security
// control. The real server-side guarantees are unchanged: a single-use nonce,
// a required image, and the attendance session code. Anything unrecognised is
// treated as the weaker mode.
const verificationStatusFor = (mode) => (mode === "face" ? "verified" : "verified_degraded");


const logVerification = async ({ employee, session, status, reason = null, attendanceId = null }) => {
  try {
    await VerificationAuditLog.create({
      employeeId: employee?._id,
      userId: session?.userId,
      action: "CLOCK_IN",
      verificationMethod: "webcam",
      status,
      reason,
      attendanceId,
    });
  } catch (error) {
    console.error("Audit log error:", error?.message);
  }
};

// Strip the (deselected) image buffer before returning a doc to the client.
const withoutImage = (doc) => {
  const obj = doc?.toObject ? doc.toObject() : { ...doc };
  delete obj.verificationImage;
  return obj;
};


// POST /api/attendance/verify/challenge
// Issues a short-lived, single-use nonce the employee must send with clock-in.
export const createVerificationChallenge = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.session.userId });
    if (!employee) return res.status(404).json({ error: "Employee profile not found" });
    if (employee.isDeleted)
      return res.status(403).json({ error: "Your account is deactivated. you cannot clock in or out." });

    const nonce = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MINUTES * 60 * 1000);
    await VerificationChallenge.create({ employeeId: employee._id, nonce, expiresAt });

    return res.json({ nonce, expiresAt });
  } catch (error) {
    console.error("Verification challenge error:", error);
    return res.status(500).json({ error: "Failed to start verification" });
  }
};


// POST /api/attendance   (clock-in requires webcam verification; clock-out does not)
export const clockInOut = async (req, res) => {
  try {
    const session = req.session;
    const employee = await Employee.findOne({ userId: session.userId });
    if (!employee) return res.status(404).json({ error: "Employee profile not found" });
    if (employee.isDeleted)
      return res.status(403).json({ error: "Your account is deactivated. you cannot clock in or out." });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    const existing = await Attendance.findOne({ employeeId: employee._id, date: today });

    // ===================== CHECK-IN (verified) =====================
    if (!existing) {
      const { nonce, image, sessionCode, verificationMode } = req.body;

      // 0) employee must be allowed to clock in at all. Checked on check-in
      //    only, so someone deactivated mid-shift can still clock out.
      if (employee.employmentStatus !== "ACTIVE") {
        await logVerification({ employee, session, status: "failed", reason: "inactive_employee" });
        return res.status(403).json({ error: "Your employment status does not allow clocking in." });
      }

      // 1) valid, unused, unexpired verification challenge (replay protection)
      const challenge = nonce
        ? await VerificationChallenge.findOne({ nonce, employeeId: employee._id })
        : null;
      if (!challenge || challenge.used || challenge.expiresAt < now) {
        await logVerification({ employee, session, status: "failed", reason: "invalid_challenge" });
        return res.status(400).json({ error: "Verification expired. Please try again." });
      }

      // 2) a live webcam frame is always required (never trust a client "verified" flag)
      const parsed = parseImageDataUrl(image);
      if (!parsed) {
        await logVerification({ employee, session, status: "failed", reason: "missing_image" });
        return res.status(400).json({ error: "Webcam verification is required to clock in." });
      }

      // 3) optional attendance session: if one is active, its code must match
      const activeSession = await AttendanceSession.findOne({
        isActive: true,
        expiresAt: { $gt: now },
      });
      let attendanceSessionId = null;
      if (activeSession) {
        if (!sessionCode || String(sessionCode).trim() !== activeSession.code) {
          await logVerification({ employee, session, status: "failed", reason: "invalid_session_code" });
          return res.status(400).json({
            error: "Invalid attendance code. Ask your employer for the current code.",
          });
        }
        attendanceSessionId = activeSession._id;
      } else if (sessionCode) {
        // a code was supplied but nothing is active → the session has expired
        await logVerification({ employee, session, status: "failed", reason: "session_expired" });
        return res.status(400).json({
          error: "This attendance session has expired. Ask your employer to start a new one.",
        });
      }

      // 4) consume the challenge so it cannot be reused
      challenge.used = true;
      await challenge.save();

      const isLate = now.getHours() >= 9 && now.getMinutes() > 0;
      const verificationStatus = verificationStatusFor(verificationMode);

      let attendance;
      try {
        attendance = await Attendance.create({
          employeeId: employee._id,
          date: today,
          checkIn: now,
          status: isLate ? "LATE" : "PRESENT",
          verificationMethod: "webcam",
          verificationStatus,
          verifiedAt: now,
          verificationImage: parsed.buffer,
          verificationImageType: parsed.mime,
          hasVerificationImage: true,
          attendanceSessionId,
        });
      } catch (err) {
        // unique {employeeId, date} index → a concurrent request already clocked in
        if (err?.code === 11000) {
          return res.status(409).json({ error: "You have already clocked in today." });
        }
        throw err;
      }

      await inngest.send({
        name: "employee/check-out",
        data: { employeeId: employee._id, attendanceId: attendance._id },
      });

      await logVerification({
        employee,
        session,
        status: verificationStatus,
        attendanceId: attendance._id,
      });

      return res.json({ success: true, type: "CHECK_IN", data: withoutImage(attendance) });
    }

    // ===================== CHECK-OUT (unchanged) =====================
    else if (!existing.checkOut) {
      const checkingInTime = new Date(existing.checkIn).getTime();
      const diffMs = now.getTime() - checkingInTime;
      const diffHours = diffMs / (1000 * 60 * 60);

      existing.checkOut = now;
      const workingHours = parseFloat(diffHours.toFixed(2));
      let dayType = "Half Day";
      if (workingHours >= 8) dayType = "Full Day";
      else if (workingHours >= 6) dayType = "Three Quarter Day";
      else if (workingHours >= 4) dayType = "Half Day";
      else dayType = "Short Day";

      existing.workingHours = workingHours;
      existing.dayType = dayType;
      await existing.save();
      return res.json({ success: true, type: "CHECK_OUT", data: withoutImage(existing) });
    } else {
      return res.json({ success: true, type: "CHECK_OUT", data: withoutImage(existing) });
    }
  } catch (error) {
    console.error("Attendance error:", error);
    return res.status(500).json({ error: "Operation failed" });
  }
};


// GET /api/attendance   (employee's own history)
export const getAttendance = async (req, res) => {
  try {
    const session = req.session;
    const employee = await Employee.findOne({ userId: session.userId });
    if (!employee) return res.status(404).json({ error: "Employee profile not found" });

    const limit = parseInt(req.query.limit || 30);
    // verificationImage is select:false, so it is never pulled here.
    const history = await Attendance.find({ employeeId: employee._id })
      .sort({ date: -1 })
      .limit(limit);
    return res.json({
      data: history,
      employee: { isDeleted: employee.isDeleted },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch attendance" });
  }
};


// ---------------- Attendance sessions (employer) ----------------

// POST /api/attendance/session/start  (admin)
export const startAttendanceSession = async (req, res) => {
  try {
    // only one active session at a time
    await AttendanceSession.updateMany({ isActive: true }, { isActive: false });

    const code = generateSessionCode(4);
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MINUTES * 60 * 1000);
    const created = await AttendanceSession.create({
      code,
      startedBy: req.session.userId,
      isActive: true,
      expiresAt,
    });

    return res.json({
      success: true,
      session: { id: created._id, code: created.code, expiresAt: created.expiresAt, active: true },
    });
  } catch (error) {
    console.error("Start session error:", error);
    return res.status(500).json({ error: "Failed to start attendance session" });
  }
};

// POST /api/attendance/session/stop  (admin)
export const stopAttendanceSession = async (req, res) => {
  try {
    await AttendanceSession.updateMany({ isActive: true }, { isActive: false });
    return res.json({ success: true });
  } catch (error) {
    console.error("Stop session error:", error);
    return res.status(500).json({ error: "Failed to stop attendance session" });
  }
};

// GET /api/attendance/session/current
// Admin gets the code; employees only learn that a session is active + when it
// expires (they receive the code from their employer out of band).
export const getCurrentSession = async (req, res) => {
  try {
    const now = new Date();
    const current = await AttendanceSession.findOne({
      isActive: true,
      expiresAt: { $gt: now },
    }).sort({ createdAt: -1 });

    if (!current) return res.json({ active: false });

    const payload = { active: true, expiresAt: current.expiresAt };
    if (req.session.role === "ADMIN") payload.code = current.code;
    return res.json(payload);
  } catch (error) {
    console.error("Get session error:", error);
    return res.status(500).json({ error: "Failed to load attendance session" });
  }
};


// ---------------- Employer attendance view ----------------

// GET /api/attendance/today  (admin) — today's attendance + verification status
export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const records = await Attendance.find({ date: { $gte: today, $lt: tomorrow } })
      .populate("employeeId", "firstName lastName department")
      .sort({ checkIn: -1 })
      .lean(); // image buffer excluded (select:false)

    const data = records.map((r) => ({
      id: r._id.toString(),
      employee: r.employeeId
        ? {
            name: `${r.employeeId.firstName} ${r.employeeId.lastName}`,
            department: r.employeeId.department || null,
          }
        : null,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      status: r.status,
      verificationMethod: r.verificationMethod,
      verificationStatus: r.verificationStatus,
      verifiedAt: r.verifiedAt,
      hasVerificationImage: !!r.hasVerificationImage,
    }));

    return res.json({ data });
  } catch (error) {
    console.error("Today attendance error:", error);
    return res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

// GET /api/attendance/:id/verification-image  (admin only)
// Streams the raw captured frame. Never exposed publicly or to employees.
export const getVerificationImage = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Attendance.findById(id).select(
      "+verificationImage +verificationImageType"
    );
    if (!record || !record.verificationImage) {
      return res.status(404).json({ error: "Verification image not found" });
    }

    res.set("Content-Type", record.verificationImageType || "image/jpeg");
    res.set("Cache-Control", "private, no-store");
    return res.send(record.verificationImage);
  } catch (error) {
    console.error("Verification image error:", error);
    return res.status(500).json({ error: "Failed to load verification image" });
  }
};
