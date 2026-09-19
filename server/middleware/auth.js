import jwt from "jsonwebtoken"
import User from "../models/User.js";

export const protect = (req,res, next)=> {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({error: "Unauthorized"});
        }
        const token = authHeader.split(" ")[1];
        const session = jwt.verify(token, process.env.JWT_SECRET)

        if(!session){
            return res.status(401).json({error: "Unauthorized"});
        }
        req.session = session;
        next()
    } catch (error) {
        return res.status(401).json({error: "Unauthorized"});
    }
}

export const protectAdmin = (req, res, next)=> {
    if(req?.session?.role !== "ADMIN") {
        return res.status(403).json({error: "Admin access required"})
    }
    next()
}

// Blocks access to normal functionality while the user still has a
// temporary password. Enforced server-side so it can't be bypassed by
// calling an endpoint directly. Must run after `protect`.
export const requirePasswordChanged = async (req, res, next) => {
    try {
        const user = await User.findById(req.session?.userId).select("mustChangePassword");
        if (user?.mustChangePassword) {
            return res.status(403).json({
                error: "PASSWORD_CHANGE_REQUIRED",
                mustChangePassword: true,
            });
        }
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
}