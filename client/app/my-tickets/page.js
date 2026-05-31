"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { AlertTriangle, CheckCircle2, Bot, Inbox, Menu, PlusCircle } from "lucide-react";
import CustomerSidebar from "../components/CustomerSidebar";
import Link from "next/link";

const API = "";

function MyTicketsContent() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) { window.location.href = "/login"; return; }
    if (role === "admin") { window.location.href = "/dashboard"; return; }
    setUserEmail(localStorage.getItem("email") || "");
    setUserName(localStorage.getItem("name") || "");
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem("email");
      const res = await fetch(`/api/proxy?endpoint=/tickets/my&email=${email}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data.tickets) ? data.tickets : [];
      setTickets(list);
    } catch { setTickets([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="dashboard-layout">
      <div className="mobile-header">
        <div className="mobile-logo"><Bot size={22} color="#6366f1" />SmartDesk AI</div>
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
      </div>

      <CustomerSidebar active="/my-tickets" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-main">
        <div className="dashboard-top">
          <div className="dashboard-top-left">
            <h1>My Tickets</h1>
            <p>Welcome, {userName} — track your support requests</p>
          </div>
          <Link href="/create-ticket" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            <PlusCircle size={16} /> New Ticket
          </Link>
        </div>

        {loading ? (
          <div className="loading-container"><div className="loading-spinner" /><p className="loading-text">Loading your tickets... ☕</p></div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <Inbox size={52} />
            <h3>No tickets yet</h3>
            <p>Submit a ticket and we&apos;ll get back to you shortly</p>
            <Link href="/create-ticket" style={{ marginTop: "12px", padding: "10px 20px", background: "var(--accent)", color: "white", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
              Submit Your First Ticket
            </Link>
          </div>
        ) : (
          <div className="tickets-grid">
            {tickets.map((ticket) => (
              <div key={ticket._id} className={`ticket-box ${ticket.sentiment === "Angry" ? "angry-ticket" : ""} ${ticket.status === "Resolved" ? "resolved-ticket" : ""}`}>
                <div className="ticket-top">
                  <div className={`priority-badge ${ticket.priority}`}>{ticket.priority}</div>
                  <div className={`status-badge ${ticket.status}`}>{ticket.status}</div>
                </div>
                <div className="ticket-content">
                  <h2>{ticket.subject || "Support Request"}</h2>
                  <p>{ticket.complaint}</p>
                </div>
                <div className="ai-section">
                  <div className="ai-item"><AlertTriangle size={13} /><span>{ticket.sentiment}</span></div>
                  <div className="ai-item"><Bot size={13} /><span>{ticket.category}</span></div>
                </div>
                <div className="reply-box">
                  <h3>Support Reply</h3>
                  <p>{ticket.aiReply}</p>
                </div>
                {ticket.status === "Resolved" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "rgba(34,197,94,0.1)", borderRadius: "8px", color: "var(--success)", fontSize: "13px", fontWeight: "600" }}>
                    <CheckCircle2 size={15} /> This ticket has been resolved
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MyTicketsPage() {
  return <Suspense fallback={<div className="loading-container"><div className="loading-spinner" /></div>}><MyTicketsContent /></Suspense>;
}
