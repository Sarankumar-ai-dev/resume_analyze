import { useState } from "react";

const BASE = "https://resume-analyze-ovkr.onrender.com/api";

const FIELDS = [
  { key: "name",        label: "Full Name",   placeholder: "Sarankumar S",               icon: "👤" },
  { key: "email",       label: "Email",       placeholder: "saran@gmail.com",            icon: "✉️" },
  { key: "phone",       label: "Phone",       placeholder: "9876543210",                 icon: "📞" },
  { key: "linkedin",    label: "LinkedIn",    placeholder: "linkedin.com/in/sarankumar", icon: "🔗" },
  { key: "github",      label: "GitHub",      placeholder: "github.com/sarankumar",      icon: "💻" },
  { key: "location",    label: "Location",    placeholder: "Chennai, India",             icon: "📍" },
  { key: "target_role", label: "Target Role", placeholder: "Full Stack Python Developer", icon: "🎯" },
];

const TEXTAREAS = [
  { key: "description",    label: "About You",      placeholder: "I am a passionate developer...",                          icon: "🙋" },
  { key: "skills",         label: "Skills",          placeholder: "Python, Django, React, PostgreSQL...",                   icon: "⚡" },
  { key: "experience",     label: "Work Experience", placeholder: "Intern at TechCorp. Built REST APIs using Django...",    icon: "💼" },
  { key: "education",      label: "Education",       placeholder: "B.E Computer Science, Anna University, 2024, CGPA 8.2", icon: "🎓" },
  { key: "projects",       label: "Projects",        placeholder: "1. HireWise - AI resume analyzer using Django\n2. ...", icon: "🚀" },
  { key: "achievements",   label: "Achievements",    placeholder: "Won college hackathon. Published blog...",               icon: "🏆" },
  { key: "certifications", label: "Certifications",  placeholder: "Python for Data Science - Coursera...",                 icon: "📜" },
];

/* ── Floating Input ─────────────────────────────────────────────────────── */
function FloatInput({ label, placeholder, icon, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const active = focused || !!value;
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        position: "relative",
        border: `1.5px solid ${focused ? "#2563eb" : active ? "#93c5fd" : "#e2e8f0"}`,
        borderRadius: 10,
        background: focused ? "#fff" : "#fafafa",
        transition: "border-color 0.2s,box-shadow 0.2s,background 0.2s",
        boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
      }}>
        <label style={{
          position: "absolute", left: 36,
          top: active ? 6 : "50%",
          transform: active ? "none" : "translateY(-50%)",
          fontSize: active ? 10 : 13,
          fontWeight: active ? 600 : 400,
          color: focused ? "#2563eb" : active ? "#64748b" : "#94a3b8",
          pointerEvents: "none",
          transition: "all 0.18s ease",
          lineHeight: 1, zIndex: 1,
        }}>{label}</label>
        <span style={{
          position: "absolute", left: 10, top: "50%",
          transform: "translateY(-50%)", fontSize: 14,
          opacity: focused ? 1 : 0.5,
          transition: "opacity 0.2s", pointerEvents: "none",
        }}>{icon}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={active ? placeholder : ""}
          style={{
            width: "100%", border: "none", outline: "none",
            background: "transparent",
            padding: active ? "22px 12px 7px 36px" : "14px 12px 14px 36px",
            fontSize: 13, color: "#0f172a",
            fontFamily: "Inter, sans-serif",
            transition: "padding 0.18s ease",
            boxSizing: "border-box",
          }}
        />
        {value && !focused && (
          <span style={{
            position: "absolute", right: 10, top: "50%",
            transform: "translateY(-50%)", fontSize: 12, color: "#2da44e",
          }}>✓</span>
        )}
      </div>
    </div>
  );
}

/* ── Floating Textarea ──────────────────────────────────────────────────── */
function FloatTextarea({ label, placeholder, icon, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const active = focused || !!value;
  return (
    <div style={{
      position: "relative",
      border: `1.5px solid ${focused ? "#2563eb" : active ? "#93c5fd" : "#e2e8f0"}`,
      borderRadius: 10,
      background: focused ? "#fff" : "#fafafa",
      transition: "border-color 0.2s,box-shadow 0.2s,background 0.2s",
      boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
    }}>
      <label style={{
        position: "absolute", left: 36, top: active ? 8 : 14,
        fontSize: active ? 10 : 13,
        fontWeight: active ? 600 : 400,
        color: focused ? "#2563eb" : active ? "#64748b" : "#94a3b8",
        pointerEvents: "none",
        transition: "all 0.18s ease",
        lineHeight: 1, zIndex: 1,
      }}>{label}</label>
      <span style={{
        position: "absolute", left: 10, top: 14, fontSize: 14,
        opacity: focused ? 1 : 0.5,
        transition: "opacity 0.2s", pointerEvents: "none",
      }}>{icon}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={active ? placeholder : ""}
        rows={3}
        style={{
          width: "100%", border: "none", outline: "none",
          background: "transparent",
          padding: active ? "26px 12px 10px 36px" : "14px 12px 14px 36px",
          fontSize: 13, color: "#0f172a",
          fontFamily: "Inter, sans-serif",
          resize: "vertical",
          transition: "padding 0.18s ease",
          boxSizing: "border-box", display: "block",
        }}
      />
    </div>
  );
}

/* ── PDF Generator ──────────────────────────────────────────────────────── */
function generatePDF(resume) {
  const hasExp   = resume.experience?.length > 0;
  const hasProj  = resume.projects?.length > 0;
  const hasAch   = resume.achievements?.length > 0;
  const hasCerts = resume.certifications?.length > 0;

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1a1a1a;padding:40px;font-size:13px;line-height:1.6;max-width:800px">
      <h1 style="font-size:26px;font-weight:700;color:#1e3a5f;margin:0 0 4px">${resume.name}</h1>
      <div style="font-size:12px;color:#555;margin-bottom:20px;display:flex;flex-wrap:wrap;gap:12px">
        ${resume.contact?.email    ? `<span>✉ ${resume.contact.email}</span>`    : ""}
        ${resume.contact?.phone    ? `<span>📞 ${resume.contact.phone}</span>`   : ""}
        ${resume.contact?.location ? `<span>📍 ${resume.contact.location}</span>`: ""}
        ${resume.contact?.linkedin ? `<span>🔗 ${resume.contact.linkedin}</span>`: ""}
        ${resume.contact?.github   ? `<span>💻 ${resume.contact.github}</span>`  : ""}
      </div>

      ${resume.summary ? `
        <div style="font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:1px;border-bottom:1.5px solid #2563eb;padding-bottom:3px;margin:0 0 10px">Professional Summary</div>
        <p style="margin:0 0 16px">${resume.summary}</p>` : ""}

      ${(resume.skills?.technical?.length || resume.skills?.soft?.length) ? `
        <div style="font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:1px;border-bottom:1.5px solid #2563eb;padding-bottom:3px;margin:0 0 10px">Skills</div>
        <div style="margin-bottom:8px">
          ${resume.skills?.technical?.length ? `
            <div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:4px">Technical</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">
              ${resume.skills.technical.map(s => `<span style="background:#eff6ff;color:#1d4ed8;padding:3px 10px;border-radius:20px;font-size:12px">${s}</span>`).join("")}
            </div>` : ""}
          ${resume.skills?.soft?.length ? `
            <div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:4px">Soft Skills</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              ${resume.skills.soft.map(s => `<span style="background:#f0fdf4;color:#15803d;padding:3px 10px;border-radius:20px;font-size:12px">${s}</span>`).join("")}
            </div>` : ""}
        </div>` : ""}

      ${hasExp ? `
        <div style="font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:1px;border-bottom:1.5px solid #2563eb;padding-bottom:3px;margin:16px 0 10px">Experience</div>
        ${resume.experience.map(e => `
          <div style="margin-bottom:12px">
            <div style="font-weight:700;font-size:13px;color:#0f172a">${e.title} — ${e.company}</div>
            <div style="font-size:12px;color:#64748b;margin-bottom:4px">${e.duration}</div>
            <ul style="padding-left:18px;margin:0">${(e.points||[]).map(p => `<li style="font-size:12px;color:#374151;margin-bottom:3px">${p}</li>`).join("")}</ul>
          </div>`).join("")}` : ""}

      ${resume.education?.length ? `
        <div style="font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:1px;border-bottom:1.5px solid #2563eb;padding-bottom:3px;margin:16px 0 10px">Education</div>
        ${resume.education.map(e => `
          <div style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between">
              <span style="font-weight:700;font-size:13px;color:#0f172a">${e.degree}</span>
              <span style="font-size:12px;color:#64748b">${e.year||""}</span>
            </div>
            <div style="font-size:12px;color:#64748b">${e.institution||""}${e.cgpa ? ` · ${e.cgpa}` : ""}</div>
          </div>`).join("")}` : ""}

      ${hasProj ? `
        <div style="font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:1px;border-bottom:1.5px solid #2563eb;padding-bottom:3px;margin:16px 0 10px">Projects</div>
        ${resume.projects.map(p => `
          <div style="margin-bottom:12px">
            <div style="font-weight:700;font-size:13px;color:#0f172a">${p.name}</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 6px">
              ${(p.tech||[]).map(t => `<span style="background:#f0fdf4;color:#15803d;padding:2px 8px;border-radius:4px;font-size:11px">${t}</span>`).join("")}
            </div>
            <p style="font-size:12px;color:#374151;margin:0 0 4px">${p.description||""}</p>
            <ul style="padding-left:18px;margin:0">${(p.points||[]).map(pt => `<li style="font-size:12px;color:#374151;margin-bottom:3px">${pt}</li>`).join("")}</ul>
          </div>`).join("")}` : ""}

      ${hasAch ? `
        <div style="font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:1px;border-bottom:1.5px solid #2563eb;padding-bottom:3px;margin:16px 0 10px">Achievements</div>
        <ul style="padding-left:18px;margin:0">${resume.achievements.map(a => `<li style="font-size:12px;color:#374151;margin-bottom:4px">${a}</li>`).join("")}</ul>` : ""}

      ${hasCerts ? `
        <div style="font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:1px;border-bottom:1.5px solid #2563eb;padding-bottom:3px;margin:16px 0 10px">Certifications</div>
        <ul style="padding-left:18px;margin:0">${resume.certifications.map(c => `<li style="font-size:12px;color:#374151;margin-bottom:4px">${c}</li>`).join("")}</ul>` : ""}
    </div>`;

  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
  script.onload = () => {
    window.html2pdf()
      .set({
        margin: 0,
        filename: `${(resume.name || "Resume").replace(/\s+/g, "_")}_Resume.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(container).save()
      .then(() => document.body.removeChild(container));
  };
  document.head.appendChild(script);
}

/* ── Section heading ────────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: "#2563eb",
        textTransform: "uppercase", letterSpacing: "0.08em",
        borderBottom: "1.5px solid #2563eb", paddingBottom: 4, marginBottom: 12,
      }}>{title}</div>
      {children}
    </div>
  );
}

function Tag({ text, color, textColor, small }) {
  return (
    <span style={{
      background: color, color: textColor,
      padding: small ? "2px 8px" : "3px 10px",
      borderRadius: 20, fontSize: small ? 11 : 12, fontWeight: 500,
    }}>{text}</span>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */
export default function BuildResumePage() {
  const [form, setForm]     = useState({});
  const [phase, setPhase]   = useState("idle");
  const [resume, setResume] = useState(null);
  const [scanPct, setScanPct] = useState(0);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async () => {
    if (!form.name || !form.email) { alert("Name and Email required!"); return; }
    setPhase("scanning");
    setScanPct(0);
    let pct = 0;
    const interval = setInterval(() => {
      pct = Math.min(pct + 2, 95);
      setScanPct(pct);
      if (pct >= 95) clearInterval(interval);
    }, 50);

    try {
      const res  = await fetch(`${BASE}/build-resume/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      clearInterval(interval);
      setScanPct(100);
      await new Promise((r) => setTimeout(r, 400));
      setResume(data);
      setPhase("done");
    } catch {
      clearInterval(interval);
      alert("Server error. Try again.");
      setPhase("idle");
    }
  };

  const filledCount = [...FIELDS, ...TEXTAREAS].filter((f) => !!form[f.key]).length;
  const totalFields = FIELDS.length + TEXTAREAS.length;
  const progress    = Math.round((filledCount / totalFields) * 100);

  /* helpers to check if section has real data */
  const hasExp   = resume?.experience?.length   > 0;
  const hasProj  = resume?.projects?.length     > 0;
  const hasAch   = resume?.achievements?.length > 0;
  const hasCerts = resume?.certifications?.length > 0;
  const hasEdu   = resume?.education?.length    > 0;
  const hasTech  = resume?.skills?.technical?.length > 0;
  const hasSoft  = resume?.skills?.soft?.length  > 0;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 700px) {
          .resume-layout { flex-direction: column !important; height: auto !important; }
          .left-panel    { width: 100% !important; height: auto !important; border-right: none !important; border-bottom: 1px solid #f1f5f9 !important; }
          .right-panel   { height: auto !important; min-height: 300px; }
          .fields-grid   { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 960px) and (min-width: 701px) {
          .left-panel  { width: 48% !important; }
          .fields-grid { grid-template-columns: 1fr !important; }
        }
        input::placeholder, textarea::placeholder { color: #c0c8d4; }
        * { box-sizing: border-box; }
      `}</style>

      <div className="resume-layout" style={{
        height: "100vh", display: "flex", overflow: "hidden",
        fontFamily: "Inter, sans-serif", background: "#fff",
      }}>

        {/* ══ LEFT — Form ══ */}
        <div className="left-panel" style={{
          width: "44%", borderRight: "1px solid #f1f5f9",
          padding: "32px 24px", overflowY: "auto", flexShrink: 0,
          height: "100vh",
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>Resume Builder</h2>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.5 }}>
            Fill in your details — only what you provide will appear in the resume
          </p>

          {/* Progress */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 5 }}>
              <span>{filledCount} of {totalFields} fields filled</span>
              <span style={{ fontWeight: 600, color: progress === 100 ? "#2da44e" : "#2563eb" }}>{progress}%</span>
            </div>
            <div style={{ height: 4, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${progress}%`,
                background: progress === 100 ? "#2da44e" : "#2563eb",
                borderRadius: 4, transition: "width 0.3s ease",
              }} />
            </div>
          </div>

          {/* Text fields grid */}
          <div className="fields-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {FIELDS.map((f) => (
              <div key={f.key} style={{ gridColumn: f.key === "target_role" ? "1 / -1" : "auto" }}>
                <FloatInput
                  label={f.label} placeholder={f.placeholder} icon={f.icon}
                  value={form[f.key] || ""}
                  onChange={(v) => set(f.key, v)}
                />
              </div>
            ))}
          </div>

          {/* Textareas */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {TEXTAREAS.map((f) => (
              <FloatTextarea
                key={f.key}
                label={f.label} placeholder={f.placeholder} icon={f.icon}
                value={form[f.key] || ""}
                onChange={(v) => set(f.key, v)}
              />
            ))}
          </div>

          <button
            onClick={handleCreate}
            disabled={phase === "scanning"}
            style={{
              width: "100%", padding: "13px",
              background: phase === "scanning" ? "#93c5fd" : "#2563eb",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 600,
              cursor: phase === "scanning" ? "not-allowed" : "pointer",
              transition: "background 0.2s, transform 0.1s",
            }}
            onMouseDown={(e) => { if (phase !== "scanning") e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={(e)   => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {phase === "scanning" ? `Creating Resume... ${scanPct}%` : "✨ Create Resume"}
          </button>
        </div>

        {/* ══ RIGHT — Preview ══ */}
        <div className="right-panel" style={{
          flex: 1, padding: "32px 24px",
          overflowY: "auto", minWidth: 0,
          height: "100vh",
        }}>

          {/* Idle */}
          {phase === "idle" && (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              height: "100%", minHeight: 300, gap: 12,
            }}>
              <span style={{ fontSize: 52, opacity: 0.2 }}>📄</span>
              <p style={{ fontSize: 14, color: "#cbd5e1" }}>Your resume will appear here</p>
              <p style={{ fontSize: 12, color: "#e2e8f0", textAlign: "center", maxWidth: 260 }}>
                Only the fields you fill in will be included — no fake data added
              </p>
            </div>
          )}

          {/* Scanning animation */}
          {phase === "scanning" && (
            <div style={{ width: "100%", maxWidth: 460, margin: "0 auto" }}>
              <div style={{
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
                padding: "28px 24px", boxShadow: "0 4px 24px rgba(37,99,235,0.07)",
                position: "relative", overflow: "hidden",
              }}>
                {[70,40,90,30,60,80,50,70,45,85,55,65,40,75,50].map((w, i) => (
                  <div key={i} style={{
                    height: i === 0 ? 16 : i % 5 === 0 ? 10 : 7,
                    width: `${w}%`,
                    background: i === 0 ? "#1e3a5f" : i % 5 === 0 ? "#bfdbfe" : "#e8edf2",
                    borderRadius: 3, marginBottom: i === 0 ? 18 : 9,
                    marginLeft: i % 4 === 3 ? "8%" : 0,
                  }} />
                ))}
                <div style={{
                  position: "absolute", left: 0, right: 0, height: 2,
                  background: "linear-gradient(90deg,transparent,#2563eb,#93c5fd,#2563eb,transparent)",
                  top: `${scanPct}%`, transition: "top 0.05s linear",
                  boxShadow: "0 0 12px 3px rgba(37,99,235,0.35)",
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(to bottom,rgba(37,99,235,0.04) ${scanPct}%,transparent ${scanPct}%)`,
                }} />
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 5 }}>
                  <span>Generating your resume...</span><span>{scanPct}%</span>
                </div>
                <div style={{ height: 3, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${scanPct}%`, background: "#2563eb", borderRadius: 3, transition: "width 0.05s linear" }} />
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {phase === "done" && resume && (
            <div style={{ animation: "fadeUp 0.45s ease" }}>

              {/* Download button */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
                <button
                  onClick={() => generatePDF(resume)}
                  style={{
                    padding: "9px 22px", background: "#2563eb", color: "#fff",
                    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#1d4ed8"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#2563eb"}
                >
                  ⬇ Download PDF
                </button>
              </div>

              {/* Resume card */}
              <div style={{
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
                padding: "28px 24px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
              }}>
                {/* Name */}
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e3a5f", marginBottom: 4 }}>{resume.name}</h1>

                {/* Contact */}
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 12, lineHeight: 1.8 }}>
                  {resume.contact?.email    && <span>✉ {resume.contact.email}</span>}
                  {resume.contact?.phone    && <span>📞 {resume.contact.phone}</span>}
                  {resume.contact?.location && <span>📍 {resume.contact.location}</span>}
                  {resume.contact?.linkedin && <span>🔗 {resume.contact.linkedin}</span>}
                  {resume.contact?.github   && <span>💻 {resume.contact.github}</span>}
                </div>

                {/* Summary */}
                {resume.summary && (
                  <Section title="Summary">
                    <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>{resume.summary}</p>
                  </Section>
                )}

                {/* Skills — only show if data exists */}
                {(hasTech || hasSoft) && (
                  <Section title="Skills">
                    {hasTech && (
                      <div style={{ marginBottom: hasSoft ? 10 : 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Technical</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {resume.skills.technical.map((s) => <Tag key={s} text={s} color="#eff6ff" textColor="#1d4ed8" />)}
                        </div>
                      </div>
                    )}
                    {hasSoft && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Soft Skills</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {resume.skills.soft.map((s) => <Tag key={s} text={s} color="#f0fdf4" textColor="#15803d" />)}
                        </div>
                      </div>
                    )}
                  </Section>
                )}

                {/* Experience */}
                {hasExp && (
                  <Section title="Experience">
                    {resume.experience.map((e, i) => (
                      <div key={i} style={{ marginBottom: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{e.title} — {e.company}</div>
                        {e.duration && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{e.duration}</div>}
                        {e.points?.length > 0 && (
                          <ul style={{ paddingLeft: 18, margin: 0 }}>
                            {e.points.map((p, j) => <li key={j} style={{ fontSize: 13, color: "#374151", marginBottom: 3 }}>{p}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </Section>
                )}

                {/* Education */}
                {hasEdu && (
                  <Section title="Education">
                    {resume.education.map((e, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{e.degree}</span>
                          {e.year && <span style={{ fontSize: 12, color: "#64748b" }}>{e.year}</span>}
                        </div>
                        {e.institution && (
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {e.institution}{e.cgpa ? ` · ${e.cgpa}` : ""}
                          </div>
                        )}
                      </div>
                    ))}
                  </Section>
                )}

                {/* Projects */}
                {hasProj && (
                  <Section title="Projects">
                    {resume.projects.map((p, i) => (
                      <div key={i} style={{ marginBottom: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{p.name}</div>
                        {p.tech?.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "4px 0 6px" }}>
                            {p.tech.map((t) => <Tag key={t} text={t} color="#f0fdf4" textColor="#15803d" small />)}
                          </div>
                        )}
                        {p.description && <p style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>{p.description}</p>}
                        {p.points?.length > 0 && (
                          <ul style={{ paddingLeft: 18, margin: 0 }}>
                            {p.points.map((pt, j) => <li key={j} style={{ fontSize: 13, color: "#374151", marginBottom: 3 }}>{pt}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </Section>
                )}

                {/* Achievements */}
                {hasAch && (
                  <Section title="Achievements">
                    <ul style={{ paddingLeft: 18, margin: 0 }}>
                      {resume.achievements.map((a, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>{a}</li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* Certifications */}
                {hasCerts && (
                  <Section title="Certifications">
                    <ul style={{ paddingLeft: 18, margin: 0 }}>
                      {resume.certifications.map((c, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>{c}</li>
                      ))}
                    </ul>
                  </Section>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}