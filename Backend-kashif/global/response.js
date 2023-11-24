export const res_user = (res, message, token, user) => {
  let userDetails;
  if (user) {
    userDetails = {
      id: user._id,
      name: user.full_name,
      email: user.email,
      email_verified: user.email_verified,
    };
  } else {
    userDetails = user;
  }
  res
    .status(200)
    .json({ success: true, message: message, token: token, data: userDetails });
};
export const res_success = (res, message, data) => {
  res.status(200).json({ success: true, message: message, data: data });
};
export const res_failed = (res, message) => {
  res.status(400).json({ success: false, message: message });
};
export const res_catch = (res, error) => {
  res
    .status(500)
    .json({ success: false, error: error.message, message: "500 - Failed" });
};
export const res_auth = (res, message) => {
  res.status(401).json({ success: false, message: message });
};
