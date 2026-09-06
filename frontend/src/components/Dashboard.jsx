import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics/overview");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: "Career", color: "#38bdf8" },
    { name: "Education", color: "#818cf8" },
    { name: "Technology", color: "#34d399" },
    { name: "Travel", color: "#fbbf24" },
    { name: "Finance", color: "#f87171" },
    { name: "Lifestyle", color: "#c084fc" },
  ];

  if (loading) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", color: "#fff" }}>
        <Navbar />
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#94a3b8" }}>
          Loading Decision Analytics Dashboard...
        </div>
      </div>
    );
  }

  const totalDecisions = analytics?.totalDecisions || 0;
  const totalVotes = analytics?.totalVotes || 0;
  const activeDecisions = analytics?.activeDecisions || 0;
  const totalCommunities = analytics?.totalCommunities || 0;
  const pollCompletionRate = analytics?.pollCompletionRate || 0;
  const catBreakdown = analytics?.categoryBreakdown || {};
  const voteDist = analytics?.voteDistribution || {};
  const monthlyTrends = analytics?.monthlyTrends || [];
  const topDecisions = analytics?.topDecisions || [];

  return (
    <div style={{ background: "#0b0f19", minHeight: "100vh", color: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      <Navbar />

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, margin: "0 0 8px 0", background: "linear-gradient(90deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Decision Analytics Dashboard
            </h1>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "1rem" }}>
              Real-time insights into voting distributions, community participation, and decision outcomes.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              to="/decisions"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                boxShadow: "0 4px 14px rgba(14,165,233,0.3)"
              }}
            >
              + Create Decision
            </Link>
            <Link
              to="/reports"
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#cbd5e1",
                padding: "10px 20px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem"
              }}
            >
              📄 Export Reports
            </Link>
          </div>
        </div>

        {/* KPI Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "36px" }}>
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600 }}>
              <span>ACTIVE DECISIONS</span>
              <span>🗳️</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "12px", color: "#38bdf8" }}>
              {activeDecisions}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
              {totalDecisions} total decision boards
            </div>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600 }}>
              <span>TOTAL VOTES CAST</span>
              <span>📈</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "12px", color: "#34d399" }}>
              {totalVotes}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
              Across public & community polls
            </div>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600 }}>
              <span>COMMUNITIES</span>
              <span>🌐</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "12px", color: "#c084fc" }}>
              {totalCommunities}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
              6 specialized category hubs
            </div>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600 }}>
              <span>DECISION RESOLUTION</span>
              <span>🎯</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "12px", color: "#fbbf24" }}>
              {pollCompletionRate}%
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
              Resolved or actioned outcomes
            </div>
          </div>
        </div>

        {/* Charts & Graphs Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          
          {/* Vote Distribution By Category Chart */}
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.15rem", fontWeight: 700 }}>
              Vote Distribution by Category
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: "0 0 24px 0" }}>
              Relative engagement across decision categories
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {categories.map((cat) => {
                const votes = voteDist[cat.name] || 0;
                const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                return (
                  <div key={cat.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: cat.color }}></span>
                        {cat.name}
                      </span>
                      <span style={{ fontWeight: 600, color: "#cbd5e1" }}>
                        {votes} votes ({pct}%)
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "#1f2937", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.max(pct, 3)}%`,
                          height: "100%",
                          background: cat.color,
                          borderRadius: "4px",
                          transition: "width 0.6s ease"
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Decision Trends Chart (Visual SVG) */}
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.15rem", fontWeight: 700 }}>
              Platform Growth Trends (Decisions & Votes)
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: "0 0 24px 0" }}>
              6-month cumulative participation trajectory
            </p>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", height: "200px", gap: "24px", paddingTop: "20px" }}>
              {monthlyTrends.map((t, idx) => {
                const maxVal = Math.max(...monthlyTrends.map((m) => Number(m.votes) || 1));
                const heightPct = Math.round(((Number(t.votes) || 1) / maxVal) * 150);
                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: 600 }}>
                      {t.votes}
                    </div>
                    <div
                      style={{
                        width: "36px",
                        height: `${Math.max(heightPct, 15)}px`,
                        background: "linear-gradient(180deg, #38bdf8, #6366f1)",
                        borderRadius: "6px 6px 0 0",
                        boxShadow: "0 4px 12px rgba(56,189,248,0.2)"
                      }}
                    ></div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{t.month}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "24px", fontSize: "0.8rem", color: "#94a3b8" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", background: "#38bdf8", borderRadius: "2px" }}></span>
                Cumulative Votes
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", background: "#6366f1", borderRadius: "2px" }}></span>
                Active Polling Rate
              </span>
            </div>
          </div>

        </div>

        {/* Row 2: Top Decisions Table & Popular Categories */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
          
          {/* Top Decisions Leaderboard */}
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.15rem", fontWeight: 700 }}>
              Trending Decision Boards
            </h3>

            {topDecisions.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>No decisions found yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {topDecisions.map((dec, i) => (
                  <Link
                    key={dec.id}
                    to={`/decisions/${dec.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#1e293b",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      textDecoration: "none",
                      color: "inherit",
                      border: "1px solid #334155",
                      transition: "transform 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontWeight: 800, color: i === 0 ? "#fbbf24" : "#94a3b8", fontSize: "1.1rem" }}>
                        #{i + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{dec.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "#38bdf8" }}>{dec.category}</div>
                      </div>
                    </div>
                    <div style={{ background: "#0f172a", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, color: "#4ade80" }}>
                      {dec.votes} votes
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions & Decision Hub Links */}
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.15rem", fontWeight: 700 }}>
              Decision Management Modules
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Link
                to="/decisions"
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  padding: "16px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  color: "#f8fafc"
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>📋</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Decision Boards</div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>Create & vote on polls</div>
              </Link>

              <Link
                to="/option-comparison"
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  padding: "16px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  color: "#f8fafc"
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>⚖️</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Option Matrix</div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>Side-by-side factor scoring</div>
              </Link>

              <Link
                to="/community"
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  padding: "16px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  color: "#f8fafc"
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>💬</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Discussions</div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>Community forums & replies</div>
              </Link>

              <Link
                to="/reports"
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  padding: "16px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  color: "#f8fafc"
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>📑</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Export Hub</div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>Download PDF & CSV data</div>
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
