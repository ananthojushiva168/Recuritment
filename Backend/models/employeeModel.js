import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const employeeSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, "Please enter your Full name"],
    },
    email: {
      type: String,
      unique: [true, "This Email has already exists"],
      required: [true, "Please enter an Email"],
    },
    password: {
      type: String,
      required: [true, "Please enter Password"],
      minlength: [8, "Password must be atleast 8 characters"],
      select: false,
    },

    role: String,

    reff_id: String,
    refferredBy: {
      type:String
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "User",
    },

    refferredTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    //* For otp Verification
    otp: String,
    otp_expiry: Date,
    email_verified: {
      type: Boolean,
      default: false,
    },

    //* Profile, BannerImage, cv
    avatar: {
      public_id: String,
      url: String,
    },
    banner_img: {
      public_id: String,
      url: String,
    },
    cv: {
      public_id: String,
      url: String,
    },

    phone: {
      type: Number,
      default: null,
    },
    company: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },

    about_me: {
      type: String,
      default: "",
    },

    total_experience: {
      type: Number,
      default: null,
    },
    experience: [
      {
        company: { type: String, default: "Company Name" },
        duration: { type: String, default: "0 years" },
        role: { type: String, default: "worked as" },
        createdAt: { type: Date, default: Date.now() },
      },
    ],
    education: [
      {
        university: { type: String, default: "university name" },
        degree: { type: String, default: "degree name" },
        passingYear: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now() },
      },
    ],
    skills: [{ type: String }],
    ctc: {
      type: String,
    },
    notice_period: {
      type: String,
      default: null,
    },
    job_type: {
      type: String,
      default: "",
    },
    work_mode: {
      type: String,
      default: "",
    },

    //* Forget / Reset password
    reset_pass_otp: String,
    reset_pass_otp_expiry: Date,

    isVerified: {
      type: Boolean,
      default: false,
    },

    request: {
      type: Boolean,
      default: false,
    },
    notification: [
      {
        subject: { type: String, unique: true },
        message: String,
        time: Date,
        expire: Date,
        display: Boolean,
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamp: true }
);

//@ Hashing Password
employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

//@ Compairing Password
employeeSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//@ Generating Token
employeeSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
  });
};

const Employee = mongoose.model("Employee", employeeSchema);
export { Employee };
