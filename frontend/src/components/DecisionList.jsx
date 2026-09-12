import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function DecisionList() {
  const [decisions, setDecisions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
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

  const filteredDecisions = decisions.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === "ALL" || d.category?.toUpperCase() === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ["ALL", "CAREER", "TECHNOLOGY", "EDUCATION", "FINANCE", "TRAVEL", "LIFESTYLE"];

  return (
    <main className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Decision Boards</h1>
          <p className="page-subtitle">Compare options, review pros and cons, and cast your votes.</p>
        </div>
        <Link to="/decisions/create">
          <button className="primary-btn">➕ Create Board</button>
        </Link>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="🔍 Search decisions by keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: "1",
            minWidth: "260px",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-card)",
            color: "var(--text-main)",
            outline: "none"
          }}
        />
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "primary-btn" : "secondary-btn"}
              style={{ padding: "8px 14px", fontSize: "13px" }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading decision boards...</p>
      ) : filteredDecisions.length === 0 ? (
        <div className="content-section" style={{ textAlign: "center", padding: "40px" }}>
          <h3>No matching decision boards found</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Try searching with a different term or create a new board.</p>
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
                <div className="card-footer">
                  <span>Votes: {decision.totalVotes || 0}</span>
                  <Link to={`/decisions/${decision.id}`}>
                    <button className="primary-btn" style={{ padding: "6px 14px", fontSize: "13px" }}>
                      Compare & Vote →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default DecisionList;
