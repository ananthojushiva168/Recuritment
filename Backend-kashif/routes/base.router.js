import express from "express";
const router = express.Router();

import employeeRouter from "./employee.routes.js"; //^ EMPLOYEE Router
import employerRouter from "./employer.routes.js"; //^ EMPLOYER Router
import adminRouter from "./admin.routes.js";  //^ ADMIN Router

//@ Employee Router
router.use("/employee", employeeRouter);

//@ Employer Router
router.use("/employer", employerRouter);

//@ Admin Router
router.use("/admin", adminRouter)

export default router;
