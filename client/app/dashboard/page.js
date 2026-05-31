"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Bot, Inbox, Search, Menu, TrendingUp, Edit2, Send, X, Mail } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";

const API = "http://smartdesk-f5d4.onrender.com";

function AdminDashboardContent() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editedReply, setEditedReply] = useState("");
  const [sending, setSending] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) { window.location.href = "/login"; return; }
    if (role !== "admin") { window.location.href = "/my-tickets"; return; }
    setUserName(localStorage.getItem("name") || "Admin");
  }, []);

  useEffect(() => {
    const f = searchParams.get("filter");
    if (f) setFilter(f);
  }, [searchParams]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/tickets`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data.tickets) ? data.tickets : [];
      setTickets(list);
    } catch { setTickets([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  const resolveTicket = async (id) => {
    try {
      await fetch(`${API}/tickets/${id}/resolve`, { method: "PUT" });
      fetchTickets();
    } catch (e) { console.error(e); }
  };

  const handleEditReply = (ticket) => {
    setEditingTicket(ticket);
    setEditedReply(ticket.aiReply);
  };

  const handleSendReply = async () => {
    if (!editingTicket) return;
    try {
      setSending(true);
      const res = await fetch(`${API}/tickets/${editingTicket._id}/send-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: editedReply }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Reply sent to ${editingTicket.email} successfully!`);
        setEditingTicket(null);
        fetchTickets();
      } else {
        alert("❌ Failed to send reply. Please try again.");
      }
    } catch { alert("❌ Server error. Please try again."); }
    finally { setSending(false); }
  };

  const filtered = Array.isArray(tickets) ? tickets.filter((t) => {
    const matchFilter = filter === "All" || (filter === "High" && t.priority === "High") || (filter === "Angry" && t.sentiment === "Angry") || (filter === "Resolved" && t.status === "Resolved") || (filter === "Open" && t.status === "Open");
    const matchSearch = search === "" || t.complaint?.toLowerCase().includes(search.toLowerCase()) || t.subject?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }) : [];

  const total = tickets.length;
  const open = tickets.filter(t => t.status === "Open").length;
  const resolved = tickets.filter(t => t.status === "Resolved").length;
  const high = tickets.filter(t => t.priority === "High").length;

  return (
    <div className="dashboard-layout">
      <div className="mobile-header">
        <div className="mobile-logo"><Bot size={22} color="#6366f1" />SmartDesk AI</div>
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
      </div>

      <AdminSidebar active="/dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Edit Reply Modal */}
      {editingTicket && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>Edit & Send Reply</h2>
              <button onClick={() => setEditingTicket(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><X size={20} /></button>
            </div>

            <div style={{ background: "var(--bg-tertiary)", borderRadius: "10px", padding: "14px", marginBottom: "16px", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: "600" }}>CUSTOMER EMAIL</p>
              <p style={{ fontSize: "14px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}><Mail size={14} color="var(--accent)" />{editingTicket.email}</p>
            </div>

            <div style={{ background: "var(--bg-tertiary)", borderRadius: "10px", padding: "14px", marginBottom: "16px", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: "600" }}>COMPLAINT</p>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>{editingTicket.complaint}</p>
            </div>

            <div className="form-group">
              <label>Edit AI Reply</label>
              <textarea
                value={editedReply}
                onChange={(e) => setEditedReply(e.target.value)}
                rows={6}
                style={{ width: "100%", padding: "12px 16px", background: "var(--bg-tertiary)", border: "1.5px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button onClick={() => setEditingTicket(null)} style={{ flex: 1, padding: "11px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "600" }}>
                Cancel
              </button>
              <button onClick={handleSendReply} disabled={sending} style={{ flex: 2, padding: "11px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: "10px", color: "white", cursor: "pointer", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: sending ? 0.7 : 1 }}>
                <Send size={15} />{sending ? "Sending..." : "Send Reply to Customer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="dashboard-main">
        <div className="dashboard-top">
          <div className="dashboard-top-left">
            <h1>Admin Dashboard</h1>
            <p>Welcome, {userName} — manage all customer tickets</p>
          </div>
        </div>

        <div className="stats-row">
          {[
            { label: "Total Tickets", value: total, color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
            { label: "Open", value: open, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
            { label: "Resolved", value: resolved, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
            { label: "High Priority", value: high, color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
          ].map((s) => (
            <div key={s.label} className="mini-stat">
              <div className="mini-stat-icon" style={{ background: s.bg }}>
                <TrendingUp size={20} color={s.color} />
              </div>
              <div className="mini-stat-info">
                <h3 style={{ color: s.color }}>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="search-bar">
          <Search size={16} />
          <input placeholder="Search by email, complaint, or subject..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="filter-row">
          {["All", "High", "Open", "Resolved", "Angry"].map((f) => (
            <button key={f} className={filter === f ? "active-filter" : ""} onClick={() => setFilter(f)}>
              {f === "High" ? "High Priority" : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-container"><div className="loading-spinner" /><p className="loading-text">Loading tickets... ☕</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Inbox size={52} /><h3>No tickets found</h3><p>Try a different filter</p></div>
        ) : (
          <div className="tickets-grid">
            {filtered.map((ticket) => (
              <div key={ticket._id} className={`ticket-box ${ticket.sentiment === "Angry" ? "angry-ticket" : ""} ${ticket.status === "Resolved" ? "resolved-ticket" : ""}`}>
                <div className="ticket-top">
                  <div className={`priority-badge ${ticket.priority}`}>{ticket.priority}</div>
                  <div className={`status-badge ${ticket.status}`}>{ticket.status}</div>
                </div>

                {/* Customer email */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
                  <Mail size={12} />{ticket.email}
                </div>

                <div className="ticket-content">
                  <h2>{ticket.subject || "Customer Complaint"}</h2>
                  <p>{ticket.complaint}</p>
                </div>

                <div className="ai-section">
                  <div className="ai-item"><AlertTriangle size={13} /><span>{ticket.sentiment}</span></div>
                  <div className="ai-item"><Bot size={13} /><span>{ticket.category}</span></div>
                </div>

                <div className="reply-box">
                  <h3>AI Reply</h3>
                  <p>{ticket.aiReply}</p>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleEditReply(ticket)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px", background: "var(--accent-soft)", border: "1.5px solid rgba(99,102,241,0.3)", color: "var(--accent)", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                  >
                    <Edit2 size={13} /> Edit & Send
                  </button>

                  {ticket.status !== "Resolved" && (
                    <button className="resolve-btn" style={{ flex: 1 }} onClick={() => resolveTicket(ticket._id)}>
                      <CheckCircle2 size={13} /> Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return <Suspense fallback={<div className="loading-container"><div className="loading-spinner" /></div>}><AdminDashboardContent /></Suspense>;
}
