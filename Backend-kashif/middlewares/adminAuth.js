import jwt from "jsonwebtoken";
import { res_auth, res_catch } from "../global/response.js";
import { Admin } from "../models/adminModel.js";

export const isAdminAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      res_auth(res, "Token not found, Please login first");
      console.log("auth " + authorization);
    }
    const token = authorization.split(" ")[1];
    console.log("token " + token);

    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded._id);
    // console.log(req.user._id)
    next();
  } catch (error) {
    res_catch(res, error);
    // res.status(500).json({ error: error.message, message: "auth error" });
  }
};
