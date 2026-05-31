"use client";

import { useEffect, useState } from "react";
import { Menu, Bot, Send } from "lucide-react";
import CustomerSidebar from "../components/CustomerSidebar";

const API = "";

export default function CreateTicketPage() {
  const [subject, setSubject] = useState("");
  const [complaint, setComplaint] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    const role = localStorage.getItem("role");
    if (role === "admin") { window.location.href = "/dashboard"; return; }
    setUserEmail(localStorage.getItem("email") || "");
  }, []);

  const handleSubmit = async () => {
    if (!complaint) {
      alert("⚠️ Please describe your complaint before submitting.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "/tickets", email: userEmail, subject, complaint }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Ticket created successfully! Our support team will contact you shortly.");
        setSubject(""); setComplaint("");
        window.location.href = "/my-tickets";
      } else {
        alert("❌ Failed to create ticket: " + (data.message || "Please try again."));
      }
    } catch {
      alert("❌ Server error. The server may be waking up, please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="mobile-header">
        <div className="mobile-logo"><Bot size={22} color="#6366f1" />SmartDesk AI</div>
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
      </div>

      <CustomerSidebar active="/create-ticket" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-main">
        <div className="dashboard-top">
          <div className="dashboard-top-left">
            <h1>Submit a Ticket</h1>
            <p>Describe your issue and our AI will analyze and respond</p>
          </div>
        </div>

        <div className="create-ticket-container">
          <div className="form-card">
            <h2>New Support Request</h2>
            <p>AI will automatically detect priority, sentiment and category</p>

            <div className="form-group" style={{ marginTop: "20px" }}>
              <label>Your Email</label>
              <input type="email" value={userEmail} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
            </div>

            <div className="form-group">
              <label>Subject (Optional)</label>
              <input type="text" placeholder="Brief summary of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Describe Your Issue *</label>
              <textarea
                placeholder="Please describe your issue in detail..."
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                rows={6}
              />
            </div>

            <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
              <Send size={16} />
              {loading ? "Submitting & Analyzing..." : "Submit Ticket"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
