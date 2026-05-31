"use client";

import Link from "next/link";
import { useTheme } from "../../context/ThemeContext";
import { LayoutDashboard, Ticket, BarChart3, Bot, LogOut, Settings, Sun, Moon } from "lucide-react";

export default function AdminSidebar({ active, onClose, isOpen }) {
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const links = [
    { href: "/dashboard", label: "All Tickets", icon: <LayoutDashboard size={18} /> },
    { href: "/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
    { href: "/settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "open" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <Bot size={28} />
          <div>
            <h2>SmartDesk AI</h2>
            <span style={{ fontSize: "11px", color: "var(--accent)", fontWeight: "600", background: "var(--accent-soft)", padding: "2px 8px", borderRadius: "10px" }}>Admin</span>
          </div>
        </div>
        <div className="sidebar-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`sidebar-item ${active === link.href ? "active-sidebar" : ""}`} onClick={onClose}>
              {link.icon}{link.label}
            </Link>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="theme-toggle" onClick={toggleTheme}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </span>
            <div className={`toggle-switch ${theme === "light" ? "on" : ""}`}>
              <div className="toggle-knob" />
            </div>
          </div>
          <div onClick={handleLogout} className="sidebar-item" style={{ color: "var(--danger)" }}>
            <LogOut size={18} /> Logout
          </div>
        </div>
      </aside>
    </>
  );
}
