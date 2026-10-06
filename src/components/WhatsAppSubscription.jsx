import React, { useState } from "react";
import { CheckCircle2, MessageSquare, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, MapPin, Phone, User, Check } from "lucide-react";
import { ROLE_PRESETS, DIVISIONS, DISTRICTS_BY_DIVISION, ALL_DISTRICTS } from "../data/constants";
import { saveUserSubscription } from "../lib/supabase";

export default function WhatsAppSubscription({ onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState("CONTRACTOR_VENDOR");
  const [targetDivision, setTargetDivision] = useState("");
  const [targetDistrict, setTargetDistrict] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [excludeAmendments, setExcludeAmendments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const preset = ROLE_PRESETS.find((p) => p.id === selectedPreset) || ROLE_PRESETS[0];

  const handleNext = () => {
    setErrorMessage("");
    if (step === 2) {
      setStep(3);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setErrorMessage("");
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit Indian WhatsApp mobile number.");
      return;
    }

    setSubmitting(true);
    try {
      const preferredDistricts = targetDistrict ? [targetDistrict] : [];
      await saveUserSubscription({
        phone: cleanPhone,
        full_name: fullName,
        role_preset: selectedPreset,
        preferred_departments: preset.departments,
        preferred_intents: preset.intents,
        preferred_audiences: preset.audiences,
        preferred_beneficiaries: preset.beneficiaries,
        preferred_districts: preferredDistricts,
        exclude_amendments: excludeAmendments,
      });

      setSuccess(true);
      if (onComplete) onComplete({ phone: cleanPhone, preset: selectedPreset });
    } catch (err) {
      setErrorMessage(err.message || "Failed to save subscription. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Step Indicators */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "0", right: "0", height: "2px", background: "var(--border-glass)", zIndex: 0 }} />

        {[
          { num: 1, label: "Choose Role" },
          { num: 2, label: "Location" },
          { num: 3, label: "Activate WhatsApp" },
        ].map((s) => (
          <div
            key={s.num}
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--bg-primary)",
              padding: "0 1rem",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: step >= s.num ? "var(--primary-saffron)" : "var(--bg-secondary)",
                color: step >= s.num ? "#0f172a" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                border: "2px solid",
                borderColor: step >= s.num ? "var(--primary-saffron)" : "var(--border-glass)",
                transition: "all 0.3s ease",
              }}
            >
              {step > s.num ? <Check size={20} strokeWidth={3} /> : s.num}
            </div>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: step >= s.num ? "#fff" : "var(--text-subtle)" }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {success ? (
        <div className="glass-panel" style={{ padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ width: "70px", height: "70px", background: "rgba(16, 185, 129, 0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <CheckCircle2 size={42} color="#10b981" />
          </div>
          <h2 style={{ fontSize: "1.85rem", fontWeight: 800, marginBottom: "0.75rem", color: "#fff" }}>
            Subscription Active!
          </h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "550px", margin: "0 auto 2rem", fontSize: "1.05rem", lineHeight: 1.6 }}>
            You will now receive instant, 5D AI-tagged WhatsApp alerts whenever matching resolutions are published by the Government of Maharashtra.
          </p>

          <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.5rem", background: "rgba(15, 23, 42, 0.8)", border: "1px solid var(--border-glass)", padding: "1.25rem 2rem", borderRadius: "var(--radius-md)", marginBottom: "2rem", textAlign: "left" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>📱 Mobile Number: <strong style={{ color: "#fff" }}>+91 {phone.replace(/\D/g, "")}</strong></div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>🎯 Role Preset: <strong style={{ color: "var(--primary-saffron)" }}>{preset.title}</strong></div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>📍 Location: <strong style={{ color: "#60a5fa" }}>{targetDistrict ? `${targetDistrict} District` : "All Maharashtra (Statewide)"}</strong></div>
          </div>

          <div>
            <button onClick={() => { setSuccess(false); setStep(1); }} className="btn btn-secondary">
              Configure Another Number
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: "2.5rem 2rem" }}>
          {/* STEP 1: PRESET SELECTION */}
          {step === 1 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.65rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Select Your Profile or Role
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                  Our 5D AI classifier uses intent-based matching to deliver relevant GRs across all 34 ministries.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
                {ROLE_PRESETS.map((p) => {
                  const isSelected = selectedPreset === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPreset(p.id)}
                      style={{
                        padding: "1.35rem",
                        borderRadius: "var(--radius-md)",
                        background: isSelected ? "rgba(245, 158, 11, 0.1)" : "rgba(15, 23, 42, 0.6)",
                        border: `2px solid ${isSelected ? "var(--primary-saffron)" : "var(--border-glass)"}`,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: isSelected ? "0 0 20px rgba(245, 158, 11, 0.15)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "1.75rem" }}>{p.icon}</span>
                        <div>
                          <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: isSelected ? "#fde68a" : "#fff" }}>
                            {p.title}
                          </h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{p.marathi}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                        {p.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleNext} className="btn btn-primary" style={{ padding: "0.85rem 2rem" }}>
                  Continue to Location <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: GEOGRAPHIC TARGETING */}
          {step === 2 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.65rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Select Geographic Scope
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                  Statewide policy decisions will always be sent. You can additionally pinpoint a specific district.
                </p>
              </div>

              <div style={{ maxWidth: "560px", margin: "0 auto 2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.5rem", display: "block" }}>
                    🗺️ Administrative Division (Optional)
                  </label>
                  <select
                    className="form-select"
                    value={targetDivision}
                    onChange={(e) => {
                      setTargetDivision(e.target.value);
                      setTargetDistrict("");
                    }}
                  >
                    <option value="">All Divisions (Entire State of Maharashtra)</option>
                    {DIVISIONS.map((div) => (
                      <option key={div} value={div}>
                        {div} Division
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.5rem", display: "block" }}>
                    📍 Target District (Optional)
                  </label>
                  <select
                    className="form-select"
                    value={targetDistrict}
                    onChange={(e) => setTargetDistrict(e.target.value)}
                  >
                    <option value="">All Districts in Selected Scope</option>
                    {(targetDivision ? DISTRICTS_BY_DIVISION[targetDivision] : ALL_DISTRICTS).map((d) => (
                      <option key={d} value={d}>
                        {d} District
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(15, 23, 42, 0.6)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-glass)" }}>
                  <input
                    type="checkbox"
                    id="excludeAmendments"
                    checked={excludeAmendments}
                    onChange={(e) => setExcludeAmendments(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "var(--primary-saffron)", cursor: "pointer" }}
                  />
                  <label htmlFor="excludeAmendments" style={{ fontSize: "0.88rem", color: "var(--text-muted)", cursor: "pointer" }}>
                    Filter out minor amendments, date corrections, and corrigendums (Recommended)
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={handleBack} className="btn btn-secondary">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={handleNext} className="btn btn-primary" style={{ padding: "0.85rem 2rem" }}>
                  Confirm & Setup WhatsApp <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT & ACTIVATION */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.65rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Activate WhatsApp Alerts
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                  Enter your mobile number to start receiving official GR notifications instantly on WhatsApp.
                </p>
              </div>

              <div style={{ maxWidth: "500px", margin: "0 auto 2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {errorMessage && (
                  <div style={{ background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: "var(--radius-sm)", padding: "0.85rem", color: "#fca5a5", fontSize: "0.88rem" }}>
                    ⚠️ {errorMessage}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.4rem", display: "block" }}>
                    Full Name (Optional)
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: "2.75rem" }}
                      placeholder="e.g. Ramesh Patil"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.4rem", display: "block" }}>
                    WhatsApp Mobile Number *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#25d366" }} />
                    <input
                      type="tel"
                      required
                      className="form-input"
                      style={{ paddingLeft: "2.75rem", fontSize: "1.05rem", letterSpacing: "0.05em" }}
                      placeholder="98XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-subtle)", display: "block", marginTop: "0.35rem" }}>
                    10-digit Indian mobile number. No international prefix required.
                  </span>
                </div>

                {/* Summary Box */}
                <div style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid var(--border-glass)", borderRadius: "var(--radius-sm)", padding: "1rem" }}>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>Selected Profile:</div>
                  <div style={{ fontWeight: 700, color: "var(--primary-saffron)" }}>{preset.icon} {preset.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-subtle)", marginTop: "0.35rem" }}>
                    Location: {targetDistrict ? `${targetDistrict} District` : "Statewide (All Maharashtra)"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button type="button" onClick={handleBack} className="btn btn-secondary">
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-whatsapp"
                  style={{ padding: "0.85rem 2.25rem", fontSize: "1rem" }}
                >
                  {submitting ? "Activating..." : "🚀 Activate WhatsApp Alerts"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
