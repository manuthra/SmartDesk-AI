"use client";

import { useEffect, useState } from "react";
import { Menu, Bot, BarChart3, TrendingUp, AlertTriangle, CheckCircle2, Inbox } from "lucide-react";
import Sidebar from "../components/Sidebar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

const API = "https://smartdesk-f5d4.onrender.com";
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API}/analytics`);
      const data = await res.json();
      setStats(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const priorityData = stats ? [
    { name: "High", value: stats.highPriority, color: "#ef4444" },
    { name: "Medium", value: stats.mediumPriority, color: "#f59e0b" },
    { name: "Low", value: stats.lowPriority, color: "#22c55e" },
  ] : [];

  const statusData = stats ? [
    { name: "Open", value: stats.openTickets, color: "#6366f1" },
    { name: "Resolved", value: stats.resolvedTickets, color: "#22c55e" },
  ] : [];

  const barData = stats ? [
    { name: "Total", value: stats.totalTickets },
    { name: "Open", value: stats.openTickets },
    { name: "Resolved", value: stats.resolvedTickets },
    { name: "High", value: stats.highPriority },
    { name: "Medium", value: stats.mediumPriority },
    { name: "Low", value: stats.lowPriority },
    { name: "Angry", value: stats.angryCustomers },
  ] : [];

  const statCards = stats ? [
    { label: "Total Tickets", value: stats.totalTickets, color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
    { label: "Open", value: stats.openTickets, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    { label: "Resolved", value: stats.resolvedTickets, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    { label: "High Priority", value: stats.highPriority, color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    { label: "Medium Priority", value: stats.mediumPriority, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    { label: "Low Priority", value: stats.lowPriority, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    { label: "Angry Customers", value: stats.angryCustomers, color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  ] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px" }}>
          <p style={{ color: "var(--text-primary)", fontWeight: 700 }}>{label}</p>
          <p style={{ color: "#6366f1" }}>{payload[0].value} tickets</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-layout">
      <div className="mobile-header">
        <div className="mobile-logo"><Bot size={22} color="#6366f1" />SmartDesk AI</div>
        <button className="hamburger" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
      </div>

      <Sidebar active="/analytics" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-main">
        <div className="dashboard-top">
          <div className="dashboard-top-left">
            <h1>Analytics</h1>
            <p>Overview of your support ticket metrics</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="analytics-grid">
              {statCards.map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-card-icon" style={{ background: s.bg }}>
                    <BarChart3 size={20} color={s.color} />
                  </div>
                  <h3>{s.label}</h3>
                  <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Bar Chart */}
            <div className="chart-section">
              <h2>Ticket Overview</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]}>
                    {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="chart-section">
                <h2>Priority Breakdown</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {priorityData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-section">
                <h2>Status Breakdown</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
