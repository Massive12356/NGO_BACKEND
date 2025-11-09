import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function testEmail() {
  const info = await transporter.sendMail({
    from: `"Twelve In Twelve" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: "Test Email",
    text: "This is a test from your backend setup.",
  });
  console.log(info.response);
}

testEmail();
