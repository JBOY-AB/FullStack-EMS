import dns from "dns";
import mongoose from "mongoose";

const connectDB = async () => {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is not defined in .env");
    }

    try {
        mongoose.connection.on('connected', () => console.log("Database connected"));
        await mongoose.connect(uri);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        throw error;
    }
}

export default connectDB