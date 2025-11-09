import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🚀 Health check
app.get("/", (req, res) => {
  res.send("🚀 Twelve In Twelve Backend is Running with Gmail SMTP");
});

// Create transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // secure SSL port
  secure: true,
  auth: {
    user: process.env.GMAIL_USER, // e.g., info@twelveintwelvelbg.org
    pass: process.env.GMAIL_APP_PASSWORD, // App password from Google
  },
});

// ✅ Verify transporter connection once
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ SMTP Server Ready to Send Emails");
  }
});

// Contact form endpoint
app.post("/send-email", async (req, res) => {
  try {
    const { firstName, lastName, email, organization, subject, message } =
      req.body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Please fill in all required fields.",
      });
    }

    console.log("📩 Received payload:", req.body);

    // 🔸 Gmail-safe "from" (you must send from your verified Gmail account)
    //    Use replyTo so that you can reply directly to the sender.
    const info = await transporter.sendMail({
      from: `"Twelve In Twelve" <${process.env.GMAIL_USER}>`,
      replyTo: email,
      to: process.env.GMAIL_USER, // your organization inbox
      subject: `New Contact: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${
          organization
            ? `<p><strong>Organization:</strong> ${organization}</p>`
            : ""
        }
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr />
        <p>This message was sent via the Twelve In Twelve website contact form.</p>
      `,
    });

    console.log("✅ Mail sent:", info.messageId, info.response);

    // Auto-reply to sender
    const autoReply = await transporter.sendMail({
      from: `"Twelve In Twelve" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Thank you for contacting Twelve In Twelve",
      html: `
        <p>Dear ${firstName},</p>
        <p>Thank you for reaching out to <strong>Twelve In Twelve</strong>. We’ve received your message about <strong>${subject}</strong>.</p>
        <p>Our team will review your request and get back to you soon.</p>
        <br/>
        <p>Warm regards,</p>
        <p><strong>The Twelve In Twelve Team</strong></p>
      `,
    });

    console.log("📨 Auto-reply sent:", autoReply.messageId, autoReply.response);

    res.status(200).json({
      success: true,
      message: "Email sent successfully ✅",
    });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ✅ Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
