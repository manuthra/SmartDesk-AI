"use client";

import { useEffect, useState } from "react";
import { Bot, User, LogOut, Sun, Moon, Shield } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [Sidebar, setSidebar] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    const r = localStorage.getItem("role") || "";
    setName(localStorage.getItem("name") || "");
    setRole(r);
    setEmail(localStorage.getItem("email") || "");
    if (r === "admin") {
      import("../components/AdminSidebar").then(m => setSidebar(() => m.default));
    } else {
      import("../components/CustomerSidebar").then(m => setSidebar(() => m.default));
    }
  }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = "/login"; };

  return (
    <div className="dashboard-layout">
      <div className="mobile-header">
        <div className="mobile-logo"><Bot size={22} color="#6366f1" />SmartDesk AI</div>
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
      </div>
      {Sidebar && <Sidebar active="/settings" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <main className="dashboard-main">
        <div className="dashboard-top">
          <div className="dashboard-top-left"><h1>Settings</h1><p>Manage your account and preferences</p></div>
        </div>
        <div className="settings-container">
          <div className="settings-card">
            <h2>Profile</h2><p>Your account information</p>
            <div className="profile-row">
              <div className="profile-avatar"><User size={26} color="#6366f1" /></div>
              <div className="profile-info"><h3>{name || "User"}</h3><p>{role || "Customer"}</p></div>
            </div>
            <div style={{ marginTop: "12px", padding: "12px 14px", background: "var(--bg-tertiary)", borderRadius: "10px", fontSize: "13px", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>📧 {email}</div>
          </div>
          <div className="settings-card">
            <h2>Appearance</h2><p>Toggle between dark and light mode</p>
            <div className="theme-toggle" onClick={toggleTheme} style={{ maxWidth: "240px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
                {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
              <div className={`toggle-switch ${theme === "light" ? "on" : ""}`}><div className="toggle-knob" /></div>
            </div>
          </div>
          <div className="settings-card">
            <h2>Security</h2><p>Manage your session</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "13px", marginBottom: "16px", padding: "12px", background: "var(--bg-tertiary)", borderRadius: "10px" }}>
              <Shield size={16} color="#22c55e" />Secured with JWT authentication
            </div>
            <button className="logout-btn" onClick={handleLogout}><LogOut size={16} /> Sign Out</button>
          </div>
        </div>
      </main>
    </div>
  );
}
