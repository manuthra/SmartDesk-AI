import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  email: { type: String, required: true },
  subject: { type: String, default: "Customer Complaint" },
  complaint: { type: String, required: true },
  sentiment: { type: String, enum: ["Angry", "Neutral", "Happy"], default: "Neutral" },
  priority: { type: String, enum: ["High", "Medium", "Low"], default: "Low" },
  category: { type: String, default: "General" },
  aiReply: { type: String, default: "Our support team will contact you shortly." },
  status: { type: String, enum: ["Open", "Resolved"], default: "Open" },
}, { timestamps: true });

export default mongoose.model("Ticket", ticketSchema);
