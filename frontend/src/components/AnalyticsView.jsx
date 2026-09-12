import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function AnalyticsView() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/decisions`)
      .then((res) => res.json())
      .then((data) => {
        setDecisions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categoryCounts = decisions.reduce((acc, curr) => {
    const cat = curr.category || "General";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const totalVotes = decisions.reduce((acc, curr) => acc + (curr.totalVotes || 0), 0);

  return (
    <main className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Decision Analytics & Insights</h1>
          <p className="page-subtitle">Real-time statistics on vote distribution, category trends, and option popularity.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h4>Total Decision Boards</h4>
            <div className="stat-value">{decisions.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🗳️</div>
          <div className="stat-info">
            <h4>Total Community Votes</h4>
            <div className="stat-value">{totalVotes}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <h4>Avg Participation Rate</h4>
            <div className="stat-value">
              {decisions.length > 0 ? (totalVotes / decisions.length).toFixed(1) : 0} / board
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <section className="content-section">
        <h2 className="section-title">📌 Decision Breakdown by Category</h2>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Calculating analytics data...</p>
        ) : Object.keys(categoryCounts).length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No decision analytics recorded yet.</p>
        ) : (
          Object.entries(categoryCounts).map(([cat, count]) => {
            const percentage = Math.round((count / decisions.length) * 100);
            return (
              <div key={cat} style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontWeight: "700" }}>
                  <span>{cat}</span>
                  <span>{count} Boards ({percentage}%)</span>
                </div>
                <div className="vote-bar-bg">
                  <div className="vote-bar-fill" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}

export default AnalyticsView;
