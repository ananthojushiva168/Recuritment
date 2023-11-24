import { res_success, res_failed, res_catch } from "../global/response.js";
import { Admin } from "../models/adminModel.js";
import { Employee } from "../models/employeeModel.js";

export const adminLogin = async (req, res) => {
  try {
    const { userId, auth, secret } = req.body;
    if (!userId || !auth) {
      return res_failed(res, "Please enter all fields");
    }
    const Admin_secretKey = process.env.ADMIN_SECRET_KEY;
    // * Checking if Admin has registered or not
    let user = await Admin.findOne({ userId });
    if (!user) {
      return res_failed(res, "Not Found!, invalid userId or auth");
    }
    if (user.auth !== auth) {
      return res_failed(res, "Not Found!, invalid userId or auth");
    }
    const token = user.generateToken();
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token: token,
      data: user,
    });
  } catch (error) {
    res_catch(res, error);
  }
};

//? Find All Requested Employees
export const getRequestEmployees = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res_failed(res, "Admin not Authorized");
    }
    const employees = await Employee.find({ request: true });
    if (employees.length <= 0) {
      return res_success(res, "Employees Not Found", null);
    }
    res_success(res, "Employees Requests", employees);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Find all verified employees
export const verifiedEmployee = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res_failed(res, "Admin not Authorized");
    }
    const employees = await Employee.find({ isVerified: true });
    if (employees.length <= 0) {
      return res_failed(res, "Employees not found");
    }
    res_success(res, "Employees", employees);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Find Total Employees
export const totalEmployees = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res_failed(res, "Admin not Authorized");
    }
    const employees = await Employee.find({});
    if (employees.length <= 0) {
      return res_failed(res, "Employees not found");
    }
    res_success(res, "Employees", employees);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Accept Employees
export const acceptEmployee = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res_failed(res, "Admin not Authorized");
    }
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      res_failed("Employee not found");
    }
    let subject = "Employee is Verified";
    for (let i = 0; i < employee.notification.length; i++) {
      if (employee.notification[i].subject === subject) {
        return res_success(res, "You have already sent a request");
      }
    }
    employee.request = true;
    employee.notification.push({
      subject,
      message:
        "Your request for Verification has been Accepted by the Administrator",
      time: Date.now(),
      expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      display: true,
    });
    // employee.accept = true;
    employee.isVerified = true;
    employee.request = false;
    await employee.save();
    res_success(res, { message: "Accepted your request successfully" });
  } catch (error) {
    res_catch(500).json({ message: error.message });
  }
};

//? Decline Request
export const declineEmployee = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res_failed(res, "Admin not Authorized");
    }
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      res_failed("Employee not found");
    }
    let subject = "Request Declined";
    for (let i = 0; i < employee.notification.length; i++) {
      if (employee.notification[i].subject === subject) {
        return res_failed(res, "You have already sent a request");
      }
    }
    employee.request = true;
    employee.notification.push({
      subject,
      message:
        "Your request for Verification has been Declined by Administrator, You are not certified yet!",
      time: Date.now(),
      expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      display: true,
    });
    employee.request = false;
    await employee.save();
    res_failed({ message: "Request is Declined!" });
  } catch (error) {
    res_catch(500).json({ message: error.message });
  }
};
