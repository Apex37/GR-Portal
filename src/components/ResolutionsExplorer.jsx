import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Share2, Copy, Check, FileText, ExternalLink, RefreshCw } from "lucide-react";
import { DEPARTMENTS, INTENTS, ALL_DISTRICTS } from "../data/constants";
import { fetchResolutions, isSupabaseConnected, RESOLUTIONS_TABLE } from "../lib/supabase";

export default function ResolutionsExplorer({ onSelectPreset }) {
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedIntent, setSelectedIntent] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchResolutions({
      searchQuery,
      departmentCode: selectedDept || null,
      intentId: selectedIntent || null,
      district: selectedDistrict || null,
    });
    setResolutions(result.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedIntent, selectedDistrict]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const copyRefId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDeptName = (code) => {
    const dept = DEPARTMENTS.find((d) => d.code === code);
    return dept ? dept.name : `Department #${code}`;
  };

  const getIntentBadge = (intentId) => {
    const intent = INTENTS.find((i) => i.id === intentId);
    if (!intent) return null;
    return (
      <span className="badge badge-emerald">
        {intent.icon} {intent.label}
      </span>
    );
  };

  return (
    <div>
      {/* Search and Filters Bar */}
      <div className="glass-panel" style={{ padding: "1.75rem", marginBottom: "2rem" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          <div style={{ flex: "1 1 320px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "2.75rem" }}
              placeholder="Search by keywords, subject, or Ref ID (e.g. PWD tender, subsidy)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Search size={16} /> Search GRs
          </button>
          <button type="button" onClick={() => { setSearchQuery(""); setSelectedDept(""); setSelectedIntent(""); setSelectedDistrict(""); loadData(); }} className="btn btn-secondary">
            <RefreshCw size={16} /> Reset
          </button>
        </form>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block" }}>🏢 Ministry / Department</label>
            <select className="form-select" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
              <option value="">All 34 Ministries</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.name} ({dept.marathi})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block" }}>🎯 5D Action Type / Intent</label>
            <select className="form-select" value={selectedIntent} onChange={(e) => setSelectedIntent(e.target.value)}>
              <option value="">All Action Types</option>
              {INTENTS.map((intent) => (
                <option key={intent.id} value={intent.id}>
                  {intent.icon} {intent.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block" }}>📍 Target District</label>
            <select className="form-select" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
              <option value="">Statewide / All Districts</option>
              {ALL_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} District
                </option>
              ))}
            </select>
          </div>
        </div>

        {!isSupabaseConnected && (
          <div style={{ marginTop: "1rem", padding: "0.65rem 1rem", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "var(--radius-sm)", fontSize: "0.82rem", color: "#fde68a" }}>
            💡 <strong>Preview Mode:</strong> Showing live demonstrator resolutions. To connect your live Supabase database, set <code>VITE_SUPABASE_ANON_KEY</code> in Render environment variables.
          </div>
        )}
      </div>

      {/* Results Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.35rem", fontWeight: 700 }}>
          Government Resolutions ({resolutions.length})
        </h3>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Showing latest published orders
        </span>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
          <RefreshCw className="spin" size={32} style={{ animation: "spin 1s linear infinite", marginBottom: "1rem" }} />
          <p>Querying 5D AI Tagged Government Resolutions...</p>
        </div>
      ) : resolutions.length === 0 ? (
        <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <FileText size={48} style={{ color: "var(--text-subtle)", marginBottom: "1rem" }} />
          <h4>No Resolutions Found</h4>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Try loosening your filters or searching with different keywords.</p>
        </div>
      ) : (
        <div className="gr-grid">
          {resolutions.map((res) => {
            const classification = res.classification || {};
            const geo = classification.geography || {};
            const summary = classification.summary_en;

            return (
              <div key={res.ref_id} className="glass-panel gr-card">
                <div>
                  {/* Top Meta Bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.85rem" }}>
                    <button
                      onClick={() => copyRefId(res.ref_id)}
                      title="Click to copy Ref ID"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "6px",
                        padding: "0.2rem 0.5rem",
                        color: "var(--text-muted)",
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        cursor: "pointer",
                      }}
                    >
                      {copiedId === res.ref_id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      #{res.ref_id}
                    </button>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>
                      📅 {res.gr_date || "Recent"}
                    </span>
                  </div>

                  {/* Department Tag */}
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span className="badge badge-saffron">
                      🏢 {getDeptName(res.department_name)}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 600, lineHeight: 1.45, marginBottom: "0.85rem", color: "#fff" }}>
                    {res.title}
                  </h4>

                  {/* 5D Badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
                    {classification.intent && getIntentBadge(classification.intent)}
                    {geo.districts && geo.districts.length > 0 && (
                      <span className="badge badge-blue">
                        📍 {geo.districts.join(", ")}
                      </span>
                    )}
                    {classification.audience_scope && (
                      <span className="badge badge-purple">
                        👥 {classification.audience_scope.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  {/* Actionable AI Summary */}
                  {summary && (
                    <div
                      style={{
                        background: "rgba(16, 185, 129, 0.06)",
                        borderLeft: "3px solid #10b981",
                        padding: "0.65rem 0.85rem",
                        borderRadius: "4px",
                        fontSize: "0.84rem",
                        lineHeight: 1.45,
                        color: "#e2e8f0",
                        marginBottom: "1.25rem",
                      }}
                    >
                      <strong style={{ color: "#34d399", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>
                        ⚡ 5D AI Key Takeaway
                      </strong>
                      {summary}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-glass)" }}>
                  <a
                    href={res.pdf_link || `https://gr.maharashtra.gov.in/Site/Upload/Government%20Resolutions/English/${res.ref_id}.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: "0.6rem 0.8rem", fontSize: "0.82rem" }}
                  >
                    <Download size={14} /> Download PDF
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `🚨 *Maharashtra Government Resolution*\n\n🏢 *Dept:* ${getDeptName(res.department_name)}\n📝 *Title:* ${res.title}\n\n🔗 *PDF Link:* ${res.pdf_link || `https://gr.maharashtra.gov.in/Site/Upload/Government%20Resolutions/English/${res.ref_id}.pdf`}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-whatsapp"
                    style={{ padding: "0.6rem 0.8rem", fontSize: "0.82rem" }}
                    title="Share via WhatsApp"
                  >
                    <Share2 size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
