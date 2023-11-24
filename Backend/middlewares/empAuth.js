import jwt from "jsonwebtoken";
import { res_auth, res_catch } from "../global/response.js";
import { Employee } from "../models/employeeModel.js";
import { Employer } from "../models/employerModel.js";

export const isOtpAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      res_auth(res, "Token not found, Please signup again after 10-min")
      console.log(authorization)
    }
    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.emp = await Employee.findById(decoded._id);

    if (req.emp) {
      return next();
    } else {
      req.emp = await Employer.findById(decoded._id);
    }

    next();
  } catch (error) {
    res_catch(res, error);
  }
};
