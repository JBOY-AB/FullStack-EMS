import { Router } from "express"
import multer from "multer";
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from "../controllers/employeeController.js";
import { protect, requirePasswordChanged, protectAdmin } from "../middleware/auth.js";


const employeesRouter = Router();
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 2 * 1024 * 1024 },
	fileFilter: (_req, file, callback) => {
		if (!file.mimetype.startsWith("image/")) {
			return callback(new Error("Profile picture must be an image"));
		}
		callback(null, true);
	},
});
const uploadProfilePicture = (req, res, next) => {
	upload.single("profilePicture")(req, res, (error) => {
		if (error) {
			return res.status(400).json({
				error: error.code === "LIMIT_FILE_SIZE"
					? "Profile picture must be 2 MB or smaller"
					: error.message,
			});
		}
		next();
	});
};

employeesRouter.get("/", protect, requirePasswordChanged, protectAdmin, getEmployees)
employeesRouter.post("/", protect, requirePasswordChanged, protectAdmin, uploadProfilePicture, createEmployee)
employeesRouter.put("/:id", protect, requirePasswordChanged, protectAdmin, uploadProfilePicture, updateEmployee)
employeesRouter.delete("/:id", protect, requirePasswordChanged, protectAdmin, deleteEmployee)

export default employeesRouter;