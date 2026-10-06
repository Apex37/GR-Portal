import React, { useState } from "react";
import { FileText, Bell, Smartphone, Settings, Sparkles, ExternalLink, ShieldCheck, HeartHandshake, Layers } from "lucide-react";
import ResolutionsExplorer from "./components/ResolutionsExplorer";
import WhatsAppSubscription from "./components/WhatsAppSubscription";
import ManageSubscription from "./components/ManageSubscription";
import WhatsAppMockup from "./components/WhatsAppMockup";

export default function App() {
  const [activeTab, setActiveTab] = useState("explorer");

  return (
    <div>
      {/* Top Navbar */}
      <header className="header">
        <div className="header-container">
          <a href="#" onClick={() => setActiveTab("explorer")} className="brand-wrapper">
            <div className="brand-emblem">🏛️</div>
            <div>
              <div className="brand-title font-heading">
                Maharashtra GR Portal
              </div>
              <div className="brand-subtitle">
                शासन निर्णय नागरिक व व्यवसाय व्यासपीठ
              </div>
            </div>
          </a>

          {/* Navigation Tabs */}
          <nav className="nav-tabs">
            <button
              onClick={() => setActiveTab("explorer")}
              className={`nav-tab-btn ${activeTab === "explorer" ? "active" : ""}`}
            >
              <FileText size={16} /> Browse Resolutions
            </button>
            <button
              onClick={() => setActiveTab("subscribe")}
              className={`nav-tab-btn ${activeTab === "subscribe" ? "active" : ""}`}
            >
              <Bell size={16} /> WhatsApp Alerts
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`nav-tab-btn ${activeTab === "manage" ? "active" : ""}`}
            >
              <Settings size={16} /> Manage Alerts
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`nav-tab-btn ${activeTab === "preview" ? "active" : ""}`}
            >
              <Smartphone size={16} /> WhatsApp Preview
            </button>
          </nav>

          {/* Live Status Pill */}
          <div className="status-pill">
            <div className="pulse-dot" />
            <span>5D AI Sync Live</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-content">
        {/* Hero Banner */}
        <section className="hero-banner">
          <div className="hero-pill">
            <Sparkles size={14} /> Official Maharashtra Government Orders • 5D Intelligence
          </div>
          <h1 className="hero-headline font-heading">
            Maharashtra Government Resolutions (GR)
            <br />
            Personalized to Your Phone
          </h1>
          <p className="hero-subheadline">
            Never miss a government scheme, tender, recruitment notice, or policy change. 
            Automated 5D AI tagging delivers actionable takeaways filtered by your district, role, and trade.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
            <button onClick={() => setActiveTab("subscribe")} className="btn btn-whatsapp" style={{ padding: "0.85rem 2rem", fontSize: "1rem" }}>
              <Bell size={18} /> Get Instant WhatsApp Alerts
            </button>
            <button onClick={() => setActiveTab("explorer")} className="btn btn-secondary" style={{ padding: "0.85rem 1.75rem", fontSize: "1rem" }}>
              <FileText size={18} /> Search 34 Ministries
            </button>
          </div>
        </section>

        {/* Tab Views */}
        {activeTab === "explorer" && (
          <ResolutionsExplorer onSelectPreset={() => setActiveTab("subscribe")} />
        )}

        {activeTab === "subscribe" && (
          <WhatsAppSubscription onComplete={() => setActiveTab("explorer")} />
        )}

        {activeTab === "manage" && (
          <ManageSubscription />
        )}

        {activeTab === "preview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem", alignItems: "center", maxWidth: "900px", margin: "0 auto" }}>
            <div className="glass-panel" style={{ padding: "2.5rem 2rem" }}>
              <span className="badge badge-emerald" style={{ marginBottom: "1rem" }}>
                ⚡ How It Works
              </span>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>
                Zero Token Waste, Pure Actionable Insights
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Our backend microservice runs continuous 24/7 scans on <code>gr.maharashtra.gov.in</code>. When a new order is detected:
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                <li style={{ display: "flex", gap: "0.75rem" }}>
                  <span style={{ color: "var(--primary-saffron)" }}>1.</span>
                  <span><strong>5D Waterfall Classification:</strong> Categorized into Intent, Target Beneficiary, Administrative Level, and Legal Scope.</span>
                </li>
                <li style={{ display: "flex", gap: "0.75rem" }}>
                  <span style={{ color: "#34d399" }}>2.</span>
                  <span><strong>Actionable Summary:</strong> Gemini models extract operational changes without parroting bureaucratic subjects.</span>
                </li>
                <li style={{ display: "flex", gap: "0.75rem" }}>
                  <span style={{ color: "#60a5fa" }}>3.</span>
                  <span><strong>Targeted Dispatch:</strong> Instantly delivered to your phone with direct PDF link.</span>
                </li>
              </ul>

              <div style={{ marginTop: "2rem" }}>
                <button onClick={() => setActiveTab("subscribe")} className="btn btn-primary" style={{ width: "100%" }}>
                  Subscribe for Free Now
                </button>
              </div>
            </div>

            <WhatsAppMockup />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-glass)", padding: "3rem 2rem", background: "rgba(9, 13, 22, 0.9)", textAlign: "center", color: "var(--text-subtle)", fontSize: "0.85rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.25rem" }}>🏛️</span>
            <span style={{ fontWeight: 700, color: "var(--text-main)" }}>Maharashtra GR Intelligence Portal</span>
          </div>
          <p style={{ maxWidth: "650px", lineHeight: 1.6 }}>
            Independent civic tech intelligence service. Government Resolutions are indexed directly from official public portals (<code>gr.maharashtra.gov.in</code>).
          </p>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            <a href="https://gr.maharashtra.gov.in" target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Official Portal <ExternalLink size={12} style={{ display: "inline" }} />
            </a>
            <span>•</span>
            <span style={{ color: "#34d399" }}>Hosted on Render</span>
            <span>•</span>
            <span style={{ color: "var(--primary-saffron)" }}>Supabase Realtime DB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
