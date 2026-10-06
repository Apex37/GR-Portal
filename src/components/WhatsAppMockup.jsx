import React from "react";
import { Download, ExternalLink, ShieldCheck, CheckCheck } from "lucide-react";

export default function WhatsAppMockup({ presetName = "Contractor / Vendor" }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <span className="badge badge-saffron" style={{ fontSize: "0.8rem", padding: "0.35rem 0.85rem" }}>
          📱 Real WhatsApp Delivery Preview
        </span>
      </div>

      <div className="phone-mockup">
        {/* WhatsApp Top App Bar */}
        <div style={{ background: "#1f2c34", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
            🏛️
          </div>
          <div style={{ textAlign: "left", flex: 1 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#e9edef" }}>
              Maha GR Intelligence
            </div>
            <div style={{ fontSize: "0.7rem", color: "#25d366", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <ShieldCheck size={11} /> Verified Bot
            </div>
          </div>
        </div>

        {/* WhatsApp Message Body */}
        <div className="phone-screen">
          <div style={{ display: "inline-block", background: "rgba(31, 44, 52, 0.8)", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "0.68rem", color: "#8696a0", marginBottom: "0.85rem" }}>
            TODAY
          </div>

          <div className="wa-bubble" style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 800, color: "#f87171", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
              🚨 NEW GOVERNMENT RESOLUTION (AI TAGGED) 🚨
            </div>

            <div style={{ fontSize: "0.78rem", color: "#e9edef", lineHeight: 1.5, marginBottom: "0.65rem" }}>
              <div>🏢 <strong>Department:</strong> Public Works Department</div>
              <div>📅 <strong>Date:</strong> 06-10-2026</div>
              <div>🔢 <strong>Ref ID:</strong> 202610061120401804</div>
            </div>

            <div style={{ borderTop: "1px dashed rgba(255, 255, 255, 0.15)", paddingTop: "0.5rem", marginBottom: "0.65rem" }}>
              <div style={{ fontSize: "0.78rem" }}>
                <strong>🎯 Category:</strong> Contractors & Business<br/>
                <strong>⚡ Action Type:</strong> Tender & Procurement<br/>
                <strong>📍 Location:</strong> Division: Nashik | District: Nashik
              </div>
            </div>

            <div style={{ borderTop: "1px dashed rgba(255, 255, 255, 0.15)", paddingTop: "0.5rem", marginBottom: "0.65rem" }}>
              <div style={{ fontSize: "0.78rem", color: "#93c5fd" }}>
                📝 <strong>Summary:</strong> Notice inviting commercial bids for 24 km highway asphalting with estimated procurement outlay of ₹14.8 Crore.
              </div>
            </div>

            <div style={{ borderTop: "1px dashed rgba(255, 255, 255, 0.15)", paddingTop: "0.5rem" }}>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{ color: "#53bdeb", textDecoration: "none", fontSize: "0.76rem", wordBreak: "break-all", display: "block" }}
              >
                🔗 <u>https://gr.maharashtra.gov.in/Site/Upload/...</u>
              </a>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.25rem", marginTop: "0.4rem", fontSize: "0.65rem", color: "#8696a0" }}>
              <span>13:30</span>
              <CheckCheck size={14} color="#53bdeb" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
