import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Reports() {
  const [reports, setReports] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDecisionId, setSelectedDecisionId] = useState("");
  const [reportType, setReportType] = useState("DECISION_REPORT");
  const [fileFormat, setFileFormat] = useState("PDF");
  const [previewReport, setPreviewReport] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDecisions();
    if (token) {
      fetchReports();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchDecisions = async () => {
    try {
      const res = await fetch("/api/decisions");
      if (res.ok) {
        const data = await res.json();
        setDecisions(data);
        if (data.length > 0) {
          setSelectedDecisionId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching decisions:", err);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }
    setGenerating(true);
    setMessage("");

    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reportType,
          fileFormat,
          decisionId: selectedDecisionId ? Number(selectedDecisionId) : null
        })
      });

      if (res.ok) {
        const newReport = await res.json();
        setReports([newReport, ...reports]);
        setMessage("Report generated successfully!");
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadCsv = async (reportId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`/api/reports/${reportId}/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `decisionhub_report_${reportId}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      alert("Failed to export report CSV: " + err.message);
    }
  };

  const handlePrintPdf = (report) => {
    setPreviewReport(report);
  };

  return (
    <div style={{ background: "#0b0f19", minHeight: "100vh", color: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      <Navbar />

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, margin: "0 0 8px 0", background: "linear-gradient(90deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Reports & Export Center
          </h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "1rem" }}>
            Generate structured decision summaries, poll analytics, and community reports in PDF, Excel, and CSV formats.
          </p>
        </div>

        {/* Generate Report Card */}
        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "28px", marginBottom: "36px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 16px 0", color: "#38bdf8" }}>
            Generate New Report
          </h2>

          {message && (
            <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e", color: "#4ade80", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.9rem" }}>
              {message}
            </div>
          )}

          <form onSubmit={handleGenerate} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px" }}>
                Target Decision Board
              </label>
              <select
                value={selectedDecisionId}
                onChange={(e) => setSelectedDecisionId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "#f8fafc",
                  fontSize: "0.9rem"
                }}
              >
                {decisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px" }}>
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "#f8fafc",
                  fontSize: "0.9rem"
                }}
              >
                <option value="DECISION_REPORT">Decision Summary & Pros/Cons</option>
                <option value="POLL_RESULTS">Poll Participation & Percentages</option>
                <option value="VOTING_ANALYTICS">Option Scoring & Ranking Matrix</option>
                <option value="COMMUNITY_REPORT">Community Collaboration Activity</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px" }}>
                Output Format
              </label>
              <select
                value={fileFormat}
                onChange={(e) => setFileFormat(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "#f8fafc",
                  fontSize: "0.9rem"
                }}
              >
                <option value="PDF">PDF Document (Printable)</option>
                <option value="CSV">CSV Spreadsheet Data</option>
                <option value="EXCEL">Excel Compatible (.xlsx)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generating}
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                color: "#fff",
                border: "none",
                padding: "11px 24px",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                height: "42px"
              }}
            >
              {generating ? "Generating..." : "⚡ Generate Report"}
            </button>
          </form>
        </div>

        {/* Existing Reports List */}
        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "28px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 20px 0" }}>
            Generated Reports Library
          </h2>

          {reports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
              {token ? "No reports generated yet. Use the form above to generate your first report!" : "Please login to view and generate reports."}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {reports.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    background: "#1e293b",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    border: "1px solid #334155"
                  }}
                >
                  <div style={{ maxWidth: "600px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span
                        style={{
                          background: r.fileFormat === "PDF" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)",
                          color: r.fileFormat === "PDF" ? "#f87171" : "#4ade80",
                          border: `1px solid ${r.fileFormat === "PDF" ? "#ef4444" : "#22c55e"}`,
                          fontSize: "0.7rem",
                          fontWeight: "bold",
                          padding: "2px 8px",
                          borderRadius: "4px"
                        }}
                      >
                        {r.fileFormat}
                      </span>
                      <strong style={{ fontSize: "1rem" }}>
                        {r.decisionTitle || r.communityName || "Platform Analytics"}
                      </strong>
                    </div>
                    <p style={{ margin: "4px 0", fontSize: "0.85rem", color: "#cbd5e1" }}>
                      {r.summaryText}
                    </p>
                    <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                      Type: {r.reportType} • Generated by: {r.username || "User"} • Date: {new Date(r.generatedAt).toLocaleString()}
                    </small>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handlePrintPdf(r)}
                      style={{
                        background: "rgba(56,189,248,0.15)",
                        color: "#38bdf8",
                        border: "1px solid #38bdf8",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      📄 View & Print
                    </button>
                    <button
                      onClick={() => handleDownloadCsv(r.id)}
                      style={{
                        background: "rgba(34,197,94,0.15)",
                        color: "#4ade80",
                        border: "1px solid #22c55e",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      ⬇ Download CSV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Printable Report Modal */}
      {previewReport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 4000,
            padding: "20px"
          }}
        >
          <div
            id="printable-report"
            style={{
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: "16px",
              padding: "40px",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #0f172a", paddingBottom: "12px", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0, color: "#0284c7" }}>DecisionHub</h2>
                <small style={{ color: "#64748b" }}>Official Decision Analytics & Polling Report</small>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>REPORT #{previewReport.id}</div>
                <small style={{ color: "#64748b" }}>{new Date(previewReport.generatedAt).toLocaleDateString()}</small>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 6px 0", color: "#1e293b" }}>
                Subject: {previewReport.decisionTitle || previewReport.communityName || "Platform Intelligence"}
              </h3>
              <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: 1.5 }}>
                {previewReport.summaryText}
              </p>
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
              <div style={{ fontWeight: 600, color: "#334155", marginBottom: "8px" }}>Report Details:</div>
              <div style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.8 }}>
                • <strong>Report Scope:</strong> {previewReport.reportType}<br />
                • <strong>Requested By:</strong> {previewReport.username || "System"}<br />
                • <strong>Format:</strong> {previewReport.fileFormat}<br />
                • <strong>Verified Timestamp:</strong> {new Date(previewReport.generatedAt).toUTCString()}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                style={{ padding: "10px 18px", borderRadius: "8px", background: "#e2e8f0", border: "none", color: "#334155", cursor: "pointer", fontWeight: 600 }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ padding: "10px 20px", borderRadius: "8px", background: "#0284c7", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600 }}
              >
                🖨️ Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Reports;
