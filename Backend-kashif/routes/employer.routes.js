import express from "express";

import {
  register,
  resendOtp,
  verify,
  login,
  logout,
  forgetPassword,
  changePassword,
  resetPassword,
  updatePassword,
  updateImage,
  deleteImage,
  updateBanner,
  deleteBanner,
  getMyProfile,
  updateMyProfile
} from "../controllers/employer.service.js";

//@ Upload Image and Files
import { uploadImage, uploadBannerImage } from "../utils/multer.js";

import { isOtpAuth } from "../middlewares/empAuth.js";
import { isAuthenticated } from "../middlewares/Authenticated.js";

const employerRouter = express.Router();

//? Authentication Routes
employerRouter.post("/register", register);
employerRouter.patch("/resend", isOtpAuth, resendOtp);
employerRouter.post("/verify", isOtpAuth, verify);
employerRouter.post("/login", login);
employerRouter.get("/logout", logout);

//? Forget / Reset Password Routes
employerRouter.patch("/forgetpass", forgetPassword);
employerRouter.patch("/resetpass", isOtpAuth, resetPassword);
employerRouter.patch("/changepass", isAuthenticated, changePassword);
employerRouter.patch("/updatepass", isAuthenticated, updatePassword);

//? Profile Routes
employerRouter.get("/getprofile", isAuthenticated, getMyProfile);
employerRouter.patch("/updateprofile", isAuthenticated, updateMyProfile);
employerRouter.patch("/updateimg", isAuthenticated, uploadImage.single('image'), updateImage);
employerRouter.delete("/deleteimg", isAuthenticated, deleteImage);
employerRouter.patch("/updatebanner", isAuthenticated, uploadBannerImage.single("bannerImage"), updateBanner);
employerRouter.delete("/deletebanner", isAuthenticated, deleteBanner);

export default employerRouter;
