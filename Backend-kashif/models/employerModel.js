import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const employerSchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: [true, "Please enter a company name"],
    },
    full_name: {
      type: String,
      required: [true, "Please enter employer name"],
    },
    email: {
      type: String,
      unique: [true, "This Email has already exists"],
      required: [true, "Please enter an Email"],
    },
    password: {
      type: String,
      minlength: [8, "Password must be atleast 8 characters"],
      required: [true, "Please enter Password"],
      select: false,
    },

    //* For otp Verification
    otp: String,
    otp_expiry: Date,
    email_verified: {
      type: Boolean,
      default: false,
    },

    //* Profile, BannerImage
    avatar: {
      public_id: String,
      url: String,
    },
    banner_img: {
      public_id: String,
      url: String,
    },

    designation: {
      type: String,
    },
    location: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    description: {
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
  },
  { timestamps: true }
);
//@ Hashing Password
employerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

//@ Compairing Password
employerSchema.methods.comparePassword = async function (password) {
  console.log(typeof password);
  console.log(this.password, "this");

  return await bcrypt.compare(password, this.password);
};

//@ Generating Token
employerSchema.methods.generateToken = function (){
  return jwt.sign({_id: this._id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
  })
}


//@ Hashing Password
employerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});



//@ Generating Token

employerSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
  });
};

const Employer = mongoose.model("Employer", employerSchema);

export { Employer };
