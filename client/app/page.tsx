"use client";
import { useEffect } from "react";
export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    const role = localStorage.getItem("role");
    window.location.href = role === "admin" ? "/dashboard" : "/my-tickets";
  }, []);
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", color: "var(--text-secondary)" }}>Loading...</div>;
}
