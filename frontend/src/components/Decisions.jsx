import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Decisions() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Career");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const categories = ["All", "Career", "Education", "Technology", "Travel", "Finance", "Lifestyle"];

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = () => {
    setLoading(true);
    fetch("/api/decisions")
      .then((res) => res.json())
      .then((data) => {
        setDecisions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching decisions:", err);
        setLoading(false);
      });
  };

  const handleCreateDecision = (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    fetch("/api/decisions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, category, visibility })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create decision board");
        return res.json();
      })
      .then((newDecision) => {
        setShowCreateModal(false);
        setTitle("");
        setDescription("");
        setCategory("Career");
        setVisibility("PUBLIC");
        setError("");
        fetchDecisions(); // Refresh list
        navigate(`/decisions/${newDecision.id}`); // Go directly to comparison options config
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  const filteredDecisions = categoryFilter === "All"
    ? decisions
    : decisions.filter(d => d.category?.toLowerCase() === categoryFilter.toLowerCase());

  return (
    <>
      <Navbar />
      <div className="decisions-page-container">
        <header className="page-header">
          <div className="header-title-section">
            <h1>Decision Boards</h1>
            <p>Explore choices, add pros & cons, and cast your votes on community boards.</p>
          </div>
          <button className="primary-btn add-board-btn" onClick={() => setShowCreateModal(true)}>
            ➕ Create Decision Board
          </button>
        </header>

        <div className="filters-container">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-tag ${categoryFilter === cat ? "active" : ""}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">Loading decisions...</div>
        ) : filteredDecisions.length > 0 ? (
          <div className="decisions-grid">
            {filteredDecisions.map((d) => (
              <div key={d.id} className="decision-card-full">
                <div className="card-top">
                  <span className={`category-tag ${d.category?.toLowerCase() || 'general'}`}>
                    {d.category || "General"}
                  </span>
                  <span className="visibility-badge">{d.visibility}</span>
                </div>
                <h3>{d.title}</h3>
                <p className="card-desc">{d.description || "No description provided."}</p>
                <div className="card-meta">
                  <span className="author">Posted by: <strong>{d.userFullName || d.username}</strong></span>
                  <span className="stats">🗳️ {d.voteCount || 0} votes • {d.optionCount || 0} options</span>
                </div>
                <div className="card-actions">
                  <Link to={`/decisions/${d.id}`} className="view-board-btn">
                    Compare Options & Vote →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No decision boards found in this category.</p>
            <button className="primary-btn" onClick={() => setShowCreateModal(true)}>Create the First Board</button>
          </div>
        )}

        {showCreateModal && (
          <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Decision Board</h2>
              {error && <p className="error-message">{error}</p>}
              <form onSubmit={handleCreateDecision}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. MBA vs Corporate Job, iPhone vs Samsung"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief details about the choice at hand..."
                  />
                </div>
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      {categories.filter(c => c !== "All").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group flex-1">
                    <label>Visibility</label>
                    <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                      <option value="PUBLIC">Public (Anyone can see & vote)</option>
                      <option value="PRIVATE">Private (Invite only)</option>
                    </select>
                  </div>
                </div>
                <div className="modal-buttons">
                  <button type="button" className="secondary-btn" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Create Board
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Decisions;
