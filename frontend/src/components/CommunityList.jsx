import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function CommunityList() {
  const [communities, setCommunities] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("CAREER");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const loadCommunities = () => {
    fetch(`${API_BASE_URL}/communities`)
      .then((res) => res.json())
      .then((data) => {
        setCommunities(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/communities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ name, description, category }),
      });

      if (!res.ok) {
        throw new Error("Failed to create community. Please log in first.");
      }

      setName("");
      setDescription("");
      setShowModal(false);
      loadCommunities();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/communities/${communityId}/join`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const joined = await res.json();
      if (joined) {
        alert("You have joined this community!");
        loadCommunities();
      } else {
        alert("You are already a member of this community.");
      }
    } catch (err) {
      alert("Please log in to join communities.");
    }
  };

  return (
    <main className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Community Groups</h1>
          <p className="page-subtitle">Join category-specific communities to discuss options and solve decisions together.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="primary-btn">
          ➕ Create Community
        </button>
      </div>

      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000
        }}>
          <div className="login-box" style={{ maxWidth: "500px" }}>
            <h2>Create New Community</h2>
            <form onSubmit={handleCreateCommunity}>
              <input
                type="text"
                placeholder="Community Name (e.g. Tech Career Advice)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ marginBottom: "12px" }}
              />
              <textarea
                placeholder="Description of community focus..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ marginBottom: "12px" }}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ marginBottom: "16px" }}
              >
                <option value="CAREER">Career</option>
                <option value="TECHNOLOGY">Technology</option>
                <option value="EDUCATION">Education</option>
                <option value="FINANCE">Finance</option>
                <option value="TRAVEL">Travel</option>
                <option value="LIFESTYLE">Lifestyle</option>
              </select>

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="submit" className="primary-btn">Create Group</button>
                <button type="button" onClick={() => setShowModal(false)} className="secondary-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading communities...</p>
      ) : communities.length === 0 ? (
        <div className="content-section" style={{ textAlign: "center", padding: "40px" }}>
          <p>No communities created yet. Be the first to start a group!</p>
        </div>
      ) : (
        <div className="cards-grid">
          {communities.map((comm) => (
            <div key={comm.id} className="decision-card">
              <div>
                <span className="category-tag" style={{ marginBottom: "8px", display: "inline-block" }}>{comm.category}</span>
                <h3>{comm.name}</h3>
                <p>{comm.description || "No description provided."}</p>
              </div>

              <div className="card-footer">
                <span>👥 {comm.memberCount || 1} Members</span>
                <button onClick={() => handleJoinCommunity(comm.id)} className="primary-btn" style={{ padding: "6px 14px", fontSize: "13px" }}>
                  Join Group
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default CommunityList;
