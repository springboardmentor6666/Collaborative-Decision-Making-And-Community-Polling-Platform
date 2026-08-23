import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Communities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Career");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const categories = ["Career", "Education", "Technology", "Travel", "Finance", "Lifestyle"];

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = () => {
    setLoading(true);
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    fetch("/api/communities", { headers })
      .then((res) => res.json())
      .then((data) => {
        setCommunities(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading communities:", err);
        setLoading(false);
      });
  };

  const handleCreateCommunity = (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }
    if (!communityName.trim()) {
      setError("Community name is required");
      return;
    }

    fetch("/api/communities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ communityName, description, category })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create community");
        return res.json();
      })
      .then(() => {
        setCommunityName("");
        setDescription("");
        setCategory("Career");
        setError("");
        setShowCreateModal(false);
        fetchCommunities();
      })
      .catch((err) => setError(err.message));
  };

  const handleJoinLeave = (community) => {
    if (!token) {
      navigate("/login");
      return;
    }

    const endpoint = community.member ? "leave" : "join";

    fetch(`/api/communities/${community.id}/${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to ${endpoint} community`);
        fetchCommunities();
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <Navbar />
      <div className="communities-page-container">
        <header className="page-header">
          <div className="header-title-section">
            <h1>Discussion Communities</h1>
            <p>Join category-based community groups to discuss decisions, ask for advice, and share recommendations.</p>
          </div>
          <button className="primary-btn" onClick={() => setShowCreateModal(true)}>
            ➕ Create Community
          </button>
        </header>

        {loading ? (
          <div className="loading-state">Loading communities...</div>
        ) : communities.length > 0 ? (
          <div className="communities-grid">
            {communities.map((c) => (
              <div key={c.id} className="community-card-full">
                <div className="card-top">
                  <span className={`category-tag ${c.category?.toLowerCase() || 'general'}`}>
                    {c.category}
                  </span>
                  <span className="member-count-badge">👥 {c.memberCount || 0} members</span>
                </div>
                <h3>{c.communityName}</h3>
                <p className="card-desc">{c.description || "No description provided."}</p>
                <div className="card-meta">
                  <span>Moderator: <strong>{c.moderatorName}</strong></span>
                </div>
                <div className="card-actions">
                  <button
                    className={`join-leave-btn ${c.member ? "leave-btn" : "join-btn"}`}
                    onClick={() => handleJoinLeave(c)}
                  >
                    {c.member ? "Leave Community" : "Join Community"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No communities found. Be the first to create one!</p>
            <button className="primary-btn" onClick={() => setShowCreateModal(true)}>Create Community</button>
          </div>
        )}

        {showCreateModal && (
          <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Community</h2>
              {error && <p className="error-message">{error}</p>}
              <form onSubmit={handleCreateCommunity}>
                <div className="form-group">
                  <label>Community Name *</label>
                  <input
                    type="text"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    placeholder="e.g. Technology Enthusiasts, Career Growth Hub"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this community board for?"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="modal-buttons">
                  <button type="button" className="secondary-btn" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Create Community
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

export default Communities;
