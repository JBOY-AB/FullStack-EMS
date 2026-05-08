import { inngest } from "../inngest/index.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

// clock in/out, view attendance records, update attendance status



// POST /api/attendance/clock-in
export const clockInOut = async (req, res) => {
    try {
        const session = req.session;
        const employee = await Employee.findOne({userId: session.userId})
        if(!employee) return res.status(404).json({error: "Employee profile not found"});
        if(employee.isDeleted) 
            return res.status(403).json({error: "Your account is deactivated. you cannot clock in or out.",})
        const today = new Date();
        today.setHours(0,0,0,0);
        const now = new Date();

        const existing = await Attendance.findOne({employeeId: employee._id, date: today})
        if(!existing){
            const isLate = now.getHours() >= 9 && now.getMinutes() > 0;
            const attendance = await Attendance.create({
                employeeId: employee._id,
                date: today,
                checkIn: now,
                status: isLate ? "LATE" : "PRESENT"
            })

            await inngest.send({
                name: "employee/check-out",
                data: {
                    employeeId: employee._id,
                    attendanceId: attendance._id,
                }
            })

            return res.json({success: true, type: "CHECK_IN", data: attendance});
        } else if(!existing.checkOut){
            const checkingInTime = new Date(existing.checkIn).getTime();
            const diffMs = now.getTime() - checkingInTime;
            const diffHours = diffMs / (1000 * 60 * 60);
            
            existing.checkOut = now;
            // compute working hours and day type
            const workingHours = parseFloat(diffHours.toFixed(2));
            let dayType = "Half Day";
            if (workingHours >= 8) 
                dayType = "Full Day";
             else if (workingHours >= 6) dayType = "Three Quarter Day";
            else if (workingHours >= 4) dayType = "Half Day";
            else dayType = "Short Day";

            existing.workingHours = workingHours;
            existing.dayType = dayType;
            await existing.save();
            return res.json({success: true, type: "CHECK_OUT", data: existing})

        }else {
            return res.json({success: true, type: "CHECK_OUT", data: existing})
        }
            // clock out
    } catch (error) {
        console.error("Attendance error:", error);
        return res.status(500).json({error: "Operation failed"});
    }
}

// POST /api/attendance/clock-out
// GET /api/attendance
export const getAttendance = async (req, res) => {
    try {
         const session = req.session;
        const employee = await Employee.findOne({userId: session.userId})
        if(!employee) return res.status(404).json({error: "Employee profile not found"});

        const limit = parseInt(req.query.limit || 30);
        const history = await Attendance.find({employeeId: employee._id}).sort({date: -1}).limit(limit);
        return res.json({
            data: history,
            employee: {isDeleted: employee.isDeleted}
        })
    } catch (error) {
        return res.status(500).json({error: "Failed to fetch attendance"});
    }
}