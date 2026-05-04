import "dotenv/config";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";


const TemporaryPassword = "admin123";

async function registerAdmin() {
    try {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

        if(!ADMIN_EMAIL){
            console.error("ADMIN_EMAIL is not defined in .env file")
            process.exit(1);
        }

        await connectDB()
        const existingAdmin = await User.findOne({email: process.env.ADMIN_EMAIL});

        if(existingAdmin){
            console.log("User already exist has role:", existingAdmin.role);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(TemporaryPassword, 10)

         const admin = await User.create({
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: "ADMIN",
        })

        console.log("Admin user created")
        console.log("\nemail:", admin.email);
        console.log("Temporary password:", TemporaryPassword);
        console.log("\nchange the password after login");
        process.exit(0);


    } catch (error) {
        console.error("Seed failed:", error);
    }
}

registerAdmin();