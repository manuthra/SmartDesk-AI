"use client";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Bot } from "lucide-react";

const API = "http://smartdesk-f5d4.onrender.com";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setIsError(true); setMessage("Please fill in all fields"); return; }
    try {
      setLoading(true); setMessage("");
      const res = await axios.post(`${API}/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("name", res.data.user.name);
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("email", res.data.user.email);
        setIsError(false);
        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          // Role based redirect — admin goes to dashboard, customer goes to my-tickets
          const role = res.data.user.role;
          window.location.href = role === "admin" ? "/dashboard" : "/my-tickets";
        }, 500);
      } else {
        setIsError(true); setMessage(res.data.message || "Login failed");
      }
    } catch { setIsError(true); setMessage("Server error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo"><Bot size={32} color="#6366f1" /><h1>SmartDesk AI</h1></div>
        <h2>Welcome back</h2>
        <p>Sign in to manage your support tickets</p>
        {message && <div className={isError ? "message-error" : "message-success"}>{message}</div>}
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
        </div>
        <button className="auth-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div className="auth-link">Don&apos;t have an account? <Link href="/register">Register here</Link></div>

        {/* Demo credentials */}
        <div style={{ marginTop: "20px", padding: "14px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Demo Credentials</p>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>👤 Customer: customer@demo.com / 123456</p>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>🛡️ Admin: admin@demo.com / 123456</p>
        </div>
      </div>
    </div>
  );
}
