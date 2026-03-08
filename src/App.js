import { useState, useRef, useEffect } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const PRODUCT_SECTIONS = [
  { id: "product", label: "Product Info", icon: "◈" },
  { id: "problem", label: "Problem Statement", icon: "⊗" },
  { id: "solution", label: "Solution", icon: "◎" },
  { id: "audience", label: "Audience", icon: "◉" },
  { id: "brand", label: "Brand Guidelines", icon: "◇" },
  { id: "features", label: "Features", icon: "⊞" },
  { id: "capabilities", label: "Capabilities", icon: "⊕" },
  { id: "specs", label: "Product Specs", icon: "≡" },
  { id: "competitors", label: "Competitors", icon: "⊜" },
];

const NARRATIVE_SECTIONS = [
  { id: "positioning", label: "Positioning Statement", icon: "⊙" },
  { id: "pillars", label: "Messaging Pillars", icon: "▦" },
  { id: "architecture", label: "Messaging Architecture", icon: "⬡" },
  { id: "userpersona", label: "User Persona", icon: "◉" },
  { id: "buyerpersona", label: "Buyer Persona", icon: "◈" },
  { id: "valueprop", label: "Value Proposition", icon: "◆" },
  { id: "paingain", label: "Pain vs Gain", icon: "⚖" },
  { id: "benefits", label: "Benefits", icon: "✦" },
  { id: "differentiators", label: "Differentiators", icon: "⊛" },
];

const PMM_SUGGESTED_SECTIONS = [
  { label: "Competitive Battlecard", icon: "⚔", desc: "Head-to-head comparison for sales enablement" },
  { label: "Launch Narrative", icon: "▶", desc: "Story arc for product launches" },
  { label: "Category Design", icon: "◐", desc: "Define or redefine your market category" },
  { label: "Analyst Narrative", icon: "▣", desc: "Framing for Gartner, Forrester, IDC briefings" },
  { label: "Sales Enablement Brief", icon: "▤", desc: "What sales needs to know and say" },
  { label: "Objection Handling", icon: "◫", desc: "Common objections and best responses" },
  { label: "Customer Evidence", icon: "★", desc: "Quotes, case studies, proof points" },
  { label: "Pricing Narrative", icon: "◎", desc: "How to talk about pricing and value" },
  { label: "GTM Motion", icon: "◷", desc: "Go-to-market strategy and channels" },
  { label: "Press Narrative", icon: "▥", desc: "Messaging for media and PR" },
];

const TONE_OPTIONS = ["Professional", "Friendly", "Bold", "Minimalist", "Playful", "Technical", "Empathetic"];
const FONT_OPTIONS = ["Sans-serif", "Serif", "Monospace", "Display", "Humanist"];

const AI_SUGGESTIONS = {
  productName: ["Consider a name that reflects your core value proposition", "Short, memorable names (2 syllables) tend to have better recall", "Make sure the name is domain-available"],
  problem: ["Use customer language, not internal jargon", "Quantify the pain — how much time/money is lost?", "Focus on one core problem rather than multiple issues"],
  solution: ["Lead with the outcome, not the feature", "Contrast clearly with how people solve this today", "Keep it to 2–3 sentences max"],
  audience: ["Define a primary persona before adding secondary ones", "Include psychographics, not just demographics", "Who is NOT your audience? Exclusion sharpens focus"],
  features: ["Lead with the benefit, not the feature name", "Group features by job-to-be-done", "Avoid listing more than 6–8 features — prioritize ruthlessly"],
  capabilities: ["Differentiate capabilities from features — capabilities are what the system CAN DO", "Include integration capabilities if relevant", "Technical users want specifics; business users want outcomes"],
  specs: ["Use consistent units across all specs", "Include performance benchmarks where possible", "Note any compatibility requirements upfront"],
  positioning: ["Use Moore's exact template: For [target] who [need], [product] is a [category] that [benefit]. Unlike [alternative], we [differentiator].", "Keep the alternative honest — name a real competitor or approach", "The differentiator should be provable, not aspirational"],
  pillars: ["Limit to 3 pillars max — more dilutes focus", "Each pillar should support the positioning statement", "Make each pillar ownable — something competitors can't credibly claim"],
  valueprop: ["The best value props are outcome-oriented: X helps Y do Z", "Quantify value where possible — time saved, revenue gained", "A/B test different framings with real prospects"],
  paingain: ["Pains should be emotional as well as functional", "Gains should go beyond feature benefits to business outcomes", "Map each pain to a specific gain your product delivers"],
  benefits: ["Separate functional benefits from emotional benefits", "Benefits answer 'so what?' for every feature", "Order benefits by what your buyer cares about most"],
  differentiators: ["True differentiators are provable, relevant, and sustainable", "Avoid 'we are the only...' unless truly verifiable", "Differentiation can be product, experience, or business model"],
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

function SuggestionPill({ text }) {
  return (
    <span style={{ display: "inline-block", background: "#f0edff", color: "#5b3de8", fontSize: "11px", padding: "3px 10px", borderRadius: "20px", marginRight: "6px", marginBottom: "6px", border: "1px solid #d6caff", fontFamily: "inherit" }}>{text}</span>
  );
}

function AISuggestButton({ field, onSuggest }) {
  return (
    <button onClick={() => onSuggest(field)} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: "inherit", marginTop: "6px" }}>
      ✦ AI Suggest
    </button>
  );
}

function TextField({ label, value, onChange, placeholder, multiline = false, field, onSuggest, suggestions, hint }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1a1a2e", marginBottom: "4px" }}>{label}</label>
      {hint && <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "6px", fontStyle: "italic" }}>{hint}</div>}
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: "100%", minHeight: "90px", padding: "12px", borderRadius: "10px", border: "1.5px solid #e8e4f8", fontSize: "14px", fontFamily: "inherit", resize: "vertical", outline: "none", background: "#faf9ff", color: "#1a1a2e", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = "#7c3aed"} onBlur={e => e.target.style.borderColor = "#e8e4f8"} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1.5px solid #e8e4f8", fontSize: "14px", fontFamily: "inherit", outline: "none", background: "#faf9ff", color: "#1a1a2e", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = "#7c3aed"} onBlur={e => e.target.style.borderColor = "#e8e4f8"} />
      )}
      {field && <AISuggestButton field={field} onSuggest={onSuggest} />}
      {suggestions && suggestions.length > 0 && <div style={{ marginTop: "8px" }}>{suggestions.map((s, i) => <SuggestionPill key={i} text={s} />)}</div>}
    </div>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: "white", borderRadius: "16px", padding: "28px", border: "1px solid #ede9ff", boxShadow: "0 2px 12px rgba(124,58,237,0.04)", marginBottom: "20px", ...style }}>{children}</div>;
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
      <div style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #ede9ff, #ddd6fe)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "12px", color: "#888", marginTop: "1px" }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function NarrativeCard({ card, onUpdate, onDelete, accentColor = "#7c3aed" }) {
  return (
    <div style={{ background: "#faf9ff", border: "1.5px solid #ede9ff", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px", borderTop: `3px solid ${accentColor}` }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <input value={card.title} onChange={e => onUpdate({ ...card, title: e.target.value })} placeholder="Title"
          style={{ flex: 1, fontWeight: 700, fontSize: "14px", border: "none", background: "transparent", color: "#1a1a2e", fontFamily: "inherit", outline: "none" }} />
        <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "16px" }}>×</button>
      </div>
      <textarea value={card.desc} onChange={e => onUpdate({ ...card, desc: e.target.value })} placeholder="Add description..."
        style={{ border: "none", background: "transparent", resize: "none", fontSize: "13px", color: "#555", fontFamily: "inherit", outline: "none", minHeight: "60px" }} />
      {card.hasTag && (
        <select value={card.tag} onChange={e => onUpdate({ ...card, tag: e.target.value })}
          style={{ fontSize: "11px", border: `1px solid #e0daff`, borderRadius: "6px", padding: "3px 8px", color: accentColor, background: "#f5f3ff", fontFamily: "inherit", cursor: "pointer", width: "fit-content" }}>
          {(card.tagOptions || []).map(t => <option key={t}>{t}</option>)}
        </select>
      )}
    </div>
  );
}

function FeatureCard({ feature, onUpdate, onDelete }) {
  return (
    <div style={{ background: "#faf9ff", border: "1.5px solid #ede9ff", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <input value={feature.title} onChange={e => onUpdate({ ...feature, title: e.target.value })} placeholder="Feature name"
          style={{ flex: 1, fontWeight: 700, fontSize: "14px", border: "none", background: "transparent", color: "#1a1a2e", fontFamily: "inherit", outline: "none" }} />
        <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "16px" }}>×</button>
      </div>
      <textarea value={feature.desc} onChange={e => onUpdate({ ...feature, desc: e.target.value })} placeholder="Describe this feature and its benefit..."
        style={{ border: "none", background: "transparent", resize: "none", fontSize: "13px", color: "#555", fontFamily: "inherit", outline: "none", minHeight: "56px" }} />
      <select value={feature.status} onChange={e => onUpdate({ ...feature, status: e.target.value })}
        style={{ fontSize: "11px", border: "1px solid #e0daff", borderRadius: "6px", padding: "3px 8px", color: "#7c3aed", background: "#f5f3ff", fontFamily: "inherit", cursor: "pointer", width: "fit-content" }}>
        <option>Live</option><option>Beta</option><option>Planned</option><option>Deprecated</option>
      </select>
    </div>
  );
}

function ColorSwatch({ color, onChange }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginRight: "10px", marginBottom: "8px" }}>
      <input type="color" value={color.hex} onChange={e => onChange({ ...color, hex: e.target.value })} style={{ width: "32px", height: "32px", border: "none", borderRadius: "6px", cursor: "pointer" }} />
      <input value={color.name} onChange={e => onChange({ ...color, name: e.target.value })} placeholder="Name" style={{ width: "80px", fontSize: "12px", border: "1px solid #e8e4f8", borderRadius: "6px", padding: "4px 8px", fontFamily: "inherit", background: "#faf9ff", outline: "none" }} />
    </div>
  );
}

// ─── Positioning Builder ──────────────────────────────────────────────────────

function PositioningBuilder({ data, onChange, onSuggest, suggestions }) {
  const fields = [
    { key: "target", label: "Target Customer", placeholder: "e.g. Enterprise CTOs at mid-market SaaS companies" },
    { key: "need", label: "Compelling Need", placeholder: "e.g. reduce infrastructure costs without sacrificing uptime" },
    { key: "product", label: "Product Name", placeholder: "e.g. CloudScale" },
    { key: "category", label: "Market Category", placeholder: "e.g. cloud infrastructure management platform" },
    { key: "benefit", label: "Key Benefit", placeholder: "e.g. automatically optimizes resource usage in real time" },
    { key: "alternative", label: "Primary Alternative", placeholder: "e.g. manual DevOps config or legacy cloud tools" },
  ];
  return (
    <div>
      {/* Live preview */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #2d1b69)", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Geoffrey Moore — Live Preview</div>
        <p style={{ fontSize: "15px", lineHeight: "1.9", color: "white", margin: 0, fontStyle: "italic" }}>
          <span style={{ color: "#a78bfa" }}>For </span><span style={{ color: data.target ? "#fde68a" : "#6b7280" }}>{data.target || "[target customer]"}</span>
          <span style={{ color: "#a78bfa" }}> who </span><span style={{ color: data.need ? "#fde68a" : "#6b7280" }}>{data.need || "[compelling need]"}</span>
          <span style={{ color: "#a78bfa" }}>, </span><span style={{ color: data.product ? "#fde68a" : "#6b7280" }}>{data.product || "[product name]"}</span>
          <span style={{ color: "#a78bfa" }}> is a </span><span style={{ color: data.category ? "#fde68a" : "#6b7280" }}>{data.category || "[market category]"}</span>
          <span style={{ color: "#a78bfa" }}> that </span><span style={{ color: data.benefit ? "#fde68a" : "#6b7280" }}>{data.benefit || "[key benefit]"}</span>
          <span style={{ color: "#a78bfa" }}>. Unlike </span><span style={{ color: data.alternative ? "#fde68a" : "#6b7280" }}>{data.alternative || "[primary alternative]"}</span>
          <span style={{ color: "#a78bfa" }}>, our product </span><span style={{ color: data.differentiator ? "#fde68a" : "#6b7280" }}>{data.differentiator || "[key differentiator]"}</span>
          <span style={{ color: "#a78bfa" }}>.</span>
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#7c3aed", marginBottom: "5px" }}>{f.label}</label>
            <input value={data[f.key] || ""} onChange={e => onChange({ ...data, [f.key]: e.target.value })} placeholder={f.placeholder}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e8e4f8", fontSize: "13px", fontFamily: "inherit", outline: "none", background: "#faf9ff", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#7c3aed"} onBlur={e => e.target.style.borderColor = "#e8e4f8"} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: "14px" }}>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#7c3aed", marginBottom: "5px" }}>Key Differentiator</label>
        <input value={data.differentiator || ""} onChange={e => onChange({ ...data, differentiator: e.target.value })} placeholder="e.g. uses AI to do this autonomously — no engineering intervention required"
          style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e8e4f8", fontSize: "13px", fontFamily: "inherit", outline: "none", background: "#faf9ff", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = "#7c3aed"} onBlur={e => e.target.style.borderColor = "#e8e4f8"} />
      </div>
      <AISuggestButton field="positioning" onSuggest={onSuggest} />
      {suggestions && suggestions.length > 0 && <div style={{ marginTop: "8px" }}>{suggestions.map((s, i) => <SuggestionPill key={i} text={s} />)}</div>}
    </div>
  );
}

// ─── Persona Builder ──────────────────────────────────────────────────────────

function PersonaBuilder({ data, onChange, type }) {
  const fields = type === "user" ? [
    { key: "name", label: "Persona Name", placeholder: "e.g. 'Pragmatic Pete'" },
    { key: "role", label: "Role / Title", placeholder: "e.g. Senior Software Engineer" },
    { key: "goals", label: "Goals & Motivations", placeholder: "What does this person want to achieve?", multi: true },
    { key: "frustrations", label: "Frustrations & Pain Points", placeholder: "What slows them down?", multi: true },
    { key: "behaviors", label: "Key Behaviors", placeholder: "How do they work day-to-day?", multi: true },
    { key: "tools", label: "Tools They Use", placeholder: "e.g. Jira, Slack, VS Code, GitHub" },
  ] : [
    { key: "name", label: "Persona Name", placeholder: "e.g. 'Executive Emma'" },
    { key: "role", label: "Role / Title", placeholder: "e.g. VP of Engineering / CTO" },
    { key: "priorities", label: "Business Priorities", placeholder: "What business outcomes do they care about?", multi: true },
    { key: "objections", label: "Likely Objections", placeholder: "What might make them hesitate?", multi: true },
    { key: "success", label: "Definition of Success", placeholder: "How do they measure ROI?", multi: true },
    { key: "influence", label: "Buying Influence", placeholder: "e.g. Final decision maker, champion, blocker" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      {fields.map(f => (
        <div key={f.key} style={{ gridColumn: f.multi ? "1 / -1" : "auto" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#1a1a2e", marginBottom: "5px" }}>{f.label}</label>
          {f.multi ? (
            <textarea value={data[f.key] || ""} onChange={e => onChange({ ...data, [f.key]: e.target.value })} placeholder={f.placeholder}
              style={{ width: "100%", minHeight: "75px", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e8e4f8", fontSize: "13px", fontFamily: "inherit", outline: "none", background: "#faf9ff", boxSizing: "border-box", resize: "vertical" }}
              onFocus={e => e.target.style.borderColor = "#7c3aed"} onBlur={e => e.target.style.borderColor = "#e8e4f8"} />
          ) : (
            <input value={data[f.key] || ""} onChange={e => onChange({ ...data, [f.key]: e.target.value })} placeholder={f.placeholder}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e8e4f8", fontSize: "13px", fontFamily: "inherit", outline: "none", background: "#faf9ff", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#7c3aed"} onBlur={e => e.target.style.borderColor = "#e8e4f8"} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Pain vs Gain ─────────────────────────────────────────────────────────────

function PainGainBuilder({ items, onChange }) {
  const addRow = () => onChange([...items, { id: Date.now(), pain: "", gain: "" }]);
  const removeRow = id => onChange(items.filter(r => r.id !== id));
  const updateRow = (id, field, val) => onChange(items.map(r => r.id === id ? { ...r, [field]: val } : r));
  return (
    <div>
      <div style={{ border: "1.5px solid #ede9ff", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 32px" }}>
          <div style={{ background: "#fef2f2", padding: "10px 16px", fontSize: "12px", fontWeight: 700, color: "#ef4444", borderBottom: "1px solid #ede9ff" }}>✗ Pain (Customer's Problem)</div>
          <div style={{ background: "#f0fdf4", padding: "10px 16px", fontSize: "12px", fontWeight: 700, color: "#22c55e", borderBottom: "1px solid #ede9ff", borderLeft: "1px solid #ede9ff" }}>✓ Gain (Your Solution Delivers)</div>
          <div style={{ background: "#f5f3ff", borderBottom: "1px solid #ede9ff", borderLeft: "1px solid #ede9ff" }}></div>
        </div>
        {items.map((row, i) => (
          <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 32px", borderBottom: i < items.length - 1 ? "1px solid #f5f3ff" : "none" }}>
            <div style={{ padding: "10px 12px" }}>
              <textarea value={row.pain} onChange={e => updateRow(row.id, "pain", e.target.value)} placeholder="e.g. Hours lost manually updating dashboards..."
                style={{ width: "100%", border: "none", background: "transparent", fontSize: "13px", fontFamily: "inherit", outline: "none", resize: "none", minHeight: "52px", color: "#1a1a2e" }} />
            </div>
            <div style={{ padding: "10px 12px", borderLeft: "1px solid #ede9ff" }}>
              <textarea value={row.gain} onChange={e => updateRow(row.id, "gain", e.target.value)} placeholder="e.g. Automated reporting saves 5+ hours/week..."
                style={{ width: "100%", border: "none", background: "transparent", fontSize: "13px", fontFamily: "inherit", outline: "none", resize: "none", minHeight: "52px", color: "#1a1a2e" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #ede9ff" }}>
              <button onClick={() => removeRow(row.id)} style={{ background: "none", border: "none", color: "#ddd", cursor: "pointer", fontSize: "16px" }}>×</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addRow} style={{ marginTop: "12px", background: "none", border: "1px dashed #c4b5fd", borderRadius: "8px", padding: "8px 18px", color: "#7c3aed", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>+ Add Row</button>
    </div>
  );
}

// ─── PMM Suggestions Panel ────────────────────────────────────────────────────

function PMMSuggestions({ existingLabels, onAdd }) {
  const available = PMM_SUGGESTED_SECTIONS.filter(s => !existingLabels.includes(s.label));
  if (!available.length) return null;
  return (
    <Card style={{ background: "linear-gradient(135deg, #faf9ff, #f0edff)", border: "1.5px dashed #c4b5fd" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "14px" }}>✦</div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a2e" }}>AI-Suggested Sections for PMMs</div>
          <div style={{ fontSize: "11px", color: "#888" }}>Click any to add it to your Core Narrative sidebar</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "10px" }}>
        {available.map(s => (
          <button key={s.label} onClick={() => onAdd(s)}
            style={{ textAlign: "left", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #d6caff", background: "white", cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.background = "#faf9ff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#d6caff"; e.currentTarget.style.background = "white"; }}>
            <div style={{ fontSize: "18px", marginBottom: "4px" }}>{s.icon}</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a2e", marginBottom: "2px" }}>+ {s.label}</div>
            <div style={{ fontSize: "11px", color: "#888" }}>{s.desc}</div>
          </button>
        ))}
      </div>
    </Card>
  );
}

// ─── Feedback Tab Components ─────────────────────────────────────────────────

const STATUS_CONFIG = {
  wip:    { label: "Work in Progress", color: "#f59e0b", bg: "#fef3c7", border: "#fcd34d", dot: "#f59e0b" },
  review: { label: "Under Review",     color: "#3b82f6", bg: "#eff6ff", border: "#93c5fd", dot: "#3b82f6" },
  ready:  { label: "Ready",            color: "#10b981", bg: "#ecfdf5", border: "#6ee7b7", dot: "#10b981" },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 600 }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {c.label}
    </span>
  );
}

function StatusToggle({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
        <button key={key} onClick={() => onChange(key)}
          style={{ padding: "5px 12px", borderRadius: "20px", border: `1.5px solid ${value === key ? cfg.border : "#e8e4f8"}`, background: value === key ? cfg.bg : "white", color: value === key ? cfg.color : "#aaa", fontSize: "11px", fontWeight: value === key ? 700 : 400, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: value === key ? cfg.dot : "#ddd", display: "inline-block" }} />
          {cfg.label}
        </button>
      ))}
    </div>
  );
}

function ScoreSlider({ label, team, value, onChange, color }) {
  const pct = ((value - 1) / 4) * 100;
  const scoreColor = value <= 2 ? "#ef4444" : value === 3 ? "#f59e0b" : "#10b981";
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#555" }}>{team}</span>
        <span style={{ fontSize: "18px", fontWeight: 800, color: scoreColor }}>{value}<span style={{ fontSize: "11px", color: "#aaa", fontWeight: 400 }}>/5</span></span>
      </div>
      <div style={{ position: "relative", height: "6px", background: "#f0edff", borderRadius: "10px" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${scoreColor}, ${color})`, borderRadius: "10px", transition: "width 0.3s" }} />
      </div>
      <input type="range" min={1} max={5} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", marginTop: "4px", accentColor: color, cursor: "pointer" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#bbb" }}>
        <span>Not Aligned</span><span>Fully Aligned</span>
      </div>
    </div>
  );
}

function CommentThread({ comments, onAdd, onDelete }) {
  const [draft, setDraft] = useState("");
  const [author, setAuthor] = useState("");
  const handleAdd = () => {
    if (!draft.trim()) return;
    onAdd({ id: Date.now(), author: author || "Anonymous", text: draft.trim(), ts: new Date().toLocaleString(), resolved: false });
    setDraft("");
  };
  return (
    <div style={{ marginTop: "16px" }}>
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a2e", marginBottom: "10px" }}>
        Feedback & Suggestions {comments.length > 0 && <span style={{ background: "#ede9ff", color: "#7c3aed", borderRadius: "10px", padding: "1px 7px", fontSize: "11px", marginLeft: "6px" }}>{comments.length}</span>}
      </div>
      {comments.length === 0 && <div style={{ fontSize: "12px", color: "#bbb", marginBottom: "10px", fontStyle: "italic" }}>No feedback yet. Add the first comment below.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
        {comments.map(c => (
          <div key={c.id} style={{ background: c.resolved ? "#f0fdf4" : "#faf9ff", border: `1px solid ${c.resolved ? "#bbf7d0" : "#ede9ff"}`, borderRadius: "10px", padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "10px", fontWeight: 700 }}>{c.author[0]?.toUpperCase()}</div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a2e" }}>{c.author}</span>
                <span style={{ fontSize: "10px", color: "#bbb" }}>{c.ts}</span>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => onAdd({ ...c, resolved: !c.resolved }, true)} style={{ fontSize: "10px", background: c.resolved ? "#f0fdf4" : "#f5f3ff", border: `1px solid ${c.resolved ? "#6ee7b7" : "#d6caff"}`, borderRadius: "6px", padding: "2px 8px", cursor: "pointer", color: c.resolved ? "#10b981" : "#7c3aed", fontFamily: "inherit" }}>{c.resolved ? "✓ Resolved" : "Resolve"}</button>
                <button onClick={() => onDelete(c.id)} style={{ background: "none", border: "none", color: "#ddd", cursor: "pointer", fontSize: "14px" }}>×</button>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "#444", margin: 0, lineHeight: 1.5 }}>{c.text}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your name"
          style={{ width: "110px", padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #e8e4f8", fontSize: "12px", fontFamily: "inherit", outline: "none", background: "#faf9ff", flexShrink: 0 }}
          onFocus={e => e.target.style.borderColor = "#7c3aed"} onBlur={e => e.target.style.borderColor = "#e8e4f8"} />
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} placeholder="Add feedback or suggestion..."
          style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #e8e4f8", fontSize: "12px", fontFamily: "inherit", outline: "none", background: "#faf9ff" }}
          onFocus={e => e.target.style.borderColor = "#7c3aed"} onBlur={e => e.target.style.borderColor = "#e8e4f8"} />
        <button onClick={handleAdd} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>+ Add</button>
      </div>
    </div>
  );
}

function AlignmentScorecard({ sections }) {
  const salesAvg = (sections.reduce((s, x) => s + x.salesScore, 0) / sections.length).toFixed(1);
  const productAvg = (sections.reduce((s, x) => s + x.productScore, 0) / sections.length).toFixed(1);
  const overall = ((parseFloat(salesAvg) + parseFloat(productAvg)) / 2).toFixed(1);
  const overallPct = Math.round((overall / 5) * 100);
  const overallColor = overall < 2.5 ? "#ef4444" : overall < 3.5 ? "#f59e0b" : "#10b981";
  const overallLabel = overall < 2.5 ? "Needs Work" : overall < 3.5 ? "Progressing" : overall < 4.5 ? "Well Aligned" : "Fully Aligned";

  const circumference = 2 * Math.PI * 42;
  const dash = (overallPct / 100) * circumference;

  return (
    <div style={{ background: "white", borderRadius: "16px", border: "1px solid #ede9ff", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(124,58,237,0.04)" }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a2e", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #ede9ff, #ddd6fe)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>◎</div>
        Alignment Scorecard
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "32px", alignItems: "center" }}>
        {/* Donut chart */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div style={{ position: "relative", width: "100px", height: "100px" }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f0edff" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={overallColor} strokeWidth="10"
                strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.6s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "22px", fontWeight: 800, color: overallColor, lineHeight: 1 }}>{overall}</span>
              <span style={{ fontSize: "9px", color: "#aaa" }}>/ 5.0</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: overallColor }}>{overallLabel}</div>
            <div style={{ fontSize: "11px", color: "#aaa" }}>Overall Score</div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {[{ label: "Sales", val: salesAvg, color: "#7c3aed" }, { label: "Product", val: productAvg, color: "#4f46e5" }].map(t => (
              <div key={t.label} style={{ textAlign: "center", background: "#faf9ff", border: "1px solid #ede9ff", borderRadius: "8px", padding: "6px 10px" }}>
                <div style={{ fontSize: "16px", fontWeight: 800, color: t.color }}>{t.val}</div>
                <div style={{ fontSize: "10px", color: "#aaa" }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-section breakdown */}
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", gap: "0", border: "1px solid #ede9ff", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ background: "#f5f3ff", padding: "8px 12px", fontSize: "11px", fontWeight: 700, color: "#7c3aed", borderBottom: "1px solid #ede9ff" }}>Section</div>
            <div style={{ background: "#f5f3ff", padding: "8px 12px", fontSize: "11px", fontWeight: 700, color: "#7c3aed", borderBottom: "1px solid #ede9ff", textAlign: "center", borderLeft: "1px solid #ede9ff" }}>Status</div>
            <div style={{ background: "#f5f3ff", padding: "8px 12px", fontSize: "11px", fontWeight: 700, color: "#7c3aed", borderBottom: "1px solid #ede9ff", textAlign: "center", borderLeft: "1px solid #ede9ff" }}>Sales</div>
            <div style={{ background: "#f5f3ff", padding: "8px 12px", fontSize: "11px", fontWeight: 700, color: "#7c3aed", borderBottom: "1px solid #ede9ff", textAlign: "center", borderLeft: "1px solid #ede9ff" }}>Product</div>
            {sections.map((s, i) => {
              const sc = STATUS_CONFIG[s.status];
              const sColor = s.salesScore <= 2 ? "#ef4444" : s.salesScore === 3 ? "#f59e0b" : "#10b981";
              const pColor = s.productScore <= 2 ? "#ef4444" : s.productScore === 3 ? "#f59e0b" : "#10b981";
              return [
                <div key={`l${i}`} style={{ padding: "9px 12px", fontSize: "12px", color: "#333", borderBottom: i < sections.length - 1 ? "1px solid #f5f3ff" : "none", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{s.icon}</span>{s.label}
                </div>,
                <div key={`st${i}`} style={{ padding: "9px 12px", borderBottom: i < sections.length - 1 ? "1px solid #f5f3ff" : "none", borderLeft: "1px solid #ede9ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                </div>,
                <div key={`s${i}`} style={{ padding: "9px 12px", fontSize: "13px", fontWeight: 700, color: sColor, borderBottom: i < sections.length - 1 ? "1px solid #f5f3ff" : "none", borderLeft: "1px solid #ede9ff", textAlign: "center" }}>{s.salesScore}/5</div>,
                <div key={`p${i}`} style={{ padding: "9px 12px", fontSize: "13px", fontWeight: 700, color: pColor, borderBottom: i < sections.length - 1 ? "1px solid #f5f3ff" : "none", borderLeft: "1px solid #ede9ff", textAlign: "center" }}>{s.productScore}/5</div>,
              ];
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function InternalAlignmentSection({ id, icon, label, contentPreview, sectionData, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const handleCommentAdd = (comment, isUpdate) => {
    if (isUpdate) {
      onChange({ ...sectionData, comments: sectionData.comments.map(c => c.id === comment.id ? comment : c) });
    } else {
      onChange({ ...sectionData, comments: [comment, ...sectionData.comments] });
    }
  };
  const handleCommentDelete = id => onChange({ ...sectionData, comments: sectionData.comments.filter(c => c.id !== id) });
  const unresolvedCount = sectionData.comments.filter(c => !c.resolved).length;

  return (
    <div style={{ background: "white", borderRadius: "14px", border: "1px solid #ede9ff", marginBottom: "14px", overflow: "hidden", boxShadow: "0 1px 6px rgba(124,58,237,0.03)" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }} onClick={() => setExpanded(e => !e)}>
        <div style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #ede9ff, #ddd6fe)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a2e" }}>{label}</span>
            <StatusBadge status={sectionData.status} />
            {unresolvedCount > 0 && <span style={{ background: "#fff3cd", color: "#92400e", border: "1px solid #fcd34d", borderRadius: "10px", padding: "1px 8px", fontSize: "10px", fontWeight: 600 }}>{unresolvedCount} open</span>}
          </div>
          {contentPreview && <p style={{ fontSize: "12px", color: "#888", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contentPreview}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {[{ t: "Sales", v: sectionData.salesScore }, { t: "Prod", v: sectionData.productScore }].map(sc => {
              const c = sc.v <= 2 ? "#ef4444" : sc.v === 3 ? "#f59e0b" : "#10b981";
              return <div key={sc.t} style={{ textAlign: "center" }}><div style={{ fontSize: "14px", fontWeight: 800, color: c }}>{sc.v}</div><div style={{ fontSize: "9px", color: "#bbb" }}>{sc.t}</div></div>;
            })}
          </div>
          <span style={{ color: "#bbb", fontSize: "14px", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f5f3ff" }}>
          {/* Content preview */}
          {contentPreview && (
            <div style={{ background: "#faf9ff", borderRadius: "10px", padding: "14px", marginTop: "16px", marginBottom: "16px", border: "1px solid #ede9ff" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Current Content (from Core Narrative)</div>
              <p style={{ fontSize: "13px", color: "#444", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{contentPreview}</p>
            </div>
          )}
          {/* Status toggle */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "8px" }}>Status</div>
            <StatusToggle value={sectionData.status} onChange={v => onChange({ ...sectionData, status: v })} />
          </div>
          {/* Scores */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "8px" }}>
            <ScoreSlider label="Sales Alignment" team="Sales Alignment" value={sectionData.salesScore} onChange={v => onChange({ ...sectionData, salesScore: v })} color="#7c3aed" />
            <ScoreSlider label="Product Alignment" team="Product Alignment" value={sectionData.productScore} onChange={v => onChange({ ...sectionData, productScore: v })} color="#4f46e5" />
          </div>
          {/* Comments */}
          <CommentThread comments={sectionData.comments} onAdd={handleCommentAdd} onDelete={handleCommentDelete} />
        </div>
      )}
    </div>
  );
}

function GTMAssetsSection({ assets, onChange }) {
  const DEFAULT_ASSETS = [
    { key: "battlecard", label: "Competitive Battlecard", icon: "⚔" },
    { key: "salesDeck", label: "Sales Deck", icon: "▣" },
    { key: "brochure", label: "Brochure", icon: "▤" },
    { key: "datasheet", label: "Datasheet", icon: "≡" },
    { key: "onePager", label: "One Pager", icon: "◻" },
  ];

  const updateAsset = (key, data) => onChange({ ...assets, [key]: data });
  const updateCustom = (id, data) => onChange({ ...assets, custom: assets.custom.map(a => a.id === id ? { ...a, ...data } : a) });
  const addCustom = () => {
    const label = prompt("Asset name:");
    if (label) onChange({ ...assets, custom: [...assets.custom, { id: Date.now(), label, icon: "◇", status: "wip", comments: [] }] });
  };
  const removeCustom = id => onChange({ ...assets, custom: assets.custom.filter(a => a.id !== id) });

  return (
    <div style={{ background: "white", borderRadius: "16px", border: "1px solid #ede9ff", padding: "24px", marginTop: "8px", boxShadow: "0 2px 12px rgba(124,58,237,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #ede9ff, #ddd6fe)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>▦</div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a2e" }}>GTM Assets</div>
            <div style={{ fontSize: "11px", color: "#888" }}>Sales enablement materials & their readiness</div>
          </div>
        </div>
        <button onClick={addCustom} style={{ fontSize: "12px", color: "#7c3aed", background: "#f5f3ff", border: "1px solid #d6caff", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" }}>+ Add Asset</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
        {DEFAULT_ASSETS.map(({ key, label, icon }) => {
          const data = assets[key] || { status: "wip", comments: [] };
          const unresolved = data.comments?.filter(c => !c.resolved).length || 0;
          return (
            <AssetCard key={key} icon={icon} label={label} data={data}
              onChange={d => updateAsset(key, d)} unresolved={unresolved} />
          );
        })}
        {assets.custom?.map(a => {
          const unresolved = a.comments?.filter(c => !c.resolved).length || 0;
          return (
            <AssetCard key={a.id} icon={a.icon} label={a.label} data={a}
              onChange={d => updateCustom(a.id, d)} unresolved={unresolved}
              onDelete={() => removeCustom(a.id)} />
          );
        })}
      </div>
    </div>
  );
}

function AssetCard({ icon, label, data, onChange, unresolved, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const sc = STATUS_CONFIG[data.status];
  const handleCommentAdd = (comment, isUpdate) => {
    const comments = data.comments || [];
    if (isUpdate) onChange({ ...data, comments: comments.map(c => c.id === comment.id ? comment : c) });
    else onChange({ ...data, comments: [comment, ...comments] });
  };
  return (
    <div style={{ border: `1.5px solid ${expanded ? "#c4b5fd" : "#ede9ff"}`, borderRadius: "12px", overflow: "hidden", transition: "border-color 0.2s" }}>
      <div style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", background: expanded ? "#faf9ff" : "white" }} onClick={() => setExpanded(e => !e)}>
        <div style={{ width: "32px", height: "32px", background: sc.bg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0, border: `1px solid ${sc.border}` }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a2e", marginBottom: "3px" }}>{label}</div>
          <StatusBadge status={data.status} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {unresolved > 0 && <span style={{ background: "#fff3cd", color: "#92400e", border: "1px solid #fcd34d", borderRadius: "10px", padding: "1px 7px", fontSize: "10px", fontWeight: 600 }}>{unresolved}</span>}
          {onDelete && <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ background: "none", border: "none", color: "#ddd", cursor: "pointer", fontSize: "15px" }}>×</button>}
          <span style={{ color: "#bbb", fontSize: "12px", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "14px 16px", borderTop: "1px solid #f5f3ff" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "8px" }}>Status</div>
          <StatusToggle value={data.status} onChange={v => onChange({ ...data, status: v })} />
          <CommentThread comments={data.comments || []} onAdd={handleCommentAdd} onDelete={id => onChange({ ...data, comments: (data.comments || []).filter(c => c.id !== id) })} />
        </div>
      )}
    </div>
  );
}

function FeedbackTab({ positioning, pillars, differentiators, features, benefits, valueProps, feedbackData, setFeedbackData }) {
  const subTab = feedbackData.activeSubTab;
  const setSubTab = t => setFeedbackData(p => ({ ...p, activeSubTab: t }));
  const internal = feedbackData.internal;

  const updateSection = (key, data) => setFeedbackData(p => ({ ...p, internal: { ...p.internal, [key]: data } }));
  const updateGTM = data => setFeedbackData(p => ({ ...p, internal: { ...p.internal, gtmAssets: data } }));

  // Build content previews from other tabs
  const posPreview = positioning.target
    ? `For ${positioning.target} who ${positioning.need || "..."}, ${positioning.product || "..."} is a ${positioning.category || "..."} that ${positioning.benefit || "..."}. Unlike ${positioning.alternative || "..."}, our product ${positioning.differentiator || "..."}.`
    : "No positioning statement entered yet — fill it in under Core Narrative → Positioning Statement.";

  const pillarsPreview = pillars.length > 0
    ? pillars.map((p, i) => `${i + 1}. ${p.title}${p.desc ? `: ${p.desc}` : ""}`).join("\n")
    : "No messaging pillars defined yet — add them under Core Narrative → Messaging Pillars.";

  const diffsPreview = differentiators.length > 0
    ? differentiators.map((d, i) => `${i + 1}. [${d.tag || "Product"}] ${d.title}${d.desc ? ` — ${d.desc}` : ""}`).join("\n")
    : "No differentiators defined yet — add them under Core Narrative → Differentiators.";

  const fbPreview = features.length > 0 || benefits.length > 0
    ? [
        features.length > 0 ? `Features:\n${features.map(f => `• ${f.title}: ${f.desc}`).join("\n")}` : "",
        benefits.length > 0 ? `Benefits:\n${benefits.map(b => `• ${b.title}: ${b.desc}`).join("\n")}` : "",
      ].filter(Boolean).join("\n\n")
    : "No features or benefits defined yet — add them under Product Truth and Core Narrative tabs.";

  const INTERNAL_SECTIONS = [
    { id: "positioning", label: "Positioning Statement", icon: "⊙", key: "positioning", preview: posPreview },
    { id: "messaging", label: "Messaging", icon: "▦", key: "messaging", preview: pillarsPreview },
    { id: "differentiators", label: "Top Differentiators", icon: "⊛", key: "differentiators", preview: diffsPreview },
    { id: "featureBenefits", label: "Features vs Benefits", icon: "⊞", key: "featureBenefits", preview: fbPreview },
  ];

  const scorecardSections = INTERNAL_SECTIONS.map(s => ({
    label: s.label, icon: s.icon,
    status: internal[s.key]?.status || "wip",
    salesScore: internal[s.key]?.salesScore || 3,
    productScore: internal[s.key]?.productScore || 3,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sub-tab bar */}
      <div style={{ background: "white", borderBottom: "1px solid #ede9ff", padding: "0 28px", display: "flex", alignItems: "center", gap: "4px", height: "48px", flexShrink: 0 }}>
        {[{ id: "internal", label: "Internal Alignment", icon: "◈" }, { id: "market", label: "Market Alignment", icon: "◎" }].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            style={{ padding: "8px 18px", border: "none", background: "none", color: subTab === t.id ? "#7c3aed" : "#888", fontSize: "13px", fontWeight: subTab === t.id ? 700 : 400, cursor: "pointer", fontFamily: "inherit", borderBottom: `2px solid ${subTab === t.id ? "#7c3aed" : "transparent"}`, display: "flex", alignItems: "center", gap: "6px" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {subTab === "internal" ? (
          <div style={{ maxWidth: "900px" }}>
            {/* Scorecard */}
            <AlignmentScorecard sections={scorecardSections} />

            {/* Section heading */}
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>◈</span> Messaging & Positioning
            </div>

            {INTERNAL_SECTIONS.map(s => (
              <InternalAlignmentSection key={s.id} id={s.id} icon={s.icon} label={s.label}
                contentPreview={s.preview} sectionData={internal[s.key] || { status: "wip", comments: [], salesScore: 3, productScore: 3 }}
                onChange={data => updateSection(s.key, data)} />
            ))}

            {/* GTM Assets */}
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.8px", margin: "24px 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>▦</span> GTM Assets
            </div>
            <GTMAssetsSection assets={internal.gtmAssets} onChange={updateGTM} />
          </div>
        ) : (
          <div style={{ maxWidth: "900px" }}>
            <div style={{ background: "white", borderRadius: "16px", border: "1px solid #ede9ff", padding: "48px", textAlign: "center", boxShadow: "0 2px 12px rgba(124,58,237,0.04)" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>◎</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#1a1a2e", marginBottom: "8px" }}>Market Alignment</div>
              <div style={{ fontSize: "14px", color: "#888", maxWidth: "400px", margin: "0 auto" }}>
                Market Alignment tracking is coming soon. This will include win/loss analysis, ICP match scoring, and customer feedback loops.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function ProductTruth() {
  const [activeTab, setActiveTab] = useState("product");
  const [activeSection, setActiveSection] = useState("product");
  const [activeNarrativeSection, setActiveNarrativeSection] = useState("positioning");
  const [saved, setSaved] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: "assistant", text: "Hi! I'm your PMM AI Assistant. Ask me for suggestions on any section, frameworks to apply, or competitor comparisons." }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeSuggestions, setActiveSuggestions] = useState({});
  const chatEndRef = useRef(null);

  // Product Truth state
  const [productData, setProductData] = useState({ name: "", tagline: "", version: "" });
  const [problemData, setProblemData] = useState({ statement: "", impact: "", currentSolutions: "" });
  const [solutionData, setSolutionData] = useState({ summary: "", approach: "", uniqueAngle: "" });
  const [audienceData, setAudienceData] = useState({ primary: "", secondary: "", exclusions: "" });
  const [brandData, setBrandData] = useState({ tagline: "", toneOfVoice: [], typography: { heading: "", body: "" }, colors: [{ hex: "#7c3aed", name: "Primary" }, { hex: "#4f46e5", name: "Accent" }], dos: "", donts: "", legalConstraints: "", logoName: "" });
  const [features, setFeatures] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [specs, setSpecs] = useState([{ key: "", value: "" }]);
  const [competitors, setCompetitors] = useState([]);
  const [customSections, setCustomSections] = useState([]);

  // Core Narrative state
  const [positioning, setPositioning] = useState({ target: "", need: "", product: "", category: "", benefit: "", alternative: "", differentiator: "" });
  const [pillars, setPillars] = useState([]);
  const [architecture, setArchitecture] = useState([]);
  const [userPersona, setUserPersona] = useState({});
  const [buyerPersona, setBuyerPersona] = useState({});
  const [valueProps, setValueProps] = useState([]);
  const [painGain, setPainGain] = useState([{ id: 1, pain: "", gain: "" }]);
  const [benefits, setBenefits] = useState([]);
  const [differentiators, setDifferentiators] = useState([]);
  const [customNarrativeSections, setCustomNarrativeSections] = useState([]);

  // Feedback state
  const [feedbackData, setFeedbackData] = useState({
    activeSubTab: "internal",
    internal: {
      positioning: { status: "wip", comments: [], salesScore: 3, productScore: 3 },
      messaging: { status: "wip", comments: [], salesScore: 3, productScore: 3 },
      differentiators: { status: "wip", comments: [], salesScore: 3, productScore: 3 },
      featureBenefits: { status: "wip", comments: [], salesScore: 3, productScore: 3 },
      gtmAssets: {
        battlecard: { status: "wip", comments: [] },
        salesDeck: { status: "wip", comments: [] },
        brochure: { status: "wip", comments: [] },
        datasheet: { status: "wip", comments: [] },
        onePager: { status: "wip", comments: [] },
        custom: [],
      }
    }
  });

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const handleAISuggest = field => {
    const s = AI_SUGGESTIONS[field] || ["Think about your unique value", "Use clear, direct language", "Validate with real users"];
    setActiveSuggestions(prev => ({ ...prev, [field]: s }));
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);
    try {
      const ctx = `Product: ${productData.name || "unnamed"}. Problem: ${problemData.statement || "not set"}. Positioning: For ${positioning.target || "?"} who ${positioning.need || "?"}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `You are a senior PMM assistant helping refine product narratives and messaging. Give concise, actionable suggestions and guidance. Do NOT write content for the user — suggest, coach, and observe. You can compare against competitors if info is provided. Product context: ${ctx}`,
          messages: [{ role: "user", content: userMsg }]
        })
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "I couldn't generate a response.";
      setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", text: "Sorry, couldn't connect. Please try again." }]);
    }
    setChatLoading(false);
  };

  const addCustomNarrativeSection = suggested => {
    const label = suggested?.label || prompt("Section name:");
    if (!label) return;
    const newS = { id: Date.now(), label, icon: suggested?.icon || "◆", content: "" };
    setCustomNarrativeSections(prev => [...prev, newS]);
    setActiveNarrativeSection(`cn_${newS.id}`);
  };

  const addCustomSection = () => {
    const name = prompt("Section name:");
    if (name) setCustomSections(prev => [...prev, { id: Date.now(), label: name, icon: "◆", content: "" }]);
  };

  const allProductSections = [...PRODUCT_SECTIONS, ...customSections.map(s => ({ id: `custom_${s.id}`, label: s.label, icon: s.icon }))];
  const allNarrativeSections = [...NARRATIVE_SECTIONS, ...customNarrativeSections.map(s => ({ id: `cn_${s.id}`, label: s.label, icon: s.icon }))];
  const existingNarrativeLabels = [...NARRATIVE_SECTIONS.map(s => s.label), ...customNarrativeSections.map(s => s.label)];

  // ── Product sections renderer ──
  const renderProductSection = () => {
    if (activeSection === "product") return (
      <Card>
        <SectionHeader icon="◈" title="Product Information" subtitle="Core identity of your product" />
        <TextField label="Product Name" value={productData.name} onChange={v => setProductData(p => ({ ...p, name: v }))} placeholder="e.g. Acme Analytics" field="productName" onSuggest={handleAISuggest} suggestions={activeSuggestions["productName"]} />
        <TextField label="Version / Stage" value={productData.version} onChange={v => setProductData(p => ({ ...p, version: v }))} placeholder="e.g. v2.0 — Public Beta" />
        <TextField label="One-line Description" value={productData.tagline} onChange={v => setProductData(p => ({ ...p, tagline: v }))} placeholder="What does your product do in one sentence?" multiline />
      </Card>
    );
    if (activeSection === "problem") return (
      <Card>
        <SectionHeader icon="⊗" title="Problem Statement" subtitle="The pain you're solving" />
        <TextField label="Core Problem" value={problemData.statement} onChange={v => setProblemData(p => ({ ...p, statement: v }))} placeholder="Describe the core problem your product solves..." multiline field="problem" onSuggest={handleAISuggest} suggestions={activeSuggestions["problem"]} />
        <TextField label="Impact / Stakes" value={problemData.impact} onChange={v => setProblemData(p => ({ ...p, impact: v }))} placeholder="What happens if this problem isn't solved? Quantify where possible..." multiline />
        <TextField label="Current Solutions & Their Gaps" value={problemData.currentSolutions} onChange={v => setProblemData(p => ({ ...p, currentSolutions: v }))} placeholder="How do people solve this today, and why is that insufficient?" multiline />
      </Card>
    );
    if (activeSection === "solution") return (
      <Card>
        <SectionHeader icon="◎" title="Solution" subtitle="How your product solves the problem" />
        <TextField label="Solution Summary" value={solutionData.summary} onChange={v => setSolutionData(p => ({ ...p, summary: v }))} placeholder="Describe your solution clearly..." multiline field="solution" onSuggest={handleAISuggest} suggestions={activeSuggestions["solution"]} />
        <TextField label="Approach / Methodology" value={solutionData.approach} onChange={v => setSolutionData(p => ({ ...p, approach: v }))} placeholder="How does your product achieve this solution?" multiline />
        <TextField label="Unique Angle" value={solutionData.uniqueAngle} onChange={v => setSolutionData(p => ({ ...p, uniqueAngle: v }))} placeholder="What makes your approach different from alternatives?" multiline />
      </Card>
    );
    if (activeSection === "audience") return (
      <Card>
        <SectionHeader icon="◉" title="Target Audience" subtitle="Who you're building for" />
        <TextField label="Primary Audience" value={audienceData.primary} onChange={v => setAudienceData(p => ({ ...p, primary: v }))} placeholder="Define your primary customer persona..." multiline field="audience" onSuggest={handleAISuggest} suggestions={activeSuggestions["audience"]} />
        <TextField label="Secondary Audience" value={audienceData.secondary} onChange={v => setAudienceData(p => ({ ...p, secondary: v }))} placeholder="Any secondary personas?" multiline />
        <TextField label="Exclusions" value={audienceData.exclusions} onChange={v => setAudienceData(p => ({ ...p, exclusions: v }))} placeholder="Who is NOT your audience?" multiline />
      </Card>
    );
    if (activeSection === "brand") return (
      <Card>
        <SectionHeader icon="◇" title="Brand Guidelines" subtitle="Identity and voice of your product" />
        <TextField label="Brand Tagline" value={brandData.tagline} onChange={v => setBrandData(p => ({ ...p, tagline: v }))} placeholder="Your brand's memorable phrase..." />
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1a1a2e", marginBottom: "8px" }}>Tone of Voice</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {TONE_OPTIONS.map(tone => (
              <button key={tone} onClick={() => setBrandData(p => ({ ...p, toneOfVoice: p.toneOfVoice.includes(tone) ? p.toneOfVoice.filter(t => t !== tone) : [...p.toneOfVoice, tone] }))}
                style={{ padding: "6px 14px", borderRadius: "20px", border: `1.5px solid ${brandData.toneOfVoice.includes(tone) ? "#7c3aed" : "#e0daff"}`, background: brandData.toneOfVoice.includes(tone) ? "#ede9ff" : "white", color: brandData.toneOfVoice.includes(tone) ? "#7c3aed" : "#888", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                {tone}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1a1a2e", marginBottom: "8px" }}>Color Palette</label>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
            {brandData.colors.map((c, i) => (<ColorSwatch key={i} color={c} onChange={updated => setBrandData(p => ({ ...p, colors: p.colors.map((col, idx) => idx === i ? updated : col) }))} />))}
            <button onClick={() => setBrandData(p => ({ ...p, colors: [...p.colors, { hex: "#000000", name: "" }] }))} style={{ fontSize: "12px", color: "#7c3aed", background: "none", border: "1px dashed #c4b5fd", borderRadius: "6px", padding: "4px 12px", cursor: "pointer", fontFamily: "inherit" }}>+ Add</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          {["heading", "body"].map(type => (
            <div key={type}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1a1a2e", marginBottom: "6px" }}>{type === "heading" ? "Heading" : "Body"} Font</label>
              <select value={brandData.typography[type]} onChange={e => setBrandData(p => ({ ...p, typography: { ...p.typography, [type]: e.target.value } }))}
                style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1.5px solid #e8e4f8", fontFamily: "inherit", background: "#faf9ff", color: "#1a1a2e", fontSize: "14px" }}>
                <option value="">Select...</option>{FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1a1a2e", marginBottom: "6px" }}>Logo</label>
          <div style={{ border: "2px dashed #d6caff", borderRadius: "12px", padding: "24px", textAlign: "center", background: "#faf9ff" }}>
            <input type="file" accept="image/*" id="logo-upload" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) setBrandData(p => ({ ...p, logoName: f.name })); }} />
            <label htmlFor="logo-upload" style={{ cursor: "pointer", color: "#7c3aed", fontSize: "13px" }}>{brandData.logoName ? `✓ ${brandData.logoName}` : "Click to upload logo (PNG, SVG, JPG)"}</label>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#22c55e", marginBottom: "6px" }}>✓ Do's</label>
            <textarea value={brandData.dos} onChange={e => setBrandData(p => ({ ...p, dos: e.target.value }))} placeholder="e.g. Use active voice, lead with benefits..." style={{ width: "100%", minHeight: "90px", padding: "12px", borderRadius: "10px", border: "1.5px solid #bbf7d0", background: "#f0fdf4", fontFamily: "inherit", fontSize: "13px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#ef4444", marginBottom: "6px" }}>✗ Don'ts</label>
            <textarea value={brandData.donts} onChange={e => setBrandData(p => ({ ...p, donts: e.target.value }))} placeholder="e.g. Avoid jargon, never use passive voice..." style={{ width: "100%", minHeight: "90px", padding: "12px", borderRadius: "10px", border: "1.5px solid #fecaca", background: "#fef2f2", fontFamily: "inherit", fontSize: "13px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <TextField label="Legal Constraints" value={brandData.legalConstraints} onChange={v => setBrandData(p => ({ ...p, legalConstraints: v }))} placeholder="Trademarks, compliance requirements, restricted terminology..." multiline />
      </Card>
    );
    if (activeSection === "features") return (
      <Card>
        <SectionHeader icon="⊞" title="Features" subtitle="What your product does" />
        <AISuggestButton field="features" onSuggest={handleAISuggest} />
        {activeSuggestions["features"] && <div style={{ margin: "8px 0 16px" }}>{activeSuggestions["features"].map((s, i) => <SuggestionPill key={i} text={s} />)}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px", marginTop: "16px" }}>
          {features.map(f => (<FeatureCard key={f.id} feature={f} onUpdate={u => setFeatures(p => p.map(x => x.id === f.id ? u : x))} onDelete={() => setFeatures(p => p.filter(x => x.id !== f.id))} />))}
          <button onClick={() => setFeatures(p => [...p, { id: Date.now(), title: "", desc: "", status: "Planned" }])} style={{ border: "2px dashed #d6caff", borderRadius: "12px", padding: "24px", background: "none", cursor: "pointer", color: "#7c3aed", fontSize: "13px", fontFamily: "inherit" }}>+ Add Feature</button>
        </div>
      </Card>
    );
    if (activeSection === "capabilities") return (
      <Card>
        <SectionHeader icon="⊕" title="Capabilities" subtitle="What your product can do" />
        <AISuggestButton field="capabilities" onSuggest={handleAISuggest} />
        {activeSuggestions["capabilities"] && <div style={{ margin: "8px 0 16px" }}>{activeSuggestions["capabilities"].map((s, i) => <SuggestionPill key={i} text={s} />)}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px", marginTop: "16px" }}>
          {capabilities.map(c => (<FeatureCard key={c.id} feature={c} onUpdate={u => setCapabilities(p => p.map(x => x.id === c.id ? u : x))} onDelete={() => setCapabilities(p => p.filter(x => x.id !== c.id))} />))}
          <button onClick={() => setCapabilities(p => [...p, { id: Date.now(), title: "", desc: "", status: "Live" }])} style={{ border: "2px dashed #d6caff", borderRadius: "12px", padding: "24px", background: "none", cursor: "pointer", color: "#7c3aed", fontSize: "13px", fontFamily: "inherit" }}>+ Add Capability</button>
        </div>
      </Card>
    );
    if (activeSection === "specs") return (
      <Card>
        <SectionHeader icon="≡" title="Product Specs" subtitle="Technical and functional specifications" />
        <AISuggestButton field="specs" onSuggest={handleAISuggest} />
        {activeSuggestions["specs"] && <div style={{ margin: "8px 0 16px" }}>{activeSuggestions["specs"].map((s, i) => <SuggestionPill key={i} text={s} />)}</div>}
        <div style={{ marginTop: "16px", border: "1.5px solid #ede9ff", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 32px", background: "#f5f3ff", padding: "10px 16px", fontSize: "12px", fontWeight: 700, color: "#7c3aed", borderBottom: "1px solid #ede9ff" }}>
            <span>Specification</span><span>Value</span><span></span>
          </div>
          {specs.map((s, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 32px", padding: "8px 12px", borderBottom: i < specs.length - 1 ? "1px solid #f5f3ff" : "none", gap: "8px", alignItems: "center" }}>
              <input value={s.key} onChange={e => setSpecs(p => p.map((sp, idx) => idx === i ? { ...sp, key: e.target.value } : sp))} placeholder="e.g. Max Users" style={{ border: "1px solid #e8e4f8", borderRadius: "6px", padding: "8px", fontSize: "13px", fontFamily: "inherit", background: "#faf9ff", outline: "none" }} />
              <input value={s.value} onChange={e => setSpecs(p => p.map((sp, idx) => idx === i ? { ...sp, value: e.target.value } : sp))} placeholder="e.g. 10,000 concurrent" style={{ border: "1px solid #e8e4f8", borderRadius: "6px", padding: "8px", fontSize: "13px", fontFamily: "inherit", background: "#faf9ff", outline: "none" }} />
              <button onClick={() => setSpecs(p => p.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: "16px" }}>×</button>
            </div>
          ))}
        </div>
        <button onClick={() => setSpecs(p => [...p, { key: "", value: "" }])} style={{ marginTop: "12px", background: "none", border: "1px dashed #c4b5fd", borderRadius: "8px", padding: "8px 18px", color: "#7c3aed", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>+ Add Row</button>
      </Card>
    );
    if (activeSection === "competitors") return (
      <Card>
        <SectionHeader icon="⊜" title="Competitors" subtitle="Understand your competitive landscape" />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {competitors.map(c => (
            <div key={c.id} style={{ border: "1.5px solid #ede9ff", borderRadius: "12px", padding: "18px", background: "#faf9ff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <input value={c.name} onChange={e => setCompetitors(p => p.map(x => x.id === c.id ? { ...x, name: e.target.value } : x))} placeholder="Competitor name" style={{ fontSize: "15px", fontWeight: 700, border: "none", background: "transparent", color: "#1a1a2e", fontFamily: "inherit", outline: "none", flex: 1 }} />
                <button onClick={() => setCompetitors(p => p.filter(x => x.id !== c.id))} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: "16px" }}>×</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#22c55e", display: "block", marginBottom: "4px" }}>✓ Their Strengths</label>
                  <textarea value={c.strengths} onChange={e => setCompetitors(p => p.map(x => x.id === c.id ? { ...x, strengths: e.target.value } : x))} placeholder="What do they do well?" style={{ width: "100%", minHeight: "70px", padding: "10px", borderRadius: "8px", border: "1px solid #bbf7d0", background: "#f0fdf4", fontFamily: "inherit", fontSize: "13px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#ef4444", display: "block", marginBottom: "4px" }}>✗ Their Weaknesses</label>
                  <textarea value={c.weaknesses} onChange={e => setCompetitors(p => p.map(x => x.id === c.id ? { ...x, weaknesses: e.target.value } : x))} placeholder="Where do they fall short?" style={{ width: "100%", minHeight: "70px", padding: "10px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fef2f2", fontFamily: "inherit", fontSize: "13px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <textarea value={c.info} onChange={e => setCompetitors(p => p.map(x => x.id === c.id ? { ...x, info: e.target.value } : x))} placeholder="Paste additional product info, pricing, positioning..." style={{ width: "100%", minHeight: "60px", padding: "10px", borderRadius: "8px", border: "1px solid #e8e4f8", background: "white", fontFamily: "inherit", fontSize: "13px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <button onClick={() => setCompetitors(p => [...p, { id: Date.now(), name: "", info: "", strengths: "", weaknesses: "" }])} style={{ border: "2px dashed #d6caff", borderRadius: "12px", padding: "18px", background: "none", cursor: "pointer", color: "#7c3aed", fontSize: "13px", fontFamily: "inherit" }}>+ Add Competitor</button>
        </div>
      </Card>
    );
    const custom = customSections.find(s => `custom_${s.id}` === activeSection);
    if (custom) return (
      <Card>
        <SectionHeader icon={custom.icon} title={custom.label} subtitle="Custom section" />
        <textarea value={custom.content} onChange={e => setCustomSections(p => p.map(s => s.id === custom.id ? { ...s, content: e.target.value } : s))} placeholder={`Add content for ${custom.label}...`} style={{ width: "100%", minHeight: "200px", padding: "12px", borderRadius: "10px", border: "1.5px solid #e8e4f8", fontSize: "14px", fontFamily: "inherit", resize: "vertical", outline: "none", background: "#faf9ff", color: "#1a1a2e", boxSizing: "border-box" }} />
      </Card>
    );
  };

  // ── Narrative sections renderer ──
  const renderNarrativeSection = () => {
    if (activeNarrativeSection === "positioning") return (
      <Card>
        <SectionHeader icon="⊙" title="Positioning Statement" subtitle="Geoffrey Moore's framework — the foundation of all messaging" />
        <PositioningBuilder data={positioning} onChange={setPositioning} onSuggest={handleAISuggest} suggestions={activeSuggestions["positioning"]} />
      </Card>
    );
    if (activeNarrativeSection === "pillars") return (
      <Card>
        <SectionHeader icon="▦" title="Messaging Pillars" subtitle="3 core themes that anchor all your messaging" />
        <div style={{ background: "#f5f3ff", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#5b3de8" }}>
          💡 Messaging pillars are the 3 big ideas your product stands for. Every piece of content should tie back to one of them.
        </div>
        <AISuggestButton field="pillars" onSuggest={handleAISuggest} />
        {activeSuggestions["pillars"] && <div style={{ margin: "8px 0 16px" }}>{activeSuggestions["pillars"].map((s, i) => <SuggestionPill key={i} text={s} />)}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px", marginTop: "16px" }}>
          {pillars.map(p => (<NarrativeCard key={p.id} card={p} accentColor="#7c3aed" onUpdate={u => setPillars(prev => prev.map(x => x.id === p.id ? u : x))} onDelete={() => setPillars(p => p.filter(x => x.id !== p.id))} />))}
          <button onClick={() => setPillars(p => [...p, { id: Date.now(), title: "", desc: "" }])} style={{ border: "2px dashed #d6caff", borderRadius: "12px", padding: "24px", background: "none", cursor: "pointer", color: "#7c3aed", fontSize: "13px", fontFamily: "inherit" }}>+ Add Pillar</button>
        </div>
      </Card>
    );
    if (activeNarrativeSection === "architecture") return (
      <Card>
        <SectionHeader icon="⬡" title="Messaging Architecture" subtitle="Layered messaging from headline to proof points" />
        <div style={{ background: "#f5f3ff", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#5b3de8" }}>
          💡 Architecture flows: Headline → Subheadline → Supporting Messages → Proof Points. Each layer adds depth for different audience needs.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
          {architecture.map(a => (<NarrativeCard key={a.id} card={{ ...a, hasTag: true, tagOptions: ["Headline", "Subheadline", "Supporting", "Proof Point", "CTA"] }} accentColor="#4f46e5" onUpdate={u => setArchitecture(p => p.map(x => x.id === a.id ? u : x))} onDelete={() => setArchitecture(p => p.filter(x => x.id !== a.id))} />))}
          <button onClick={() => setArchitecture(p => [...p, { id: Date.now(), title: "", desc: "", hasTag: true, tag: "Headline", tagOptions: ["Headline", "Subheadline", "Supporting", "Proof Point", "CTA"] }])} style={{ border: "2px dashed #c7d2fe", borderRadius: "12px", padding: "24px", background: "none", cursor: "pointer", color: "#4f46e5", fontSize: "13px", fontFamily: "inherit" }}>+ Add Message Layer</button>
        </div>
      </Card>
    );
    if (activeNarrativeSection === "userpersona") return (
      <Card>
        <SectionHeader icon="◉" title="User Persona" subtitle="The person who uses your product day-to-day" />
        <div style={{ background: "#f5f3ff", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#5b3de8" }}>
          💡 The User Persona is who experiences your product. They may not be the buyer — focus on their daily workflow and frustrations.
        </div>
        <PersonaBuilder data={userPersona} onChange={setUserPersona} type="user" />
      </Card>
    );
    if (activeNarrativeSection === "buyerpersona") return (
      <Card>
        <SectionHeader icon="◈" title="Buyer Persona" subtitle="The person who makes or influences the purchase decision" />
        <div style={{ background: "#fff7ed", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#c2410c", border: "1px solid #fed7aa" }}>
          💡 The Buyer Persona controls budget or influences the deal. They often don't use the product — focus on business priorities and ROI.
        </div>
        <PersonaBuilder data={buyerPersona} onChange={setBuyerPersona} type="buyer" />
      </Card>
    );
    if (activeNarrativeSection === "valueprop") return (
      <Card>
        <SectionHeader icon="◆" title="Value Proposition" subtitle="The core promise your product makes to customers" />
        <AISuggestButton field="valueprop" onSuggest={handleAISuggest} />
        {activeSuggestions["valueprop"] && <div style={{ margin: "8px 0 16px" }}>{activeSuggestions["valueprop"].map((s, i) => <SuggestionPill key={i} text={s} />)}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px", marginTop: "16px" }}>
          {valueProps.map(v => (<NarrativeCard key={v.id} card={{ ...v, hasTag: true, tagOptions: ["Functional", "Emotional", "Social", "Economic"] }} accentColor="#059669" onUpdate={u => setValueProps(p => p.map(x => x.id === v.id ? u : x))} onDelete={() => setValueProps(p => p.filter(x => x.id !== v.id))} />))}
          <button onClick={() => setValueProps(p => [...p, { id: Date.now(), title: "", desc: "", hasTag: true, tag: "Functional", tagOptions: ["Functional", "Emotional", "Social", "Economic"] }])} style={{ border: "2px dashed #a7f3d0", borderRadius: "12px", padding: "24px", background: "none", cursor: "pointer", color: "#059669", fontSize: "13px", fontFamily: "inherit" }}>+ Add Value Prop</button>
        </div>
      </Card>
    );
    if (activeNarrativeSection === "paingain") return (
      <Card>
        <SectionHeader icon="⚖" title="Pain vs Gain" subtitle="Map customer pains to the gains your product delivers" />
        <AISuggestButton field="paingain" onSuggest={handleAISuggest} />
        {activeSuggestions["paingain"] && <div style={{ margin: "8px 0 16px" }}>{activeSuggestions["paingain"].map((s, i) => <SuggestionPill key={i} text={s} />)}</div>}
        <div style={{ marginTop: "16px" }}><PainGainBuilder items={painGain} onChange={setPainGain} /></div>
      </Card>
    );
    if (activeNarrativeSection === "benefits") return (
      <Card>
        <SectionHeader icon="✦" title="Benefits" subtitle="The outcomes customers experience from using your product" />
        <AISuggestButton field="benefits" onSuggest={handleAISuggest} />
        {activeSuggestions["benefits"] && <div style={{ margin: "8px 0 16px" }}>{activeSuggestions["benefits"].map((s, i) => <SuggestionPill key={i} text={s} />)}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px", marginTop: "16px" }}>
          {benefits.map(b => (<NarrativeCard key={b.id} card={{ ...b, hasTag: true, tagOptions: ["Functional", "Emotional", "Business Outcome"] }} accentColor="#0ea5e9" onUpdate={u => setBenefits(p => p.map(x => x.id === b.id ? u : x))} onDelete={() => setBenefits(p => p.filter(x => x.id !== b.id))} />))}
          <button onClick={() => setBenefits(p => [...p, { id: Date.now(), title: "", desc: "", hasTag: true, tag: "Functional", tagOptions: ["Functional", "Emotional", "Business Outcome"] }])} style={{ border: "2px dashed #bae6fd", borderRadius: "12px", padding: "24px", background: "none", cursor: "pointer", color: "#0ea5e9", fontSize: "13px", fontFamily: "inherit" }}>+ Add Benefit</button>
        </div>
      </Card>
    );
    if (activeNarrativeSection === "differentiators") return (
      <Card>
        <SectionHeader icon="⊛" title="Differentiators" subtitle="What makes your product provably, sustainably different" />
        <div style={{ background: "#fdf4ff", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#7e22ce", border: "1px solid #e9d5ff" }}>
          💡 A true differentiator is <strong>provable</strong> (you can show evidence), <strong>relevant</strong> (customers care), and <strong>sustainable</strong> (hard to copy).
        </div>
        <AISuggestButton field="differentiators" onSuggest={handleAISuggest} />
        {activeSuggestions["differentiators"] && <div style={{ margin: "8px 0 16px" }}>{activeSuggestions["differentiators"].map((s, i) => <SuggestionPill key={i} text={s} />)}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px", marginTop: "16px" }}>
          {differentiators.map(d => (<NarrativeCard key={d.id} card={{ ...d, hasTag: true, tagOptions: ["Product", "Experience", "Business Model", "Technology", "Data"] }} accentColor="#7c3aed" onUpdate={u => setDifferentiators(p => p.map(x => x.id === d.id ? u : x))} onDelete={() => setDifferentiators(p => p.filter(x => x.id !== d.id))} />))}
          <button onClick={() => setDifferentiators(p => [...p, { id: Date.now(), title: "", desc: "", hasTag: true, tag: "Product", tagOptions: ["Product", "Experience", "Business Model", "Technology", "Data"] }])} style={{ border: "2px dashed #d6caff", borderRadius: "12px", padding: "24px", background: "none", cursor: "pointer", color: "#7c3aed", fontSize: "13px", fontFamily: "inherit" }}>+ Add Differentiator</button>
        </div>
      </Card>
    );
    const cn = customNarrativeSections.find(s => `cn_${s.id}` === activeNarrativeSection);
    if (cn) return (
      <Card>
        <SectionHeader icon={cn.icon} title={cn.label} subtitle="Custom narrative section" />
        <textarea value={cn.content} onChange={e => setCustomNarrativeSections(p => p.map(s => s.id === cn.id ? { ...s, content: e.target.value } : s))} placeholder={`Add content for ${cn.label}...`} style={{ width: "100%", minHeight: "200px", padding: "12px", borderRadius: "10px", border: "1.5px solid #e8e4f8", fontSize: "14px", fontFamily: "inherit", resize: "vertical", outline: "none", background: "#faf9ff", color: "#1a1a2e", boxSizing: "border-box" }} />
      </Card>
    );
  };

  // ── Sidebar ──
  const currentSections = activeTab === "product" ? allProductSections : allNarrativeSections;
  const currentActive = activeTab === "product" ? activeSection : activeNarrativeSection;
  const setCurrentActive = activeTab === "product" ? setActiveSection : setActiveNarrativeSection;
  const sidebarLabel = activeTab === "product" ? "Product Truth" : "Core Narrative";  return (
    <div style={{ minHeight: "100vh", background: "#f7f5ff", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #ede9ff", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "30px", height: "30px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "15px" }}>◈</div>
            <span style={{ fontWeight: 800, fontSize: "16px", color: "#1a1a2e", letterSpacing: "-0.5px" }}>Product Truth</span>
          </div>
          {/* Tab switcher */}
          <div style={{ display: "flex", background: "#f5f3ff", borderRadius: "10px", padding: "3px", gap: "2px" }}>
            {[{ id: "product", label: "Product Truth" }, { id: "narrative", label: "Core Narrative" }, { id: "feedback", label: "Feedback" }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ padding: "5px 16px", borderRadius: "8px", border: "none", background: activeTab === tab.id ? "white" : "transparent", color: activeTab === tab.id ? "#7c3aed" : "#888", fontSize: "13px", fontWeight: activeTab === tab.id ? 700 : 400, cursor: "pointer", fontFamily: "inherit", boxShadow: activeTab === tab.id ? "0 1px 4px rgba(124,58,237,0.12)" : "none", transition: "all 0.15s" }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {saved && <span style={{ fontSize: "13px", color: "#22c55e" }}>✓ All changes saved</span>}
          <button onClick={handleSave} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white", border: "none", borderRadius: "8px", padding: "7px 18px", fontSize: "13px", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>◈ Save</button>
          <button onClick={() => setChatOpen(o => !o)} style={{ background: chatOpen ? "#ede9ff" : "none", border: "1.5px solid #d6caff", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", cursor: "pointer", color: "#7c3aed", fontFamily: "inherit" }}>✦ AI Assistant</button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>
        {/* Sidebar — hidden on feedback tab */}
        {activeTab !== "feedback" && (
          <div style={{ width: "215px", background: "white", borderRight: "1px solid #ede9ff", padding: "14px 10px", overflowY: "auto", flexShrink: 0 }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "1px", padding: "0 8px 10px" }}>{sidebarLabel}</div>
            {currentSections.map(s => (
              <button key={s.id} onClick={() => setCurrentActive(s.id)}
                style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: "8px", border: "none", background: currentActive === s.id ? "#ede9ff" : "none", color: currentActive === s.id ? "#7c3aed" : "#444", fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit", fontWeight: currentActive === s.id ? 600 : 400, display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                <span style={{ fontSize: "13px", opacity: 0.7, flexShrink: 0 }}>{s.icon}</span>
                <span style={{ lineHeight: 1.3 }}>{s.label}</span>
              </button>
            ))}
            <button onClick={activeTab === "product" ? addCustomSection : () => addCustomNarrativeSection(null)}
              style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: "8px", border: "1px dashed #d6caff", background: "none", color: "#7c3aed", fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit", marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>+</span> Add Section
            </button>
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: activeTab === "feedback" ? "0" : "24px 28px" }}>
          <div style={{ maxWidth: activeTab === "feedback" ? "100%" : "800px" }}>
            {activeTab === "product" ? renderProductSection() : activeTab === "narrative" ? (
              <>
                {renderNarrativeSection()}
                <PMMSuggestions existingLabels={existingNarrativeLabels} onAdd={addCustomNarrativeSection} />
              </>
            ) : (
              <FeedbackTab
                positioning={positioning}
                pillars={pillars}
                differentiators={differentiators}
                features={features}
                benefits={benefits}
                valueProps={valueProps}
                feedbackData={feedbackData}
                setFeedbackData={setFeedbackData}
              />
            )}
          </div>
        </div>

        {/* AI Chat */}
        {chatOpen && (
          <div style={{ width: "310px", background: "white", borderLeft: "1px solid #ede9ff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #ede9ff", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px" }}>✦</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a2e" }}>PMM AI Assistant</div>
                <div style={{ fontSize: "11px", color: "#aaa" }}>Suggestions, frameworks & competitor insights</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "88%", padding: "9px 13px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "#f5f3ff", color: m.role === "user" ? "white" : "#1a1a2e", fontSize: "13px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", gap: "4px", padding: "6px 12px" }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#c4b5fd", animation: "bounce 1s infinite", animationDelay: `${i * 0.2}s` }} />)}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: "12px", borderTop: "1px solid #ede9ff", display: "flex", gap: "8px" }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="Ask for PMM guidance..." style={{ flex: 1, padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #e8e4f8", fontSize: "13px", fontFamily: "inherit", outline: "none", background: "#faf9ff" }} />
              <button onClick={sendChat} disabled={chatLoading} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white", border: "none", borderRadius: "10px", padding: "9px 14px", cursor: "pointer", fontSize: "14px" }}>→</button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} } * { box-sizing: border-box; }`}</style>
    </div>
  );
}
