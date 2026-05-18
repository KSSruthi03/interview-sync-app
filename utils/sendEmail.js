import nodemailer from "nodemailer";
import dotenv from "dotenv";
    dotenv.config();
// Nodemailer transporter
const transporter = nodemailer.createTransport({

  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },

});
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);

// verify transporter
transporter.verify((error, success) => {

  if (error) {

    console.log("❌ Email server error:", error);

  } else {

    console.log("✅ Email server ready");

  }

});

// reusable send email function
const sendEmail = async ({ to, subject, text, html }) => {

  try {

    const mailOptions = {

      from: `"InterviewSync" <${process.env.EMAIL_USER}>`,

      to,

      subject,

      text,

      html,

    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);

    return info;

  } catch (error) {

    console.log("❌ Failed to send email:", error);

    throw error;

  }

};

export default sendEmail;