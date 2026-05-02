import dns from "dns";
import mongoose from "mongoose";

const connectDB = async () => {
    // Only set DNS servers in non-serverless environments
    if (!process.env.VERCEL) {
        dns.setServers(["8.8.8.8", "8.8.4.4"]);
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is not defined");
    }

    try {
        // Configure mongoose for serverless
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            bufferCommands: false, // Disable mongoose buffering
            bufferMaxEntries: 0, // Disable mongoose buffering
        });

        console.log("Database connected");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        throw error;
    }
}

export default connectDB