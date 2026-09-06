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

  // Change password state
  const [newPassword, setNewPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");

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
      const profRes = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!profRes.ok) throw new Error("Failed to load profile");
      const profData = await profRes.json();
      setProfile(profData);
      setFullName(profData.fullName || "");
      setInterests(profData.interests || "");

      const decRes = await fetch("/api/decisions/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (decRes.ok) {
        const decData = await decRes.json();
        setMyDecisions(decData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, interests })
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setProfile(data);
      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg("");
    setPwdErr("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password");
      setPwdMsg("Password changed successfully!");
      setNewPassword("");
    } catch (err) {
      setPwdErr(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#0b0f19", minHeight: "100vh", color: "#f8fafc" }}>
        <Navbar />
        <div style={{ padding: "80px 20px", textAlign: "center", color: "#94a3b8" }}>
          Loading your profile...
        </div>
      </div>
    );
  }

  const role = profile?.role?.replace("ROLE_", "") || "USER";

  return (
    <div style={{ background: "#0b0f19", minHeight: "100vh", color: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      <Navbar />

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Profile Card */}
        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "20px", padding: "32px", marginBottom: "32px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "#0f172a"
                }}
              >
                {(profile?.fullName || profile?.username || "U")[0].toUpperCase()}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800 }}>
                    {profile?.fullName || profile?.username}
                  </h1>
                  <span
                    style={{
                      background:
                        role === "ADMIN"
                          ? "#ef4444"
                          : role === "MODERATOR"
                          ? "#8b5cf6"
                          : "#0ea5e9",
                      color: "#fff",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      padding: "3px 8px",
                      borderRadius: "6px"
                    }}
                  >
                    {role}
                  </span>
                </div>
                <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.95rem" }}>
                  @{profile?.username} • {profile?.email}
                </p>
                <small style={{ color: "#64748b" }}>
                  Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "2026"}
                </small>
              </div>
            </div>

            <button
              onClick={() => setEditing(!editing)}
              style={{
                background: editing ? "#334155" : "#0284c7",
                color: "#fff",
                border: "none",
                padding: "8px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.85rem"
              }}
            >
              {editing ? "Cancel" : "✏️ Edit Profile"}
            </button>
          </div>

          {message && (
            <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e", color: "#4ade80", padding: "10px", borderRadius: "8px", marginTop: "16px", fontSize: "0.85rem" }}>
              {message}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleUpdateProfile} style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "0.85rem", marginBottom: "6px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#1e293b", border: "1px solid #334155", color: "#fff" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "0.85rem", marginBottom: "6px" }}>
                  Interests & Decision Categories (e.g. Technology, Career, Finance)
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#1e293b", border: "1px solid #334155", color: "#fff" }}
                  placeholder="Technology, Travel, Career"
                />
              </div>

              <button
                type="submit"
                style={{ alignSelf: "flex-start", padding: "10px 20px", borderRadius: "8px", background: "#22c55e", color: "#0f172a", border: "none", fontWeight: 700, cursor: "pointer" }}
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #1f2937" }}>
              <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "8px" }}>INTERESTS & FOCUS AREAS</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(profile?.interests || "Technology, Career, Innovation")
                  .split(",")
                  .map((item, idx) => (
                    <span
                      key={idx}
                      style={{ background: "#1e293b", border: "1px solid #334155", padding: "4px 12px", borderRadius: "16px", fontSize: "0.8rem", color: "#38bdf8" }}
                    >
                      {item.trim()}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Change Password Card */}
        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "20px", padding: "28px", marginBottom: "32px" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "1.15rem", color: "#38bdf8" }}>
            Account Security & Password
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 16px 0" }}>
            Update your account password. Must be at least 6 characters.
          </p>

          {pwdMsg && (
            <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e", color: "#4ade80", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.85rem" }}>
              {pwdMsg}
            </div>
          )}
          {pwdErr && (
            <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#f87171", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.85rem" }}>
              {pwdErr}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={{ flex: 1, minWidth: "240px", padding: "10px 14px", borderRadius: "8px", background: "#1e293b", border: "1px solid #334155", color: "#fff" }}
            />
            <button
              type="submit"
              style={{ padding: "10px 20px", borderRadius: "8px", background: "#334155", color: "#f8fafc", border: "1px solid #475569", fontWeight: 600, cursor: "pointer" }}
            >
              Update Password
            </button>
          </form>
        </div>

        {/* My Decisions Section */}
        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "20px", padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "1.15rem" }}>
              My Created Decision Boards ({myDecisions.length})
            </h3>
            <Link
              to="/decisions"
              style={{ color: "#38bdf8", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600 }}
            >
              + New Decision
            </Link>
          </div>

          {myDecisions.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              You haven't created any decision boards yet. Head over to{" "}
              <Link to="/decisions" style={{ color: "#38bdf8" }}>Decisions</Link> to post your first board!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {myDecisions.map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#1e293b",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    border: "1px solid #334155"
                  }}
                >
                  <div>
                    <Link
                      to={`/decisions/${d.id}`}
                      style={{ fontWeight: 700, fontSize: "1.05rem", color: "#f8fafc", textDecoration: "none" }}
                    >
                      {d.title}
                    </Link>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>
                      Category: <span style={{ color: "#38bdf8" }}>{d.category}</span> • Status: <span style={{ color: d.status === "ACTIVE" ? "#4ade80" : "#fbbf24" }}>{d.status}</span> • Visibility: {d.visibility}
                    </div>
                  </div>

                  <Link
                    to={`/decisions/${d.id}`}
                    style={{
                      background: "rgba(56,189,248,0.1)",
                      color: "#38bdf8",
                      border: "1px solid #38bdf8",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      textDecoration: "none",
                      fontWeight: 600
                    }}
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
