import dns from "dns";
import mongoose from "mongoose";

const connectDB = async () => {
    // Try multiple DNS servers for reliability
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is not defined in .env");
    }

    console.log("Connecting to MongoDB...");
    console.log("URI:", uri.replace(/:[^:@]+@/, ":****@")); // Hide password in logs

    try {
        mongoose.connection.on('connected', () => console.log("✅ Database connected"));
        mongoose.connection.on('error', (err) => console.error("❌ Database error:", err));
        
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ MongoDB connection established");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        console.error("Error code:", error.code);
        console.error("Error name:", error.name);
        throw error;
    }
}

export default connectDB