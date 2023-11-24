import { Employer } from "../models/employerModel.js";
import { sendMail } from "../utils/sendMail.js";
import { generateOtp } from "../utils/otpGenerator.js";
import {
  res_user,
  res_catch,
  res_failed,
  // res_success,
} from "../global/response.js";

//? Employer Signup
export const register = async (req, res) => {
  try {
    const { company_name, full_name, email, password } = req.body;

    let user = await Employer.findOne({ email });

    //* Checking user has already exists or not with same Email
    if (user) {
      return res_failed(res, `Employer already exists with ${email}`);
    }

    //@ Generating OTP
    let otp = generateOtp(6, true, false, false, false);

    //* Creating new User
    user = await Employer.create({
      company_name,
      full_name,
      email,
      password,
      otp,
      otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),
    });

    let subject = ["Verify your email address", "Email Verification code"];
    await sendMail(otp, subject, user);

    const token = user.generateToken();
    res_user(
      res,
      `OTP sent to : ${user.email}, please verify your email first`,
      token,
      null
    );
  } catch (error) {
    res_catch(res, error);
  }
};

//? Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const user = await Employer.findById(req.emp._id);
    //@ Generating OTP
    let otp = generateOtp(6, true, false, false, false);

    user.otp = otp;
    user.otp_expiry = new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000);
    await user.save();

    let subject = ["Verify your email address", "Email Verification code"];
    await sendMail(otp, subject, user);

    const token = user.generateToken();
    res_user(
      res,
      `OTP sent to : ${email}, please verify your email first`,
      token,
      null
    );
  } catch (error) {
    res_catch(res, error);
  }
};

//? Verify Employer
export const verify = async (req, res) => {
  try {
    const otp = req.body.otp;
    const user = await Employer.findById(req.emp._id);

    if (user.otp !== otp || user.otp_expiry < Date.now()) {
      return res_failed(res, "Invalid OTP or has been Expired");
    }

    user.email_verified = true;
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    //^ if Directly want to make user login after Verification
    const token = user.generateToken();
    res_user(
      res,
      `Welcome ${user.full_name}, Logged in successfully`,
      token,
      user
    );
  } catch (error) {
    res_catch(res, error);
  }
};

//? Employer LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res_failed(res, "Please enter all fields");
    }

    //* Checking if user has registered or not
    let user = await Employer.findOne({ email }).select("+password");
    console.log(user.password, "password");

    if (!user) {
      return res_failed(res, "Invalid Email ");
    }

    //* Checking Entered password is correct or not
    const isMatch = await user.comparePassword(password);
    console.log(isMatch);
    if (!isMatch) {
      return res_failed(res, "Invalid Email or Password");
    }

    //* Checking if user has verified or not
    const isVerified = await Employer.findOne({ email });
    if (!isVerified.email_verified) {
      return res_failed(
        res,
        "Your Email has not been verified, first verify your email id"
      );
    }

    const token = user.generateToken();
    res_user(
      res,
      `Welcome ${user.full_name}, Logged in successfully`,
      token,
      user
    );
  } catch (error) {
    res_catch(res, error, "internal server error");
  }
};

//? Employer Logout
export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()) })
      .json({ success: true, message: "Logout Successfully" });
  } catch (error) {
    res_catch(res, error, "internal server error");
  }
};

//? Forget Password
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res_failed(res, "Enter your email_id");
    }

    const user = await Employer.findOne({ email });
    if (!user) {
      return res_failed(res, "Invalid Email");
    }
    //@ Generating OTP
    let otp = generateOtp(6, true, false, false, false);

    user.reset_pass_otp = otp;
    user.reset_pass_otp_expiry = new Date(
      Date.now() + process.env.OTPToken_EXPIRE * 60 * 1000
    );
    await user.save();

    let subject = [
      "OTP to update your password",
      "Use this OTP to Reset Password",
    ];
    await sendMail(otp, subject, user);

    const token = user.generateToken();
    res_user(
      res,
      `OTP sent to : ${user.email}, use it to reset Password`,
      token,
      null
    );
  } catch (error) {
    res_catch(res, error);
  }
};

//? Reset Password
export const resetPassword = async (req, res) => {
  try {
    const user = await Employer.findById(req.emp._id).select("+password");
    const { otp, newPassword, confPassword } = req.body;

    if (!otp || !newPassword || !confPassword) {
      return res_failed(res, "Please enter all fields");
    }

    if (
      user.reset_pass_otp !== otp ||
      user.reset_pass_otp_expiry < Date.now()
    ) {
      return res_failed(res, "Invalid OTP or has been Expired");
    }

    if (newPassword !== confPassword) {
      return res_failed(res, "Confirm password is wrong");
    }

    user.password = confPassword;
    user.reset_pass_otp = null;
    user.reset_pass_otp_expiry = null;
    await user.save();

    res_user(
      res,
      "Password has Updated, Login again with new password",
      undefined,
      null
    );
  } catch (error) {
    res_catch(res, error);
  }
};

//? Password Change
export const changePassword = async (req, res) => {
  try {
    const user = await Employer.findById(req.user._id);

    //@ Generating OTP
    let otp = generateOtp(6, true, false, false, false);

    user.reset_pass_otp = otp;
    user.reset_pass_otp_expiry = new Date(
      Date.now() + process.env.OTPToken_EXPIRE * 60 * 1000
    );
    await user.save();

    let subject = [
      "OTP to update your password",
      "Use this OTP to change Password",
    ];
    await sendMail(otp, subject, user);

    res_success(
      res,
      `OTP sent to : ${user.email}, use it to change Password`,
      null
    );
  } catch (error) {
    res_catch(res, error);
  }
};

//? Update Password
export const updatePassword = async (req, res) => {
  try {
    const user = await Employer.findById(req.user._id).select("+password");
    const { otp, newPassword, confPassword } = req.body;

    if (!otp || !newPassword || !confPassword) {
      return res_failed(res, "Please enter all fields");
    }

    if (
      user.reset_pass_otp !== otp ||
      user.reset_pass_otp_expiry < Date.now()
    ) {
      return res_failed(res, "Invalid OTP or has been Expired");
    }

    if (newPassword !== confPassword) {
      return res_failed(res, "Confirm password is wrong");
    }

    user.password = confPassword;
    user.reset_pass_otp = null;
    user.reset_pass_otp_expiry = null;

    await user.save();

    res_user(
      res,
      "Password has Updated, Login again with new password",
      undefined,
      null
    );
  } catch (error) {
    return res_catch(res, error);
  }
};

//? getMyProfile
export const getMyProfile = async (req, res) => {
  try {
    const user = await Employer.findById(req.user._id);

    res_success(res, "Your profile", user);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Update Profile Details
export const updateMyProfile = async (req, res) => {
  try {
    const user = await Employer.findByIdAndUpdate(
      { _id: req.user._id },
      req.body,
      {
        new: true,
      }
    );
    res_success(res, "successfully updated", user);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Update Profile picture
export const updateImage = async (req, res) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const user = await Employer.findById(req.user._id);
    let image = await user.avatar.public_id;
    if (result) {
      if (!image) {
        user.avatar.public_id = result.public_id;
        user.avatar.url = result.secure_url;
      } else {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);

        user.avatar.public_id = result.public_id;
        user.avatar.url = result.secure_url;
      }
    } else {
      res_failed(res, "Error - profile update failed");
    }

    await user.save();
    res_success(res, "profile Updated", user.avatar);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Delete Profile picture
export const deleteImage = async (req, res) => {
  try {
    const user = await Employer.findById(req.user._id);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar.public_id = "";
    user.avatar.url = "";
    await user.save();
    res_success(res, "profile deleted", user.avatar);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Update Banner picture
export const updateBanner = async (req, res) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const user = await Employer.findById(req.user._id);
    let image = await user.banner_img.public_id;
    if (result) {
      if (!image) {
        user.banner_img.public_id = result.public_id;
        user.banner_img.url = result.secure_url;
      } else {
        await cloudinary.v2.uploader.destroy(user.banner_img.public_id);

        user.banner_img.public_id = result.public_id;
        user.banner_img.url = result.secure_url;
      }
    } else {
      res_failed(res, "Error - update banner image failed");
    }

    await user.save();
    res_success(res, "Banner Image has Updated", user.banner_img);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Delete Banner Image
export const deleteBanner = async (req, res) => {
  try {
    const user = await Employer.findById(req.user._id);
    await cloudinary.v2.uploader.destroy(user.banner_img.public_id);
    user.banner_img.public_id = "";
    user.banner_img.url = "";
    await user.save();
    res_success(res, "Banner image has successfully deleted", user.cv);
  } catch (error) {
    res_catch(res, error);
  }
};
