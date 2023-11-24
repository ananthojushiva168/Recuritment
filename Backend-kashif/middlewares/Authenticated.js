import jwt from "jsonwebtoken";
import { res_auth, res_catch } from "../global/response.js";
import { Employee } from "../models/employeeModel.js";
import { Employer } from "../models/employerModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      res_auth(res, "Token not found, Please login first");
      console.log("auth " + authorization);
    }
    const token = authorization.split(" ")[1];
    console.log("token " + token);

    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Employee.findById(decoded._id);
    // console.log(req.user._id)
    if (req.user) {
      return next();
    } else {
      req.user = await Employer.findById(decoded._id);
    }

    next();
  } catch (error) {
    res_catch(res, error);
    // res.status(500).json({ error: error.message, message: "auth error" });
  }
};
