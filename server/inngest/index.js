import { Inngest } from "inngest";
import Attendance from "../models/attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";
import sendEmail from "../config/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "fullstack-ems" });

// Auto check put for employees
const autoCheckOut = inngest.createFunction(
  { id: "auto-check-out", triggers: [
    {event: "employee/check-out"},
  ] },

  
  async ({ event, step }) => {
   const {employeeId, attendanceId } = event.data;
        // wait for 9hours

        await step.sleepUntil("wait-for-9-hours", new Date(Date.now().getTime() + 9 * 60 * 60 * 1000))

    // get attendance data
    let attendance = await Attendance.findById(attendanceId)

    if(!attendance){
        // get employee data
        const employee = await Employee.findById(employeeId)

        // send reminder email

        await sendEmail({
            to: employee.email,
            subject: "Attendance Checkout Reminder",
            body: `<div style="max-width: 600px;>
            <h2>Hi ${employee.firstName},</h2>
            <p style="font-size: 16px">You have a check-in in ${employee.department} today:</p>
            <p style="font-size: 18px; font-weight: bold; color:#007bff; margin: 8px 0;">${attendance.checkIn?.toLocaleTimeString()}</p>
            <p style="font-size: 16px">Please make sure to check-out in one hour.</p>
            <p style="font-size: 16px">If you have any questions, please contact your admin.</p>
            <br />
            <p style="font-size: 16px">Best regards,</p>
            <p style="font-size: 16px; font-weight: bold;">EMS</p>
            </div>`
        })

        // After 110hrs mark attendabce as checked out with states "LATE"
        await step.sleepUntil("wait-for-1-hours", new Date(Date.now().getTime() + 1 * 60 * 60 * 1000))

        attendance = await Attendance.findById(attendanceId)

        if(!attendance.checkedOut){
            attendance.checkedOut = new Date(attendance.checkIn).getTime() + 4 * 60 * 60 * 1000;
            attendance.workingHours = 4;
            attendance.dayType = "Half Day";
            attendance.status = "LATE";
            await attendance.save();
           
        }
    }

  },
);



// send email to admin if admin doesn't take action on leave 
// application within 24 hours
const leaveApplicationReminder = inngest.createFunction(
  { id: "leave-application-reminder", triggers: [
    {event: "employee/leave-pending"},
  ] },
  async ({ event, step }) => {
    const {leaveApplicationId} = event.data;

    // wait for 24 hours
    await step.sleepUntil("wait-for-24-hours", new Date(Date.now().getTime() + 24 * 60 * 60 * 1000))

    const leaveApplication = await LeaveApplication.findById(leaveApplicationId)
    if(leaveApplication?.status === "PENDING"){
        const employee = await Employee.findById(leaveApplication.employeeId)

        // send reminder email to admin tp take action  on leave application

        await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: "Leave Application Reminder",
            body: `<div style="max-width: 600px;">
                <h2>Hi Admin,</h2>
                <p style="font-size: 16px">You have a leave application in ${employee.department} today:</p>
                <p style="font-size: 18px; font-weight: bold; color:#007bff; margin: 8px 0;">${leaveApplication.startDate?.toLocaleDateString()}</p>
                <p style="font-size: 16px">Please take action on this leave application.</p>
                <br />
                <p style="font-size: 16px">Best regards,</p>
                <p style="font-size: 16px; font-weight: bold;">EMS</p>
            </div>`
        })

    }
  }
 
);

// cron : check attendance at 11:30am and email absent employee

const attendanceReminderCron = inngest.createFunction(
  { id: "attendance-reminder-cron", triggers: [
    { cron: "0 0 6 * * *" }, // Runs at 6:00 AM UTC
  ] },
  async ({ step }) => {

    const today = await step.run("get-todays-date-range", async () => {
      const now = new Date();

      const istDate = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );

      const startIST = new Date(istDate);
      startIST.setHours(0, 0, 0, 0);

      const endIST = new Date(startIST);
      endIST.setDate(endIST.getDate() + 1);

      return {
        startUTC: startIST.toISOString(),
        endUTC: endIST.toISOString(),
      };
    });

    // Step 2: active employees
    const activeEmployees = await step.run("get-active-employees", async () => {
      const employees = await Employee.find({
        isDeleted: false,
        employmentStatus: "ACTIVE",
      }).lean();

      return employees.map((e) => ({
        _id: e._id.toString(),
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        department: e.department,
      }));
    });

    // Step 3: on leave
    const onLeaveIds = await step.run("get-on-leave-ids", async () => {
      const leaves = await LeaveApplication.find({
        status: "APPROVED",
        startDate: { $lte: new Date(today.endUTC) },
        endDate: { $gte: new Date(today.startUTC) },
      }).lean();

      return leaves.map((l) => l.employeeId.toString());
    });

    // Step 4: checked in
    const checkedInIds = await step.run("get-checked-in-ids", async () => {
      const attendances = await Attendance.find({
        date: {
          $gte: new Date(today.startUTC),
          $lte: new Date(today.endUTC),
        },
      }).lean();

      return attendances.map((a) => a.employeeId.toString());
    });

    // Step 5: filter absent
    const absentEmployees = activeEmployees.filter(
      (emp) =>
        !onLeaveIds.includes(emp._id) &&
        !checkedInIds.includes(emp._id)
    );

    // Step 6: send emails
    if (absentEmployees.length > 0) {
      await step.run("send-reminder-emails", async () => {
        const emailPromises = absentEmployees.map((emp) => {
          // Replace with your real email function
          sendEmail({
            to: emp.email,
            subject: `Attendance Reminder - please Mark your attendance`,
            body: `<div style="max-width: 600px;">
                <h2>Hi ${emp.firstName},</h2>
                <p style="font-size: 16px">Please remember to check in today.</p>
                <br />
                <p style="font-size: 16px">Best regards,</p>
                <p style="font-size: 16px; font-weight: bold;">EMS</p>
            </div>`,
          });
        });

        await Promise.all(emailPromises);
      });
    }

    return {
      totalActiveEmployees: activeEmployees.length,
      onLeave: onLeaveIds.length,
      checkedIn: checkedInIds.length,
      absent: absentEmployees.length,
    };
  }
);



// Create an empty array where we'll export future Inngest functions
export const functions = [autoCheckOut, 
    leaveApplicationReminder,
     attendanceReminderCron
    ];