import "dotenv/config";
import connectDB from "./config/db.js";
import LeaveApplication from "./models/LeaveApplication.js";
import Payslip from "./models/Payslip.js";

async function clearLeaveAndPayslips() {
  try {
    await connectDB();

    const [leaves, payslips] = await Promise.all([
      LeaveApplication.deleteMany({}),
      Payslip.deleteMany({}),
    ]);

    const [remainingLeaves, remainingPayslips] = await Promise.all([
      LeaveApplication.countDocuments(),
      Payslip.countDocuments(),
    ]);

    console.log("Leave and payslip cleanup complete:");
    console.log("  Leave requests removed:", leaves.deletedCount);
    console.log("  Payslips removed:      ", payslips.deletedCount);
    console.log("  Leave requests left:   ", remainingLeaves);
    console.log("  Payslips left:         ", remainingPayslips);

    process.exit(remainingLeaves === 0 && remainingPayslips === 0 ? 0 : 1);
  } catch (error) {
    console.error("Leave and payslip cleanup failed:", error);
    process.exit(1);
  }
}

clearLeaveAndPayslips();