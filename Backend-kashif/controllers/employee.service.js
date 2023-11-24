import { Employee } from "../models/employeeModel.js";
import { sendMail } from "../utils/sendMail.js";
import { generateOtp } from "../utils/otpGenerator.js";
import {
  res_user,
  res_catch,
  res_failed,
  res_success,
} from "../global/response.js";
import cloudinary from "cloudinary";

//? Employee Signup
export const register = async (req, res) => {
  console.log(req.body)
  try {
    const { full_name, email, password, refferredBy } = req.body;

    let user = await Employee.findOne({ email })

    let datauser = await Employee.findOne({  })

    //* Checking user has already exists or not with same Email
    if (user) {
      return res_failed(res, `Employer already exists with ${email}`);
    }
    //@ Generating OTP
    let otp = generateOtp(6, true, false, false, false);

    console.log(otp)
    //* Creating new User
    user = await Employee.create({
      full_name,
      email,
      password,
      refferredBy,
      otp,
      otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),
    });

    let subject = ["Verify your email address", "Email Verification code"];
    await sendMail(otp, subject, user);

    const token = user.generateToken();
    // console.log(token)
    res_user(
      res,
      `OTP sent to : ${user.email}, please verify your email first`,
      token,
      user
    );
  } catch (error) {
    res_catch(res, error);
  }
};

//? Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const user = await Employee.findById(req.emp._id);
    //@ Generating OTP
    let otp = generateOtp(6, true, false, false, false);

    user.otp = otp;
    user.otp_expiry = new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000);
    await user.save();

    // const email = user.email;
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

//? Verify Employee
export const verify = async (req, res) => {
  try {
    const otp = req.body.otp;
    const user = await Employee.findById(req.emp._id);

    if (user.otp !== otp || user.otp_expiry < Date.now()) {
      return res_failed(res, "Invalid OTP or has been Expired");
    }
    //@ Generating Reffrence_id
    let ref = generateOtp(7, true, true, false, false);

    user.email_verified = true;
    user.reff_id = `INK23${ref}`;
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

//? EMPLOYEE LOGIN
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res_failed(res, "Please enter all fields");
    }

    // * Checking if user has registered or not
    let user = await Employee.findOne({ email }).select("+password");
    if (!user) {
      return res_failed(res, "Invalid Email or Password");
    }

    //* Checking Entered password is correct or not
    const isMatch = await user.comparePassword(password);
    console.log(isMatch)
    
        if (!isMatch) {
      return res_failed(res, "Invalid Email or Password");
    }

    //* Checking if user has verified or not
    const isVerified = await Employee.findOne({ email });
    // console.log(isVerified.email_verified);
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
    res_catch(res, error);
  }
};

//? Employee Logout
export const Logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()) })
      .json({ success: true, message: "Logout Successfully" });
  } catch (error) {
    res_catch(res, error);
  }
};

//? Forget Password
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res_failed(res, "Enter your email_id");
    }
    const user = await Employee.findOne({ email });
    if (!user) {
      return res_failed(res, "Invalid Email");
    }

    //@ Generating OTP
    let otp = generateOtp(6, true, false, false, false);

    user.reset_pass_otp = otp;
    user.reset_pass_otp_expiry = new Date(
      Date.now() + process.env.OTP_EXPIRE * 60 * 1000
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
    const user = await Employee.findById(req.emp._id).select("+password");
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

//? Password OTP
export const changePassword = async (req, res) => {
  try {
    const user = await Employee.findById(req.user._id);

    //@ Generating OTP
    let otp = generateOtp(6, true, false, false, false);

    user.reset_pass_otp = otp;
    user.reset_pass_otp_expiry = new Date(
      Date.now() + process.env.OTP_EXPIRE * 60 * 1000
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
    const user = await Employee.findById(req.user._id).select("+password");
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

//? getMyProfile1
export const getMyProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user._id);

    res_success(res, "Your profile", employee);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Update Profile Details
export const updateMyProfile = async (req, res) => {
  try {
    const user = await Employee.findByIdAndUpdate(
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

//? Add Experience
export const addExperience = async (req, res) => {
  try {
    const { company, duration, role } = req.body;
    if (!company || !duration || !role) {
      return res_failed(res, "Please enter all fields");
    }
    const user = await Employee.findById(req.user._id);
    user.experience.push({ company, duration, role });
    await user.save();

    res_success(res, "successfully added", user.experience);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Delete Experience
export const deleteExperince = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Employee.updateOne(
      { _id: req.user._id },
      { $pull: { experience: { _id: id } } }
    );
    if (user) {
      res_success(res, "Experience has removed", user.exp_description);
    } else {
      res_failed(res, "Error - delete failed");
    }
  } catch (error) {
    res_catch(res, error);
  }
};

//? Add Education details
export const addEducation = async (req, res) => {
  try {
    const { university, degree, passingYear } = req.body;

    const user = await Employee.findById(req.user._id);
    user.education.push({
      university,
      degree,
      passingYear,
    });
    await user.save();

    res_success(res, "successfully added", user.education);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Delete Education details
export const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Employee.updateOne(
      { _id: req.user._id },
      { $pull: { education: { _id: id } } }
    );
    if (user) {
      res_success(res, "Education has removed", user.education);
    } else {
      res_failed(res, "Error - remove failed");
    }
  } catch (error) {
    res_catch(res, error);
  }
};

//? UpdateSkills
export const updateSkills = async (req, res) => {
  try {
    const user = await Employee.findByIdAndUpdate(
      { _id: req.user._id },
      { $addToSet: { skills: req.body.skill } }
    );
    if (user) {
      res_success(res, `${req.body.skill} has addad`, user.skills);
    } else {
      res_failed(res, "Error - Add failed");
    }
  } catch (error) {
    res_catch(res, error);
  }
};

//? Delete Skills
export const deleteSkills = async (req, res) => {
  try {
    const { item } = req.params;
    const user = await Employee.updateOne(
      { _id: req.user._id },
      { $pull: { skills: item } }
    );
    if (user) {
      res_success(res, `${item} has deleted`, user.skills);
    } else {
      res_failed(res, "Error - Delete failed");
    }
  } catch (error) {
    res_catch(res, error);
  }
};

//? Update Profile picture
export const updateImage = async (req, res) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const user = await Employee.findById(req.user._id);
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
    // res_catch(res, error);
    res
      .status(500)
      .json({ error: error.message, message: "path not found error" });
  }
};

//? Delete Profile picture
export const deleteImage = async (req, res) => {
  try {
    const user = await Employee.findById(req.user._id);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar.public_id = "";
    user.avatar.url = "";
    await user.save();
    res_success(res, "profile deleted", user.avatar);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Update CV
export const updateCV = async (req, res) => {
  try {
    if (req.file) {
      console.log("found");
      console.log(req.file.path);
    } else {
      console.log("not found");
    }
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const user = await Employee.findById(req.user._id);
    let file = await user.cv.public_id;

    if (result) {
      if (!file) {
        user.cv.public_id = result.public_id;
        user.cv.url = result.secure_url;
      } else {
        await cloudinary.v2.uploader.destroy(user.cv.public_id);

        user.cv.public_id = result.public_id;
        user.cv.url = result.secure_url;
      }
    } else {
      res_failed(res, "Error - CV uploading failed");
    }

    await user.save();
    res_success(res, "CV has updated", user.cv);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Delete CV
export const deleteCV = async (req, res) => {
  try {
    const user = await Employee.findById(req.user._id);
    await cloudinary.v2.uploader.destroy(user.cv.public_id);

    user.cv.public_id = "";
    user.cv.url = "";
    await user.save();
    res_success(res, "CV has successfully deleted", user.cv);
  } catch (error) {
    res_catch(res, error);
  }
};

//? Update Banner picture
export const updateBanner = async (req, res) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const user = await Employee.findById(req.user._id);
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
    const user = await Employee.findById(req.user._id);
    await cloudinary.v2.uploader.destroy(user.banner_img.public_id);
    user.banner_img.public_id = "";
    user.banner_img.url = "";
    await user.save();
    res_success(res, "Banner image has successfully deleted", user.cv);
  } catch (error) {
    res_catch(res, error);
  }
};

//? DELETE EMPLOYEE
export const delProfile = async (req, res) => {
  try {
    //deleting employee profile
    const user = await Employee.findByIdAndRemove({ _id: req.user._id });
    res_user(
      res,
      "your account has been logged out and deleted succesfully",
      null,
      null
    );
  } catch (error) {
    res_catch(res, error);
  }
};

//? Send Request to admin
export const sendRequest = async (req, res) => {
  try {
    const user = await Employee.findById({ _id: req.user._id });
    if (!user) {
      res.send("User not found");
    }
    let subject = "To certified a user";
    for (let i = 0; i < user.notification.length; i++) {
      if (user.notification[i].subject === subject) {
        return res.send("You have already sent a request");
      }
    }
    user.request = true;
    user.notification.push({
      subject,
      message:
        "Your request for Verification has been sent to the Administrator",
      time: Date.now(),
      expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      display: true,
    });
    user.save();
    res.status(200).json({ message: "Request is sent!" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
