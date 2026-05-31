import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Ticket from "./models/Ticket.js";

dotenv.config();

const app = express();

app.options("*", cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

/* ===== DATABASE ===== */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

/* ===== EMAIL ===== */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

/* ===== USER MODEL ===== */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Customer", "admin"], default: "Customer" },
});

const User = mongoose.model("User", userSchema);

/* ===== AI ANALYSIS ===== */
const analyzeComplaint = (complaint) => {
  const lower = complaint.toLowerCase();
  let sentiment = "Neutral";
  let priority = "Low";
  let category = "General";
  let aiReply = "Our support team will contact you shortly.";

  // Priority
  if (["refund", "payment", "angry", "damaged", "not responding", "worst", "cancelled", "double payment", "immediately", "urgent"].some(w => lower.includes(w))) {
    priority = "High";
  } else if (["late", "delay", "replacement", "support", "issue", "delivery", "problem"].some(w => lower.includes(w))) {
    priority = "Medium";
  }

  // Sentiment
  if (["angry", "worst", "frustrating", "bad", "not responding", "immediately", "terrible"].some(w => lower.includes(w))) {
    sentiment = "Angry";
  }

  // Category & Reply
  if (["refund", "money", "payment"].some(w => lower.includes(w))) {
    category = "Refund Issue";
    aiReply = "We sincerely apologize for the inconvenience. Your refund issue has been forwarded to our billing support team and will be resolved within 3-5 business days.";
  } else if (["delivery", "shipping", "arrive", "late"].some(w => lower.includes(w))) {
    category = "Delivery Issue";
    aiReply = "We apologize for the delivery delay. Our logistics team is checking your shipment status and will update you within 24 hours.";
  } else if (["wrong product", "damaged", "replacement"].some(w => lower.includes(w))) {
    category = "Product Issue";
    aiReply = "We are sorry about the damaged/wrong product. Our team will arrange a replacement or full refund within 48 hours.";
  } else if (["login", "account", "password"].some(w => lower.includes(w))) {
    category = "Account Issue";
    aiReply = "Our technical support team is reviewing your account issue and will assist you within 2 hours.";
  } else if (["app", "crash", "bug", "error"].some(w => lower.includes(w))) {
    category = "Technical Issue";
    aiReply = "We apologize for the technical issue. Our engineering team has been notified and is working on a fix.";
  }

  return { sentiment, priority, category, aiReply };
};

/* ===== REGISTER ===== */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.json({ success: false, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || "Customer" });

    res.json({ success: true, message: "Registration successful", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===== LOGIN ===== */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===== CREATE TICKET ===== */
app.post("/tickets", async (req, res) => {
  try {
    const { email, complaint, subject } = req.body;
    const { sentiment, priority, category, aiReply } = analyzeComplaint(complaint);

    const ticket = await Ticket.create({
      email, subject: subject || "Customer Complaint",
      complaint, sentiment, priority, category, aiReply, status: "Open"
    });

    // Send email (don't crash if email fails)
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "SmartDesk AI - Complaint Received",
        text: `Hello,\n\nYour complaint has been received.\n\nCategory: ${category}\nPriority: ${priority}\nSentiment: ${sentiment}\n\nAI Response:\n${aiReply}\n\nThank you,\nSmartDesk AI Support Team`,
      });
    } catch (emailError) {
      console.log("Email error (non-fatal):", emailError.message);
    }

    res.json({ success: true, message: "Ticket created successfully", ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===== GET ALL TICKETS (Admin) ===== */
app.get("/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===== GET MY TICKETS (Customer) ===== */
app.get("/tickets/my", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json({ success: false, message: "Email required" });
    const tickets = await Ticket.find({ email }).sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===== SEND REPLY EMAIL (Admin) ===== */
app.post("/tickets/:id/send-reply", async (req, res) => {
  try {
    const { reply } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.json({ success: false, message: "Ticket not found" });

    // Update reply in DB
    await Ticket.findByIdAndUpdate(req.params.id, { aiReply: reply });

    // Send email to customer
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: ticket.email,
        subject: `SmartDesk AI - Reply to your complaint`,
        text: `Hello,\n\nOur support team has reviewed your complaint and provided the following response:\n\n${reply}\n\nThank you for reaching out to us.\n\nBest regards,\nSmartDesk AI Support Team`,
      });
    } catch (emailError) {
      console.log("Email error (non-fatal):", emailError.message);
    }

    res.json({ success: true, message: "Reply sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===== RESOLVE TICKET ===== */
app.put("/tickets/:id/resolve", async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: "Resolved" }, { new: true });
    res.json({ success: true, message: "Ticket resolved", ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===== DELETE TICKET ===== */
app.delete("/tickets/:id", async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Ticket deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===== ANALYTICS ===== */
app.get("/analytics", async (req, res) => {
  try {
    const [total, high, medium, low, resolved, open, angry] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ priority: "High" }),
      Ticket.countDocuments({ priority: "Medium" }),
      Ticket.countDocuments({ priority: "Low" }),
      Ticket.countDocuments({ status: "Resolved" }),
      Ticket.countDocuments({ status: "Open" }),
      Ticket.countDocuments({ sentiment: "Angry" }),
    ]);

    res.json({ success: true, totalTickets: total, highPriority: high, mediumPriority: medium, lowPriority: low, resolvedTickets: resolved, openTickets: open, angryCustomers: angry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===== HOME ===== */
app.get("/", (req, res) => res.send("SmartDesk AI API Running 🚀"));

/* ===== START ===== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
