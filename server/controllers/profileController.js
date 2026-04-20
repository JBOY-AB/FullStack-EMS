// Get profile
// Get /api/profile

import Employee from "../models/Employee.js";

export const getProfile = async (req, res) =>{
 try {
    const session = req.session;
    const employee = await Employee.findOne({
        userId: session.userId
    })
    if (!employee) {
        // Authenticated user does not have an employee profile-return admin profile
        return res.json({
            firstName: "Admin",
            lastName: "",
            email: session.email,
        })
    }

    return res.json(employee)
    
 } catch (error) {
    return res.status(500).json({ error: "Failed to fetch profile" });
 }
}

// update profile
// PUT /api/profile
export const updateProfile = async (req, res) =>{
    try {
        const session = req.session;
        const employee = await Employee.findOne({
        userId: session.userId
    })
    if (!employee) return res.status(404).json({error: "Employee profile not found"});
    if(employee.isDeleted) {
        return res.status(403).json({error: "Your account is deactivated. you cannot update your profile.",})
    }
        await Employee.findOneAndUpdate(employee._id, {
            bio: req.body.bio 
        })
        return res.json({success: true})
    } catch (error) {
        return res.status(500).json({ error: "Failed to update profile" });
    }
}

