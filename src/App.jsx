import React, { useState } from "react";
import { Bell, Smartphone, Settings, Sparkles, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import WhatsAppSubscription from "./components/WhatsAppSubscription";
import ManageSubscription from "./components/ManageSubscription";
import WhatsAppMockup from "./components/WhatsAppMockup";

export default function App() {
  const [activeTab, setActiveTab] = useState("subscribe");

  return (
    <div>
      {/* Top Navbar */}
      <header className="header">
        <div className="header-container">
          <a href="#" onClick={() => setActiveTab("subscribe")} className="brand-wrapper">
            <div className="brand-emblem">🏛️</div>
            <div>
              <div className="brand-title font-heading">
                Maharashtra GR Portal
              </div>
              <div className="brand-subtitle">
                शासन निर्णय व्हॉट्सअ‍ॅप अलर्ट्स व प्राधान्ये
              </div>
            </div>
          </a>

          {/* Navigation Tabs */}
          <nav className="nav-tabs">
            <button
              onClick={() => setActiveTab("subscribe")}
              className={`nav-tab-btn ${activeTab === "subscribe" ? "active" : ""}`}
            >
              <Bell size={16} /> Activate Alerts
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`nav-tab-btn ${activeTab === "preview" ? "active" : ""}`}
            >
              <Smartphone size={16} /> WhatsApp Preview
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`nav-tab-btn ${activeTab === "manage" ? "active" : ""}`}
            >
              <Settings size={16} /> Manage Subscription
            </button>
          </nav>

          {/* Live Status Pill */}
          <div className="status-pill">
            <div className="pulse-dot" />
            <span>WhatsApp Bot Active</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-content">
        {/* Hero Banner */}
        <section className="hero-banner">
          <div className="hero-pill">
            <Sparkles size={14} /> Official Maharashtra Government Orders • 5D AI Tagged
          </div>
          <h1 className="hero-headline font-heading">
            Personalized Government Resolutions
            <br />
            Delivered Straight to WhatsApp
          </h1>
          <p className="hero-subheadline">
            Select your occupation, industry, or district. Our 5D AI engine scans all 34 ministries 24/7 
            and delivers actionable takeaways with official PDF links directly to your phone.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
            <button
              onClick={() => setActiveTab("subscribe")}
              className={`btn ${activeTab === "subscribe" ? "btn-whatsapp" : "btn-secondary"}`}
              style={{ padding: "0.85rem 2rem", fontSize: "1rem" }}
            >
              <Bell size={18} /> Configure Your Alert Profile
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`btn ${activeTab === "preview" ? "btn-whatsapp" : "btn-secondary"}`}
              style={{ padding: "0.85rem 1.75rem", fontSize: "1rem" }}
            >
              <Smartphone size={18} /> View Message Format
            </button>
          </div>
        </section>

        {/* Tab Views */}
        {activeTab === "subscribe" && (
          <WhatsAppSubscription onComplete={() => setActiveTab("preview")} />
        )}

        {activeTab === "preview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem", alignItems: "center", maxWidth: "920px", margin: "0 auto" }}>
            <div className="glass-panel" style={{ padding: "2.5rem 2rem" }}>
              <span className="badge badge-emerald" style={{ marginBottom: "1rem" }}>
                ⚡ 5D AI Intelligence
              </span>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>
                How Your WhatsApp Alerts Work
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Instead of reading through dozens of unformatted PDFs every week, our system processes every new GR published by the Government of Maharashtra:
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.1rem", fontSize: "0.92rem", color: "var(--text-muted)" }}>
                <li style={{ display: "flex", gap: "0.75rem" }}>
                  <span style={{ color: "var(--primary-saffron)", fontWeight: 800 }}>1.</span>
                  <span><strong>Cross-Ministry Intent Matching:</strong> Bankers receive financial orders from any ministry; Contractors receive all tenders without needing to check 34 different websites.</span>
                </li>
                <li style={{ display: "flex", gap: "0.75rem" }}>
                  <span style={{ color: "#34d399", fontWeight: 800 }}>2.</span>
                  <span><strong>Concise 2-Sentence Summary:</strong> Gemini models extract key operational changes, avoiding vague bureaucratic subjects.</span>
                </li>
                <li style={{ display: "flex", gap: "0.75rem" }}>
                  <span style={{ color: "#60a5fa", fontWeight: 800 }}>3.</span>
                  <span><strong>Zero Clutter:</strong> Corrigendums and minor date corrections are automatically filtered out unless you choose to receive them.</span>
                </li>
              </ul>

              <div style={{ marginTop: "2rem" }}>
                <button onClick={() => setActiveTab("subscribe")} className="btn btn-whatsapp" style={{ width: "100%", padding: "0.85rem" }}>
                  <Bell size={16} /> Get Started in 30 Seconds
                </button>
              </div>
            </div>

            <WhatsAppMockup />
          </div>
        )}

        {activeTab === "manage" && (
          <ManageSubscription />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-glass)", padding: "3rem 2rem", background: "rgba(9, 13, 22, 0.9)", textAlign: "center", color: "var(--text-subtle)", fontSize: "0.85rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.25rem" }}>🏛️</span>
            <span style={{ fontWeight: 700, color: "var(--text-main)" }}>Maharashtra GR Portal • शासन निर्णय अलर्ट्स</span>
          </div>
          <p style={{ maxWidth: "650px", lineHeight: 1.6 }}>
            Civic notifications for Maharashtra Government Resolutions published on <code>gr.maharashtra.gov.in</code>.
          </p>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            <a href="https://gr.maharashtra.gov.in" target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Official Portal <ExternalLink size={12} style={{ display: "inline" }} />
            </a>
            <span>•</span>
            <span style={{ color: "#34d399" }}>Hosted on Render</span>
            <span>•</span>
            <span style={{ color: "var(--primary-saffron)" }}>Supabase Users V2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
