import "dotenv/config";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Employee from "./models/Employee.js";
import Attendance from "./models/Attendance.js";
import LeaveApplication from "./models/LeaveApplication.js";
import Payslip from "./models/Payslip.js";

// One-time cleanup: remove ALL test employees and everything that
// references them. Admin accounts are intentionally kept so you don't
// lock yourself out. Run with:  node clearEmployees.js
async function clearEmployees() {
  try {
    await connectDB();

    const [employees, attendance, leaves, payslips, users] = await Promise.all([
      Employee.deleteMany({}),
      Attendance.deleteMany({}),
      LeaveApplication.deleteMany({}),
      Payslip.deleteMany({}),
      // keep admins, remove every non-admin login account
      User.deleteMany({ role: { $ne: "ADMIN" } }),
    ]);

    console.log("Cleanup complete:");
    console.log("  Employees removed:  ", employees.deletedCount);
    console.log("  Attendance removed: ", attendance.deletedCount);
    console.log("  Leaves removed:     ", leaves.deletedCount);
    console.log("  Payslips removed:   ", payslips.deletedCount);
    console.log("  User accounts removed (non-admin):", users.deletedCount);

    process.exit(0);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
}

clearEmployees();
