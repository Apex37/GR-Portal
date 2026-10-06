import React, { useState } from "react";
import { Phone, Search, CheckCircle, PauseCircle, Trash2, Edit3, ShieldAlert } from "lucide-react";
import { getSubscriberByPhone, saveUserSubscription, isSupabaseConnected } from "../lib/supabase";
import { ROLE_PRESETS } from "../data/constants";

export default function ManageSubscription() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscriber, setSubscriber] = useState(null);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const data = await getSubscriberByPhone(cleanPhone);
      setSubscriber(data);
      setSearched(true);
    } catch (err) {
      setMessage("Failed to lookup subscriber: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!subscriber) return;
    try {
      const updatedStatus = !subscriber.is_active;
      await saveUserSubscription({
        ...subscriber,
        is_active: updatedStatus,
      });
      setSubscriber({ ...subscriber, is_active: updatedStatus });
      setMessage(updatedStatus ? "✅ Alerts resumed successfully." : "⏸️ Alerts paused.");
    } catch (err) {
      setMessage("Error updating status: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div className="glass-panel" style={{ padding: "2.5rem 2rem", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", textAlign: "center" }}>
          Manage Existing Subscription
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", textAlign: "center", marginBottom: "2rem" }}>
          Enter your registered WhatsApp mobile number to review or pause your notifications.
        </p>

        <form onSubmit={handleLookup} style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Phone size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
            <input
              type="tel"
              required
              className="form-input"
              style={{ paddingLeft: "2.75rem" }}
              placeholder="Enter 10-digit mobile number..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            <Search size={16} /> {loading ? "Finding..." : "Lookup"}
          </button>
        </form>

        {message && (
          <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border-glass)", fontSize: "0.85rem", color: "#f8fafc", marginBottom: "1.5rem" }}>
            {message}
          </div>
        )}

        {searched && (
          <div>
            {subscriber ? (
              <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid var(--border-glass)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                      {subscriber.full_name || "Registered Citizen"}
                    </h4>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      📱 +91 {subscriber.phone}
                    </span>
                  </div>
                  <span className={`badge ${subscriber.is_active ? "badge-emerald" : "badge-rose"}`}>
                    {subscriber.is_active ? "● ACTIVE" : "⏸️ PAUSED"}
                  </span>
                </div>

                <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1rem", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <div>🎯 Preset Profile: <strong style={{ color: "var(--primary-saffron)" }}>{subscriber.role_preset || "Custom"}</strong></div>
                  <div>📍 Target Districts: <strong style={{ color: "#fff" }}>{subscriber.preferred_districts?.length ? subscriber.preferred_districts.join(", ") : "Statewide (All)"}</strong></div>
                  <div>📑 Amendments Filter: <strong style={{ color: "#fff" }}>{subscriber.exclude_amendments ? "Excluding minor corrigendums" : "Receiving all"}</strong></div>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button onClick={handleToggleActive} className={`btn ${subscriber.is_active ? "btn-secondary" : "btn-whatsapp"}`} style={{ flex: 1 }}>
                    {subscriber.is_active ? "⏸️ Pause Notifications" : "▶️ Resume Alerts"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                <ShieldAlert size={36} color="var(--primary-saffron)" style={{ marginBottom: "0.75rem" }} />
                <p>No active subscription found for <strong>+91 {phone}</strong>.</p>
                <p style={{ fontSize: "0.82rem", marginTop: "0.5rem" }}>Click "WhatsApp Alerts" in the top bar to create a free alert profile.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
