"use client";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Bot } from "lucide-react";

const API = "https://smartdesk-ai-s701.onrender.com";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Customer");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) { setIsError(true); setMessage("Please fill in all fields"); return; }
    try {
      setLoading(true); setMessage("");
      const res = await axios.post(`${API}/register`, { name, email, password, role });
      if (res.data.success) {
        setIsError(false); setMessage("Account created! Redirecting to login...");
        setTimeout(() => { window.location.href = "/login"; }, 1000);
      } else { setIsError(true); setMessage(res.data.message || "Registration failed"); }
    } catch { setIsError(true); setMessage("Server error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo"><Bot size={32} color="#6366f1" /><h1>SmartDesk AI</h1></div>
        <h2>Create account</h2>
        <p>Join SmartDesk AI to get started</p>
        {message && <div className={isError ? "message-error" : "message-success"}>{message}</div>}
        <div className="form-group"><label>Full Name</label><input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="form-group"><label>Email Address</label><input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="form-group"><label>Password</label><input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button className="auth-btn" onClick={handleRegister} disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
        <div className="auth-link">Already have an account? <Link href="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
