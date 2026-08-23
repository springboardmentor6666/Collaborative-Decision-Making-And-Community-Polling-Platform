import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [interests, setInterests] = useState("");
  const [editing, setEditing] = useState(false);
  const [myDecisions, setMyDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchProfileData();
  }, [token, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Fetch user profile
      const profRes = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!profRes.ok) throw new Error("Failed to load profile");
      const profData = await profRes.json();
      setProfile(profData);
      setFullName(profData.fullName || "");
      setInterests(profData.interests || "");

      // Fetch user's created decisions
      const decRes = await fetch("/api/decisions/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const decData = await decRes.json();
      setMyDecisions(decData);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    fetch("/api/users/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ fullName, interests })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update profile");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setEditing(false);
        setMessage("Profile updated successfully!");
        
        // Update user name in localStorage if changed
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        localUser.fullName = data.fullName;
        localStorage.setItem("user", JSON.stringify(localUser));
      })
      .catch((err) => setError(err.message));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-state">Loading profile...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page-container">
        <header className="page-header">
          <h1>My Profile Settings</h1>
          <p>Manage your account settings, interests, categories, and decision history.</p>
        </header>

        <div className="profile-layout-grid">
          <section className="profile-settings-card">
            <h2>Account Details</h2>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="text" value={profile.email} disabled className="disabled-input" />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" value={profile.username} disabled className="disabled-input" />
                </div>
                <div className="form-group">
                  <label>My Interests / Categories (separated by comma)</label>
                  <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g. Technology, Career, Lifestyle"
                  />
                </div>
                <div className="form-buttons">
                  <button type="button" className="secondary-btn" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-view-details">
                <div className="profile-pic-container">
                  <span className="profile-avatar-emoji">👤</span>
                </div>
                <div className="details-list">
                  <p><strong>Full Name:</strong> {profile.fullName || "Not provided"}</p>
                  <p><strong>Email Address:</strong> {profile.email}</p>
                  <p><strong>Username:</strong> {profile.username}</p>
                  <p><strong>Role:</strong> <span className="role-tag">{profile.role}</span></p>
                  <p><strong>My Interests:</strong> {profile.interests || "No interests added yet"}</p>
                  <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
                <button className="primary-btn edit-profile-btn" onClick={() => setEditing(true)}>
                  ⚙️ Edit Profile Settings
                </button>
              </div>
            )}
          </section>

          <section className="profile-history-card">
            <h2>My Decision Boards ({myDecisions.length})</h2>
            {myDecisions.length > 0 ? (
              <div className="history-list">
                {myDecisions.map((dec) => (
                  <div key={dec.id} className="history-item">
                    <div className="item-left">
                      <span className={`category-tag ${dec.category?.toLowerCase() || 'general'}`}>
                        {dec.category}
                      </span>
                      <h3>{dec.title}</h3>
                    </div>
                    <Link to={`/decisions/${dec.id}`} className="view-board-btn">
                      View Board →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="none-text">You haven't created any decision boards yet.</p>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;
