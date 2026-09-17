import { Router } from "express";
import { protect, requirePasswordChanged, protectAdmin } from "../middleware/auth.js";
import {
  clockInOut,
  getAttendance,
  createVerificationChallenge,
  getCurrentSession,
  startAttendanceSession,
  stopAttendanceSession,
  getTodayAttendance,
  getVerificationImage,
} from "../controllers/attendanceController.js";

const attendanceRouter = Router();

// ---- Employee (self) ----
attendanceRouter.post("/", protect, requirePasswordChanged, clockInOut);
attendanceRouter.get("/", protect, requirePasswordChanged, getAttendance);
attendanceRouter.post("/verify/challenge", protect, requirePasswordChanged, createVerificationChallenge);
attendanceRouter.get("/session/current", protect, requirePasswordChanged, getCurrentSession);

// ---- Employer / admin ----
attendanceRouter.post("/session/start", protect, requirePasswordChanged, protectAdmin, startAttendanceSession);
attendanceRouter.post("/session/stop", protect, requirePasswordChanged, protectAdmin, stopAttendanceSession);
attendanceRouter.get("/today", protect, requirePasswordChanged, protectAdmin, getTodayAttendance);
// param route last so it cannot shadow the static routes above
attendanceRouter.get("/:id/verification-image", protect, requirePasswordChanged, protectAdmin, getVerificationImage);

export default attendanceRouter;
