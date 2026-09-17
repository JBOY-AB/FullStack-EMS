import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    employeeId: {type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true},
    date: {type: Date, required: true},
    checkIn: {type: Date, default: null},
    checkOut: {type: Date, default: null},
    status: {type: String, enum: ["PRESENT", "ABSENT", "LATE"], default: "PRESENT"},
    workingHours: {type: Number, default: null},
    dayType: {type: String, enum: ["Full Day", "Three Quarter Day", "Half Day", "Short Day"], default: null},

    // ----- Webcam attendance verification (attached at clock-in) -----
    verificationMethod: {type: String, enum: ["webcam", "manual", "none"], default: "none"},
    verificationStatus: {type: String, enum: ["verified", "unverified", "failed"], default: "unverified"},
    verifiedAt: {type: Date, default: null},
    // The captured frame is kept out of every default query (select:false) and
    // is only ever returned through the authenticated admin image endpoint.
    verificationImage: {type: Buffer, select: false},
    verificationImageType: {type: String, default: null},
    // Cheap flag so list views can show "View Verification" without loading the
    // image buffer; the retention job flips it back to false when it strips the image.
    hasVerificationImage: {type: Boolean, default: false},
    attendanceSessionId: {type: mongoose.Schema.Types.ObjectId, ref: "AttendanceSession", default: null},
    }, {timestamps:true })

    attendanceSchema.index({employeeId: 1, date: 1}, {unique: true})
    

    const Attendance = mongoose.models.Attendance || mongoose.model("Attendance",
         attendanceSchema)

export default Attendance;         