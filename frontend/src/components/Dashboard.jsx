import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function Dashboard() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    fetch(`${API_BASE_URL}/decisions`)
      .then((res) => res.json())
      .then((data) => {
        setDecisions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load decisions:", err);
        setLoading(false);
      });
  }, []);

  const filteredDecisions = selectedCategory === "ALL" 
    ? decisions 
    : decisions.filter((d) => d.category?.toUpperCase() === selectedCategory);

  const categories = ["ALL", "CAREER", "TECHNOLOGY", "EDUCATION", "FINANCE", "TRAVEL", "LIFESTYLE"];
  const totalVotes = decisions.reduce((acc, curr) => acc + (curr.totalVotes || 0), 0);

  return (
    <main className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Decision Analytics Dashboard</h1>
          <p className="page-subtitle">Collaborative intelligence, active polling stats, and community outcomes.</p>
        </div>
        <Link to="/decisions/create">
          <button className="primary-btn">➕ Create New Decision Board</button>
        </Link>
      </div>

      {/* Statistical Overview Widgets */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h4>Active Boards</h4>
            <div className="stat-value">{decisions.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🗳️</div>
          <div className="stat-info">
            <h4>Total Votes Cast</h4>
            <div className="stat-value">{totalVotes}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌐</div>
          <div className="stat-info">
            <h4>Popular Categories</h4>
            <div className="stat-value">{categories.length - 1}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h4>Community Score</h4>
            <div className="stat-value">98%</div>
          </div>
        </div>
      </div>

      {/* Category Filter Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? "primary-btn" : "secondary-btn"}
            style={{ padding: "8px 18px", fontSize: "14px" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active Decisions Grid */}
      <section className="content-section">
        <h2 className="section-title">🔥 Featured Decision Boards</h2>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading active decision boards...</p>
        ) : filteredDecisions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            <p>No decision boards found in this category yet.</p>
            <Link to="/decisions/create" style={{ marginTop: "12px", display: "inline-block" }}>
              <button className="primary-btn">Create First Board</button>
            </Link>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredDecisions.map((decision) => (
              <div key={decision.id} className="decision-card">
                <div>
                  <div className="card-header">
                    <span className="category-tag">{decision.category}</span>
                    <span className={decision.visibility === "PUBLIC" ? "badge-public" : "badge-private"}>
                      {decision.visibility}
                    </span>
                  </div>
                  <h3>{decision.title}</h3>
                  <p>{decision.description || "No description provided."}</p>
                </div>

                <div>
                  <div style={{ marginBottom: "16px" }}>
                    <small style={{ color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                      Options: {decision.options ? decision.options.length : 0} | Total Votes: {decision.totalVotes || 0}
                    </small>
                  </div>
                  <div className="card-footer">
                    <span>By @{decision.username || "anonymous"}</span>
                    <Link to={`/decisions/${decision.id}`}>
                      <button className="secondary-btn" style={{ padding: "6px 14px", fontSize: "13px" }}>
                        View & Vote →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
