import express from "express";
import { acceptEmployee, adminLogin, declineEmployee, getRequestEmployees, totalEmployees, verifiedEmployee } from "../controllers/admin.service.js";
import { isAdminAuth } from "../middlewares/adminAuth.js";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/getrequest", isAdminAuth, getRequestEmployees);
adminRouter.get("/verifiedemp", isAdminAuth, verifiedEmployee);
adminRouter.get("/totalemployees", isAdminAuth, totalEmployees);
adminRouter.patch("/accept-request/:id", isAdminAuth, acceptEmployee);
adminRouter.patch("/decline/:id", isAdminAuth, declineEmployee);

export default adminRouter;
