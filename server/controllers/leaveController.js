

// create leave

import { inngest } from "../inngest/index.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";

// Post /api/leave

export const createLeave = async (req, res) => {
    try {
        const session = req.session;
        const employee = await Employee.findOne({userId: session.userId})
        if(!employee) return res.status(404).json({error: "Employee not found"});
        if(employee.isDeleted){
            return res.status(403).json({error: "Your account is deactivated. you cannot apply for leave.",})
        }

        const {type, startDate, endDate, reason} = req.body;
        if(!type || !startDate || !endDate || !reason){
            return res.status(400).json({error: "Missing required fields"});
        }

        const today = new Date();
        today.setHours(0,0,0,0);
        if(new Date(startDate) <= today || new Date(endDate) <= today){
            return res.status(400).json({error: "Leave date must be in the future"});
        }

        if(new Date(endDate) < new Date(startDate) ){
            return res.status(400).json({error: "End date must be after start date"});
        }

        const leave = await LeaveApplication.create({
            employeeId: employee._id,
            type,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason,
            status: "PENDING",
        })
            await inngest.send({
                name: "employee/leave-pending",
                data: {
                    leaveApplicationId: leave._id,
                }
            });

        return res.json({success: true, data: leave})
        
    } catch (error) {
        return res.status(500).json({error: "Failed"});
    }
}

// Get leave 
// Get /api/leave

export const getLeaves = async (req, res) => {
    try {
        const session = req.session;
        const isAdmin = session.role === "ADMIN";
        if(isAdmin){
            const status = req.query.status;
            const where = status ? {status} : {};
            const leaves = await LeaveApplication.find(where).populate("employeeId").sort({createdAt: -1});
            const data = leaves.map((l) => {
                const obj = l.toObject();
                return {
                    ...obj,
                    id: obj._id.toString(),
                    employeeId: obj.employeeId._id.toString(),
                }
            })
            return res.json({data})
        }else {
    const employee = await Employee.findOne({ userId: session.userId }).lean();
    if (!employee) return res.status(404).json({ error: "Not found" });

    const leaves = await LeaveApplication
        .find({ employeeId: employee._id })
        .sort({ createdAt: -1 });

    return res.json({
        data: leaves,
        employee: { ...employee, id: employee._id.toString() }
    });

     }
    } catch (error) {
        return res.status(500).json({error: "Failed"});
    }
}
// Update leave
// PATCH /api/leaves/:id/status

export const updateLeaveStatus = async (req, res) => {
 try {
    const {status} = req.body;
    if(!["APPROVED", "REJECTED", "PENDING"].includes(status)){
        return res.status(400).json({error: "Invalid status"})
    }

    const leave = await LeaveApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ error: "Leave application not found" });
    }

    return res.json({ success: true, data: leave });
 } catch (error) {
    return res.status(500).json({error: "Failed"});
 }
}