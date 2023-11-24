import { createTransport } from "nodemailer";

export const sendMail = async (OTP, subject, user) => {
 
  const transport = createTransport({
    service: "gmail",
    secureConnection:true,
    auth: {
      user: process.env.Auth_USER,
      pass: process.env.Auth_PASS,
    },
  });

  // console.log(user.email)
  const mailOption = {
    from: process.env.Auth_USER,
    to: user.email,
    subject: subject[0],
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
      <div class="template">
      <h3>Hi ${user.full_name}</h3>
      <h2>${subject[1]}</h2>
      <h1>${OTP}</h1>
      <p>Do not share this otp with anyone.</p>

      <p>If you didn't request this, you can ignore this email.</p>
      <div class="greeting">
        <p>Thanks,</p>
        <h3>The Inkprog team</h3>
      </div>
    </div>
      </body>
    </html>
    `,
  };

  transport.sendMail(mailOption, (error, info) => {
    if (error) {
      console.log(`Error : ${error.message}`);
    } else {
      res.status(200).send("email sent" + info.response);
      console.log("success");
    }
  });
};
