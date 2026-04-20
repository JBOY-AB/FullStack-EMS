import {Router} from "express";
import { protect, protectAdmin } from "../middleware/auth.js";
import { createPayslip, getPayslipById, getPayslips } from "../controllers/payslipController.js";


const payslipsRouter = Router();
payslipsRouter.post("/", protect, protectAdmin, createPayslip)
payslipsRouter.get("/", protect, getPayslips)
payslipsRouter.get("/:id", protect, getPayslipById)

export default payslipsRouter;
