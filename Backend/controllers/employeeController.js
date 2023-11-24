import { Employee } from "../models/employeeModel.js";
import { sendMail } from "../utils/sendMail.js";
import otpgenerator from "otp-generator";
import { sendToken } from "../utils/sendToken.js";

//? Employee Signup controller
export const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    let employee = await Employee.findOne({ email });

    //* Checking user has already exists or not with same Email
    if (employee) {
      return res.status(400).json({
        success: false,
        message: `Employee already exists with ${email}`,
      });5
    }

    //@ Generating OTP
    const otp = otpgenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    //* Creating new User
    employee = await Employee.create({
      full_name,
      email,
      password,
      otp,
      otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),
    });

    let subject = ["first Verify your account", "Email Verification code"];
    let html = employee;
    await sendMail(email, subject, html);

    //@Token Generator
    const token = employee.generateToken();
    const options = {
      httpOnly: true,
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
    };
    res
      .status(200)
      .cookie("otpToken", token, options)
      .json({
        success: true,
        message: `OTP sent to : ${email}, please verify your email first`,
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "500-Failed",
      error: error.message,
    });
  }
};

//@EMPLOYEE LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter all fields" });
    }

    //* Checking if user has verified or not
    const isVerified = await Employee.findOne({ email });
    // console.log(isVerified.email_verified);
    if (!isVerified.email_verified) {
      return res.status(400).json({
        success: false,
        message: "Your Email has not been verified, first verify your email id",
      });
    }
    // * Checking if user has registered or not
    let employee = await Employee.findOne({ email }).select("+password");
    if (!employee) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
    }
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
    }
    // const token = employee.generateToken();
    // const options = {
    //   httpOnly: true,
    //   expires: new Date(
    //     Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    //   ),
    // };
    // res.status(200).cookie("token", token, options).json({
    //   success: true,
    //   message: `Logged In`,
    // });
    employee = await Employee.findOne({ email });
    sendToken(res, employee, 200, "Logged in successfully");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//@ Employee Logout
export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()) })
      .json({ success: true, message: "Logout Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed", error: error.message });
  }
};

