import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import employeesRouter from "./routes/employeeRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import leaveRouter from "./routes/leaveRoutes.js";
import payslipsRouter from "./routes/payslipsRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

console.log("🔧 Starting server...");
console.log("🔍 Environment check:");
console.log("  - MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "NOT SET");
console.log("  - JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "NOT SET");
console.log("  - NODE_ENV:", process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
}));
// Clock-in sends a downscaled webcam frame (data URL) alongside JSON, so the
// body can exceed the 100 KB express default. Capped at 1 MB (image buffer is
// hard-limited to 500 KB server-side; base64 inflates it by ~33%).
app.use(express.json({ limit: "1mb" }));

const upload = multer();

// Initialize database connection for serverless
let dbConnected = false;

app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      console.log("📡 Attempting database connection...");
      await connectDB();
      dbConnected = true;
      console.log("✅ Database ready!");
    } catch (error) {
      console.error("❌ Database connection error:", error);
      return res.status(500).json({ error: "Database connection failed" });
    }
  }
  next();
});

app.get("/", (req, res) => {
  res.send("Server is running");
});
app.get("/health", (req, res) => {
  res.json({ ok: true });
});
app.use("/api/auth", authRouter)
app.use("/api/employees", employeesRouter)
app.use("/api/profile", profileRouter)
app.use("/api/attendance", attendanceRouter)
app.use("/api/leaves", leaveRouter)
app.use("/api/payslips", payslipsRouter)
app.use("/api/dashboard", dashboardRouter)

app.use("/api/inngest", serve({ client: inngest, functions }));

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// Export for Vercel serverless
export default app;

// Only start server locally, not in serverless environment
if (!process.env.VERCEL) {
  startServer();
}