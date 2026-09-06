import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  let user = null;

  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch (e) {
      // Ignore
    }
  }

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      // Fail silently for unauthenticated/offline
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const userRole = user?.roles?.[0]?.replace("ROLE_", "") || "USER";

  return (
    <nav className="navbar" style={{ position: "sticky", top: 0, zIndex: 1000 }}>
      <div className="logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        Decision<span>Hub</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        <Link to="/">Home</Link>
        <Link to="/decisions">Decisions</Link>
        <Link to="/option-comparison">Compare</Link>
        <Link to="/community">Community</Link>
        <Link to="/dashboard">Analytics</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/database">Database</Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {token && user ? (
          <>
            {/* Notification Bell */}
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                  position: "relative",
                  padding: "4px 8px"
                }}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      lineHeight: 1
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: "10px",
                    width: "320px",
                    maxHeight: "380px",
                    overflowY: "auto",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    padding: "12px",
                    zIndex: 2000,
                    color: "#f8fafc"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #334155",
                      paddingBottom: "8px",
                      marginBottom: "8px"
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      Notifications ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#38bdf8",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          textDecoration: "underline"
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p style={{ fontSize: "0.85rem", color: "#94a3b8", textAlign: "center", margin: "16px 0" }}>
                      No notifications yet.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "8px",
                            background: n.isRead ? "#0f172a" : "#1e3a8a33",
                            borderLeft: n.isRead ? "3px solid transparent" : "3px solid #38bdf8",
                            fontSize: "0.82rem",
                            cursor: n.isRead ? "default" : "pointer"
                          }}
                        >
                          <p style={{ margin: 0, color: n.isRead ? "#cbd5e1" : "#f8fafc" }}>
                            {n.message}
                          </p>
                          <small style={{ color: "#64748b", fontSize: "0.7rem" }}>
                            {n.notificationType} • {new Date(n.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile & Role Badge */}
            <Link
              to="/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                color: "#f8fafc",
                fontSize: "0.9rem",
                background: "rgba(255,255,255,0.06)",
                padding: "6px 12px",
                borderRadius: "20px"
              }}
            >
              <span>👤 {user.fullName || user.username}</span>
              <span
                style={{
                  background:
                    userRole === "ADMIN"
                      ? "#ef4444"
                      : userRole === "MODERATOR"
                      ? "#8b5cf6"
                      : "#0ea5e9",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  padding: "2px 6px",
                  borderRadius: "6px"
                }}
              >
                {userRole}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                padding: "6px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "0.85rem"
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "#f8fafc", fontSize: "0.9rem", textDecoration: "none" }}>
              Sign In
            </Link>
            <Link to="/register" className="nav-btn" style={{ padding: "8px 16px" }}>
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
