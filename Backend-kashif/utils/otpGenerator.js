import otpgenerator from "otp-generator";

//? OTP Generator
export const generateOtp = (length, dgt, up, lw, spc) => {
    let otp = otpgenerator.generate(length, {
      digits: dgt,
      upperCaseAlphabets: up,
      lowerCaseAlphabets: lw,
      specialChars: spc,
    });
    return otp;
  };