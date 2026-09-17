import {Router} from "express";
import { protect, protectAdmin, requirePasswordChanged } from "../middleware/auth.js";
import { createPayslip, getPayslipById, getPayslips } from "../controllers/payslipController.js";


const payslipsRouter = Router();
payslipsRouter.post("/", protect, requirePasswordChanged, protectAdmin, createPayslip)
payslipsRouter.get("/", protect, requirePasswordChanged, getPayslips)
payslipsRouter.get("/:id", protect, requirePasswordChanged, getPayslipById)

export default payslipsRouter;
