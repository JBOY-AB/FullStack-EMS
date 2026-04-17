import { Router } from "express"
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from "../controllers/EmployeeController";
import { protect, protectAdmin } from "../middleware/auth";


const employeesRouter = Router();

employeesRouter.get("/",protect, protectAdmin, getEmployees)
employeesRouter.post("/",protect, protectAdmin,createEmployee)
employeesRouter.get("/:id", protect, protectAdmin, updateEmployee)
employeesRouter.get("/id",protect, protectAdmin, deleteEmployee)

export default employeesRouter;