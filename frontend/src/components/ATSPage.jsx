import { useState, useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const BASE = "https://resume-analyze-ovkr.onrender.com/api";

const CATEGORIES = [
  "Contact Information",
  "Work Experience",
  "Education",
  "Skills",
  "Keywords",
  "Formatting",
  "Projects",
];

const LEVEL_STYLES = {
  Excellent:           { bg: "#e6f4ea", text: "#1a7f37", bar: "#2da44e" },
  Good:                { bg: "#dbeafe", text: "#1d4ed8", bar: "#2563eb" },
  Average:             { bg: "#fef9c3", text: "#92400e", bar: "#d97706" },
  "Needs Improvement": { bg: "#fee2e2", text: "#b91c1c", bar: "#ef4444" },
};

function scoreColor(s) {
  if (s >= 75) return "#2da44e";
  if (s >= 50) return "#2563eb";
  if (s >= 30) return "#d97706";
  return "#ef4444";
}

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

/* ── Score Ring ─────────────────────────────────────────────────────────── */
function ScoreRing({ score, color }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDash((score / 100) * circ), 80);
    return () => clearTimeout(t);
  }, [score, circ]);

  return (
    <div style={{ position: "relative", width: 108, height: 108, flexShrink: 0 }}>
      <svg width="108" height="108" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="54" cy="54" r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
        <circle
          cx="54" cy="54" r={r} fill="none"
          stroke={color} strokeWidth="9"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.1s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

/* ── Category Bar Chart ─────────────────────────────────────────────────── */
function CategoryChart({ categories }) {
  const scores = CATEGORIES.map((c) => categories?.[c] ?? 0);
  const colors = scores.map(scoreColor);
  const data = {
    labels: CATEGORIES,
    datasets: [{
      data: scores,
      backgroundColor: colors,
      borderRadius: 5,
      borderSkipped: false,
      barThickness: 14,
    }],
  };
  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: "easeOutQuart" },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} / 100` } },
    },
    scales: {
      x: {
        min: 0, max: 100,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { color: "#94a3b8", font: { size: 11 }, callback: (v) => v + "%", stepSize: 25 },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 12 }, padding: 6 },
      },
    },
  };
  return (
    <div style={{ position: "relative", width: "100%", height: CATEGORIES.length * 42 + 40 }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/* ── Score Cards ────────────────────────────────────────────────────────── */
function ScoreCards({ categories }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
      gap: 10,
    }}>
      {CATEGORIES.map((cat) => {
        const s = categories?.[cat] ?? 0;
        const c = scoreColor(s);
        return (
          <div key={cat} style={{
            background: "#f8fafc", borderRadius: 10,
            padding: "12px 14px", border: "1px solid #f1f5f9",
          }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 5, lineHeight: 1.4 }}>{cat}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c }}>
              {s}<span style={{ fontSize: 12, fontWeight: 400, color: "#cbd5e1" }}> /100</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Resume Preview ─────────────────────────────────────────────────────── */
function ResumePreview({ phase, scanPct }) {
  const lines = [80, 60, 90, 50, 70, 55, 85, 45, 65, 75, 50, 60];
  return (
    <div style={{ width: "100%", maxWidth: 260 }}>
      <div style={{
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
        padding: "20px 18px", position: "relative", overflow: "hidden",
        boxShadow: "0 2px 16px rgba(37,99,235,0.07)",
      }}>
        {lines.map((w, i) => (
          <div key={i} style={{
            height: i === 0 ? 12 : 7, width: `${w}%`,
            background: i === 0 ? "#1e3a5f" : i % 4 === 1 ? "#bfdbfe" : "#e2e8f0",
            borderRadius: 3, marginBottom: i === 0 ? 14 : 7,
            marginLeft: i % 3 === 2 ? "10%" : 0,
          }} />
        ))}
        {phase === "scanning" && (
          <>
            <div style={{
              position: "absolute", left: 0, right: 0, height: 2,
              background: "linear-gradient(90deg,transparent,#2563eb,#93c5fd,#2563eb,transparent)",
              top: `${scanPct}%`, transition: "top 0.04s linear",
              boxShadow: "0 0 10px 3px rgba(37,99,235,0.35)",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(to bottom,rgba(37,99,235,0.05) ${scanPct}%,transparent ${scanPct}%)`,
            }} />
          </>
        )}
        {phase === "done" && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(37,99,235,0.03)",
            display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12,
          }}>
            <span style={{ fontSize: 34 }}>✅</span>
          </div>
        )}
      </div>
      {phase === "scanning" && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 5 }}>
            <span>Analyzing resume...</span><span>{scanPct}%</span>
          </div>
          <div style={{ height: 3, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${scanPct}%`, background: "#2563eb", borderRadius: 3, transition: "width 0.04s linear" }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */
export default function ATSPage() {
  const [phase, setPhase]       = useState("idle");
  const [fileName, setFileName] = useState("");
  const [atsData, setAtsData]   = useState(null);
  const [scanPct, setScanPct]   = useState(0);
  const [errMsg, setErrMsg]     = useState("");
  const fileRef   = useRef();
  const resultRef = useRef();   // scroll target on mobile
  const isMobile  = useIsMobile();

  const canUpload = phase === "idle" || phase === "done" || phase === "error";

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setAtsData(null);
    setErrMsg("");
    setPhase("uploading");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res  = await fetch(`${BASE}/upload/`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.error || "Upload failed."); setPhase("error"); return; }

      setPhase("scanning");
      setScanPct(0);
      let pct = 0;
      const interval = setInterval(() => {
        pct = Math.min(pct + 1.8, 95);
        setScanPct(Math.round(pct));
        if (pct >= 95) clearInterval(interval);
      }, 35);

      const atsRes  = await fetch(`${BASE}/ats-score/`, { method: "POST" });
      const atsJson = await atsRes.json();

      if (!atsRes.ok) {
        clearInterval(interval);
        setErrMsg(atsJson.error || "ATS analysis failed.");
        setPhase("error");
        return;
      }

      clearInterval(interval);
      setScanPct(100);
      await new Promise((r) => setTimeout(r, 600));

      setAtsData(atsJson);
      setPhase("done");

      // Mobile: auto-scroll to results
      if (isMobile) {
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    } catch {
      setErrMsg("Server-ஐ connect பண்ண முடியல. Backend running-ஆ இருக்கா check பண்ணுங்க.");
      setPhase("error");
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const st       = atsData ? (LEVEL_STYLES[atsData.level] || LEVEL_STYLES["Average"]) : null;
  const isScanning = phase === "scanning" || phase === "done";
  const btnLabel =
    phase === "uploading" ? "Uploading…"
    : phase === "scanning" ? "Scanning…"
    : atsData             ? "⬆ Scan Another"
    : "⬆ Upload Resume";

  /* ── Upload Panel (shared between mobile/desktop) ── */
  const UploadPanel = (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 20,
      padding: isMobile ? "32px 20px 24px" : "48px 28px",
      boxSizing: "border-box",
      ...(isMobile ? {} : {
        width: "clamp(260px, 38%, 380px)",
        borderRight: "1px solid #f1f5f9",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        justifyContent: "center",
      }),
    }}>
      {/* Icon + title */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "linear-gradient(135deg,#2563eb,#60a5fa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px",
          boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
        }}>
          <span style={{ fontSize: 22 }}>📄</span>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          ATS Resume Scanner
        </h2>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 6, lineHeight: 1.6, maxWidth: 260 }}>
          Upload your PDF resume to get an instant ATS compatibility score
        </p>
      </div>

      {/* Button */}
      <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} style={{ display: "none" }} />
      <button
        onClick={() => canUpload && fileRef.current?.click()}
        disabled={!canUpload}
        style={{
          padding: "11px 28px",
          background: !canUpload ? "#93c5fd" : "#2563eb",
          color: "#fff", border: "none", borderRadius: 10,
          fontSize: 14, fontWeight: 600,
          cursor: !canUpload ? "not-allowed" : "pointer",
          transition: "background 0.2s, transform 0.1s",
          boxShadow: canUpload ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
          width: isMobile ? "100%" : "auto",
          maxWidth: 280,
        }}
        onMouseDown={(e) => canUpload && (e.currentTarget.style.transform = "scale(0.97)")}
        onMouseUp={(e)   => (e.currentTarget.style.transform = "scale(1)")}
      >
        {btnLabel}
      </button>

      {fileName && (
        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>📄 {fileName}</p>
      )}

      {phase === "error" && (
        <div style={{
          background: "#fee2e2", color: "#b91c1c", borderRadius: 8,
          padding: "10px 14px", fontSize: 12, maxWidth: 260,
          textAlign: "center", lineHeight: 1.5,
        }}>
          ⚠️ {errMsg}
        </div>
      )}

      {/* Show scan preview only on desktop; mobile shows it inline in results area */}
      {!isMobile && isScanning && (
        <ResumePreview phase={phase} scanPct={scanPct} />
      )}
    </div>
  );

  /* ── Results Panel ── */
  const ResultsPanel = (
    <div
      ref={resultRef}
      style={{
        flex: 1,
        minWidth: 0,
        padding: isMobile ? "24px 16px 40px" : "40px 32px",
        boxSizing: "border-box",
        display: "flex", flexDirection: "column", gap: 28,
        ...(isMobile ? {} : { overflowY: "auto", height: "100vh" }),
      }}
    >
      {/* Mobile scan preview — shows above results while scanning */}
      {isMobile && isScanning && !atsData && (
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8 }}>
          <ResumePreview phase={phase} scanPct={scanPct} />
        </div>
      )}

      {!atsData ? (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 12, minHeight: isMobile ? 160 : 320,
        }}>
          <span style={{ fontSize: 52, opacity: 0.18 }}>📊</span>
          <p style={{ fontSize: 14, color: "#cbd5e1", margin: 0, textAlign: "center" }}>
            {phase === "scanning" ? "Analyzing your resume…" : "ATS score will appear here after scanning"}
          </p>
          {phase === "scanning" && (
            <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%", background: "#2563eb",
                  animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ animation: "fadeUp 0.45s ease" }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center",
            gap: 20, flexWrap: "wrap", marginBottom: 28,
          }}>
            <ScoreRing score={atsData.overall_score} color={st.bar} />
            <div style={{ flex: 1, minWidth: 160 }}>
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700,
                padding: "3px 12px", borderRadius: 20,
                background: st.bg, color: st.text, marginBottom: 8,
              }}>
                {atsData.level}
              </span>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 5 }}>
                ATS analysis complete
              </div>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65, margin: 0 }}>
                {atsData.summary}
              </p>
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 14 }}>
              Category Breakdown
            </p>
            <CategoryChart categories={atsData.categories} />
          </div>

          {/* Score cards */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 14 }}>
              Score Summary
            </p>
            <ScoreCards categories={atsData.categories} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#fff",
      ...(isMobile
        ? { minHeight: "100vh", display: "flex", flexDirection: "column" }
        : { height: "100vh", display: "flex", flexDirection: "row", overflow: "hidden" }
      ),
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }
      `}</style>

      {isMobile ? (
        /* Mobile: top-bottom stacked, page scrolls naturally */
        <>
          <div style={{ borderBottom: "1px solid #f1f5f9" }}>
            {UploadPanel}
          </div>
          {ResultsPanel}
        </>
      ) : (
        /* Desktop: side-by-side, each panel scrolls independently */
        <>
          {UploadPanel}
          {ResultsPanel}
        </>
      )}
    </div>
  );
}