import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setFullName(data.fullName || "");
        setInterests(data.interests || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, interests }),
      });

      const updated = await res.json();
      setProfile(updated);
      setMessage("Profile updated successfully!");
      setUpdating(false);
    } catch (err) {
      setMessage("Failed to update profile.");
      setUpdating(false);
    }
  };

  if (!token) {
    return (
      <main className="page-container">
        <h2>Profile Management</h2>
        <p style={{ color: "var(--text-muted)", margin: "16px 0" }}>Please sign in to view your profile settings.</p>
      </main>
    );
  }

  if (loading) {
    return <main className="page-container"><p style={{ color: "var(--text-muted)" }}>Loading user profile...</p></main>;
  }

  return (
    <main className="page-container" style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Profile</h1>
          <p className="page-subtitle">Manage your account information, interests, and participation metrics.</p>
        </div>
      </div>

      {profile && (
        <div className="dashboard-grid" style={{ marginBottom: "24px" }}>
          <div className="stat-card">
            <div className="stat-icon">📜</div>
            <div className="stat-info">
              <h4>Created Boards</h4>
              <div className="stat-value">{profile.createdDecisionsCount || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🗳️</div>
            <div className="stat-info">
              <h4>Votes Cast</h4>
              <div className="stat-value">{profile.totalVotesCast || 0}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleUpdate} className="content-section">
        {message && <div style={{ color: message.includes("success") ? "#22c55e" : "#ef4444", marginBottom: "16px", fontWeight: "700" }}>{message}</div>}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "700" }}>Username</label>
          <input type="text" value={profile?.username || ""} disabled style={{ width: "100%", opacity: 0.7 }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "700" }}>Email Address</label>
          <input type="email" value={profile?.email || ""} disabled style={{ width: "100%", opacity: 0.7 }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "700" }}>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "700" }}>Interests & Topics</label>
          <textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g. Technology, Higher Education, Startup vs Corporate"
            rows={3}
            style={{ width: "100%" }}
          />
        </div>

        <button type="submit" className="primary-btn" disabled={updating}>
          {updating ? "Saving Changes..." : "Save Profile"}
        </button>
      </form>
    </main>
  );
}

export default UserProfile;
