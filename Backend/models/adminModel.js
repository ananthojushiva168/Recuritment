import mongoose from "mongoose";

import jwt from "jsonwebtoken"

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
      required: true,

    },
  },
  { timestamps: true }
);

//@ Generating Token

adminSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
  });
};


const Admin = mongoose.model("Admin", adminSchema);

export { Admin };

