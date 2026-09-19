import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

// login for employee and admin
// POST / api/login

export const login = async (req, res) => {
    try {
        const {email, password, role_type } = req.body;
        if(!email || !password){
            return res.status(400).json({error: "Email and password are invalid"});
        }

        const user = await User.findOne({email})
        if(!user) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        if(user.isDisabled) {
            return res.status(401).json({error: "This account has been disabled"});
        }

        if(role_type === "admin" && user.role !== "ADMIN"){
            return res.status(401).json({error: "Not authorised as admin"});
        }

        if(role_type === "employee" && user.role !== "EMPLOYEE"){
            return res.status(401).json({error: "Not authorised as employee "});
        }

        const isValid = await bcrypt.compare(password, user.password)
        if(!isValid){
            return res.status(401).json({ error: "Invalid credentials "});
        }

        const payload = {
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "7d"});

        // mustChangePassword is returned to the client but kept OUT of the
        // signed token so it can't go stale after the password is changed.
        return res.json({
            user: { ...payload, mustChangePassword: user.mustChangePassword },
            token,
        })

    }catch (error) {
         console.error("Login error:", error);
         return res.status(500).json({error: "Login failed"});
    }
}

// get session for employee and admin
// Get / api/auth/session

export const session = async (req, res) =>{
     // read the flag fresh from the DB so it is authoritative even right
     // after the employee changes their password
     const user = await User.findById(req.session.userId)
         .select("email role mustChangePassword");

     if (!user) {
         return res.status(401).json({ error: "Unauthorized" });
     }

     return res.json({
         user: {
             userId: user._id.toString(),
             role: user.role,
             email: user.email,
             mustChangePassword: user.mustChangePassword,
         },
     })
}

// change password for employee and admin
// post /api/auth/change-password
export const changePassword = async (req, res) =>{
    try {
        const session = req.session;
        const {currentPassword, newPassword, confirmPassword } = req.body;

        const user = await User.findById(session.userId)
        if(!user) return res.status(404).json({error: "User not found"});

        if(!newPassword || newPassword.length < 6){
            return res.status(400).json({error: "New password must be at least 6 characters"});
        }

        // confirmation must match when the client sends it
        if(confirmPassword !== undefined && confirmPassword !== newPassword){
            return res.status(400).json({error: "Passwords do not match"});
        }

        // On a forced first-login change the employee has only just authenticated
        // with the temporary password, so currentPassword is optional. For a normal
        // Settings change it stays required and is verified.
        if(!user.mustChangePassword){
            if(!currentPassword){
                return res.status(400).json({error: "Current password is required"});
            }
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if(!isValid) return res.status(400).json({ error: "Current password is incorrect"});
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(session.userId, {password: hashed, mustChangePassword: false})
        return res.json({ success: true});

    } catch (error) {
        return res.status(500).json({error: "Failed to change password"});
    }
}