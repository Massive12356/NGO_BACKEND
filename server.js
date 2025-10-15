import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Middlewares
app.use(cors());
app.use(express.json()); // parse JSON body

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("🚀 Twelve In Twelve Backend is Running");
});

// ✅ Contact Form Endpoint
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

    // --- 1️⃣ Send to NGO inbox ---
    await resend.emails.send({
      from: "Twelve In Twelve <onboarding@resend.dev>",
      to: "edwardmintah17@gmail.com",
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

    // --- 2️⃣ Auto-reply to sender ---
    await resend.emails.send({
      from: "Twelve In Twelve <onboarding@resend.dev>",
      to: email,
      subject: "Thank you for contacting Twelve In Twelve",
      html: `
        <p>Dear ${firstName},</p>
        <p>Thank you for reaching out to Twelve In Twelve. We’ve received your message about <strong>${subject}</strong>.</p>
        <p>Our team will review your request and get back to you soon.</p>
        <br/>
        <p>Warm regards,</p>
        <p><strong>The Twelve In Twelve Team</strong></p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully ✅",
    });
  } catch (error) {
    console.error("Resend email error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send email. Please try again later.",
    });
  }
});

// ✅ Port config (for local dev)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
