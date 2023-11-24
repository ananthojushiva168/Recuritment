import express from "express";
//@ controllers
import {
  register,
  resendOtp,
  verify,
  Login,
  Logout,
  forgetPassword,
  changePassword,
  resetPassword,
  updatePassword,
  getMyProfile,
  updateMyProfile,
  addExperience,
  deleteExperince,
  addEducation,
  deleteEducation,
  updateSkills,
  deleteSkills,
  updateImage,
  deleteImage,
  updateCV,
  deleteCV,
  updateBanner,
  deleteBanner,
  delProfile,
  sendRequest
} from "../controllers/employee.service.js";

//@ Upload Image and Files
import { uploadImage, uploadCV, uploadBannerImage } from "../utils/multer.js";

//@ Middlewares
import { isOtpAuth } from "../middlewares/empAuth.js";
import { isAuthenticated } from "../middlewares/Authenticated.js";

const employeeRouter = express.Router();

//? Authentication Routes
employeeRouter.post("/register", register);
employeeRouter.patch("/resend", isOtpAuth, resendOtp);
employeeRouter.post("/verify", isOtpAuth, verify);
employeeRouter.post("/login", Login);
employeeRouter.get("/logout", Logout);

//? Forget / Reset Password Routes
employeeRouter.patch("/forgetpass", forgetPassword);
employeeRouter.patch("/resetpass", isOtpAuth, resetPassword);
employeeRouter.patch("/changepass", isAuthenticated, changePassword);
employeeRouter.patch("/updatepass", isAuthenticated, updatePassword);

//? Profile Routes
employeeRouter.get("/getprofile", isAuthenticated, getMyProfile);
employeeRouter.patch("/updateprofile", isAuthenticated, updateMyProfile);
employeeRouter.patch("/updateimg", isAuthenticated, uploadImage.single('image'), updateImage);
employeeRouter.delete("/deleteimg", isAuthenticated, deleteImage);
employeeRouter.patch("/updatecv", isAuthenticated,uploadCV.single("cv_file"), updateCV);
employeeRouter.delete("/deletecv", isAuthenticated, deleteCV);
employeeRouter.patch("/updatebanner", isAuthenticated, uploadBannerImage.single("bannerImage"), updateBanner);
employeeRouter.delete("/deletebanner", isAuthenticated, deleteBanner);
employeeRouter.delete("/deleteEMPprofile", isAuthenticated, delProfile);

//? Update Technical details
employeeRouter.post("/addExperince", isAuthenticated, addExperience);
employeeRouter.delete("/deleteExperince/:id", isAuthenticated, deleteExperince);
employeeRouter.post("/addEducation", isAuthenticated, addEducation);
employeeRouter.delete("/deleteEducation/:id", isAuthenticated, deleteEducation);
employeeRouter.post("/updateSkills", isAuthenticated, updateSkills);
employeeRouter.delete("/deleteSkills/:item", isAuthenticated, deleteSkills);

//? Request for Verification
employeeRouter.patch("/send-request", isAuthenticated, sendRequest);

export default employeeRouter;
