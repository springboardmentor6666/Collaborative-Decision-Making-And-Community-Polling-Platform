import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

function DashboardLayout({ children, pageTitle, pageSubtitle }) {

  const navigate = useNavigate();
  const location = useLocation();

  const userEmail = localStorage.getItem("userEmail") || "";
  const role = localStorage.getItem("role") || "USER";

  const navItems = [
    { label: "Dashboard", icon: "🏠", route: "/home" },
    { label: "Create Decision", icon: "➕", route: "/create-decision" },
    { label: "My Decisions", icon: "📊", route: "/decisions" },
    { label: "Active Polls", icon: "🗳", route: "/polls" },
    { label: "Communities", icon: "👥", route: "/communities" },
    { label: "Analytics", icon: "📈", route: "/analytics" },
    { label: "Profile", icon: "👤", route: "/profile" }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");

    navigate("/");
  };

    const initials = userEmail
    ? userEmail.charAt(0).toUpperCase()
    : "?";

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) return;

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      // notifications are non-critical, fail silently
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      // fail silently
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch("http://localhost:8080/api/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      // fail silently
    }
  };

  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const diffMs = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      <style>{`

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Arial, sans-serif;
        }


        html,
        body,
        #root {
          width: 100%;
          min-height: 100%;
          margin: 0;
          background: #0b0912;
        }


        body {
          overflow-x: hidden;
        }


        /* =========================
           MAIN LAYOUT
        ========================= */

        .layout {
          display: flex;

          width: 100%;

          min-height: 100vh;

          background: #0b0912;
        }


        /* =========================
           SIDEBAR
        ========================= */

        .sidebar {
          position: fixed;

          top: 0;
          left: 0;
          bottom: 0;

          width: 250px;
          min-width: 250px;

          background:
            linear-gradient(
              180deg,
              #1e1b4b 0%,
              #27235f 50%,
              #312e81 100%
            );

          color: white;

          display: flex;
          flex-direction: column;

          padding: 25px 18px;

          z-index: 100;

          overflow-y: auto;
          overflow-x: hidden;
        }


        /* =========================
           LOGO
        ========================= */

        .sidebar-logo {
          font-size: 24px;

          font-weight: 800;

          margin-bottom: 35px;

          padding-left: 8px;

          white-space: nowrap;

          color: #ffffff;
        }


        /* =========================
           NAVIGATION
        ========================= */

        .nav-item {
          display: flex;

          align-items: center;

          gap: 12px;

          width: 100%;

          padding: 12px 14px;

          border-radius: 10px;

          cursor: pointer;

          color: #d4d4f7;

          font-weight: 500;

          margin-bottom: 4px;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }


        .nav-item:hover {
          background:
            rgba(255, 255, 255, 0.08);

          color: white;
        }


        .nav-item.active {
          background: #4f46e5;

          color: white;

          box-shadow:
            0 4px 12px rgba(79, 70, 229, 0.25);
        }


        .nav-icon {
          font-size: 18px;

          width: 22px;

          min-width: 22px;

          text-align: center;
        }


        /* =========================
           LOGOUT
        ========================= */

        .sidebar-bottom {
          margin-top: auto;

          padding-top: 20px;
        }


        .logout-btn {
          display: flex;

          align-items: center;

          gap: 12px;

          padding: 12px 14px;

          border-radius: 10px;

          cursor: pointer;

          color: #fca5a5;

          font-weight: 600;

          background:
            rgba(239, 68, 68, 0.12);

          transition:
            background 0.2s ease;
        }


        .logout-btn:hover {
          background:
            rgba(239, 68, 68, 0.22);
        }


        /* =========================
           MAIN AREA
        ========================= */

        .main {
          margin-left: 250px;

          width: calc(100% - 250px);

          min-width: 0;

          min-height: 100vh;

          padding: 30px 40px;

          background: #0b0912;

          color: #f8fafc;

          overflow-x: hidden;
        }


        /* =========================
           TOP BAR
        ========================= */

        .topbar {
          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 20px;

          width: 100%;

          margin-bottom: 30px;

          min-width: 0;
        }


        /* =========================
           PAGE HEADING
        ========================= */

        .page-heading {
          min-width: 0;
        }


        .page-heading h1 {
          font-size: 26px;

          font-weight: 600;

          color: #f8fafc;

          white-space: nowrap;
        }


        .page-heading p {
          color: #a7a1b5;

          margin-top: 5px;

          font-size: 14px;
        }


        /* =========================
           TOP RIGHT
        ========================= */

        .topbar-right {
          display: flex;

          align-items: center;

          gap: 18px;

          flex-shrink: 0;
        }


                .bell-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .bell {
          font-size: 20px;
          cursor: pointer;
          flex-shrink: 0;
          position: relative;
        }

        .bell-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        .notification-dropdown {
          position: absolute;
          top: 34px;
          right: -10px;
          width: 320px;
          max-height: 380px;
          background: #14111f;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          box-shadow: 0 20px 45px rgba(0,0,0,0.45);
          overflow: hidden;
          z-index: 50;
          display: flex;
          flex-direction: column;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-size: 13px;
          font-weight: 700;
          color: white;
        }

        .mark-all-read {
          font-size: 11px;
          font-weight: 600;
          color: #a78bfa;
          cursor: pointer;
        }

        .notification-list {
          overflow-y: auto;
          max-height: 320px;
        }

        .notification-empty {
          padding: 30px 16px;
          text-align: center;
          font-size: 13px;
          color: #9c93b0;
        }

        .notification-item {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: background .15s;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-item:hover {
          background: rgba(255,255,255,0.04);
        }

        .notification-item.unread {
          background: rgba(124,58,237,0.08);
        }

        .notification-item.unread .notification-message {
          font-weight: 700;
          color: white;
        }

        .notification-message {
          font-size: 13px;
          color: #d6d0e3;
          line-height: 1.4;
        }

        .notification-time {
          font-size: 11px;
          color: #7d7690;
          margin-top: 4px;
        }


        /* =========================
           AVATAR
        ========================= */

        .avatar {
          width: 38px;

          height: 38px;

          min-width: 38px;

          border-radius: 50%;

          background: #4f46e5;

          color: white;

          display: flex;

          align-items: center;

          justify-content: center;

          font-weight: 700;
        }


        /* =========================
           USER CHIP
        ========================= */

        .user-chip {
          display: flex;

          align-items: center;

          gap: 10px;

          background: #15121f;

          border:
            1px solid #2d2840;

          padding: 6px 14px 6px 6px;

          border-radius: 30px;

          max-width: 280px;

          min-width: 0;
        }


        .user-chip-text {
          display: flex;

          flex-direction: column;

          line-height: 1.2;

          min-width: 0;
        }


        .user-chip-email {
          font-size: 13px;

          font-weight: 600;

          color: #f3f4f6;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }


        .user-chip-role {
          font-size: 11px;

          color: #9ca3af;

          text-transform: capitalize;
        }


        /* =========================
           TABLET
        ========================= */

        @media (max-width: 1100px) {

          .sidebar {
            width: 220px;

            min-width: 220px;
          }


          .main {
            margin-left: 220px;

            width: calc(100% - 220px);

            padding:
              25px 25px;
          }


          .user-chip {
            max-width: 220px;
          }

        }


        /* =========================
           SMALL LAPTOP
        ========================= */

        @media (max-width: 850px) {

          .sidebar {
            width: 200px;

            min-width: 200px;

            padding:
              22px 14px;
          }


          .main {
            margin-left: 200px;

            width: calc(100% - 200px);

            padding:
              22px 20px;
          }


          .sidebar-logo {
            font-size: 21px;
          }


          .nav-item {
            font-size: 14px;

            padding:
              11px 10px;
          }


          .topbar-right {
            gap: 10px;
          }


          .user-chip {
            max-width: 180px;
          }

        }


        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 650px) {

          .layout {
            display: block;

            width: 100%;
          }


          .sidebar {
            position: relative;

            width: 100%;

            min-width: 0;

            height: auto;

            padding: 15px;

            overflow: visible;
          }


          .sidebar-logo {
            margin-bottom: 15px;
          }


          .sidebar-bottom {
            margin-top: 10px;
          }


          .main {
            margin-left: 0;

            width: 100%;

            min-width: 0;

            padding:
              20px 15px;
          }


          .topbar {
            flex-direction: column;

            align-items: flex-start;

            gap: 15px;
          }


          .topbar-right {
            width: 100%;

            justify-content: flex-end;
          }


          .page-heading h1 {
            font-size: 24px;
          }


          .user-chip {
            max-width: 230px;
          }

        }

      `}</style>


      <div className="layout">

        {/* =========================
            SIDEBAR
        ========================= */}

        <div className="sidebar">

          <div className="sidebar-logo">
            DecisionHub
          </div>


          <div>

            {navItems.map((item) => (

              <div
                key={item.route}

                className={
                  "nav-item" +
                  (
                    location.pathname === item.route
                      ? " active"
                      : ""
                  )
                }

                onClick={() =>
                  navigate(item.route)
                }
              >

                <span className="nav-icon">
                  {item.icon}
                </span>

                {item.label}

              </div>

            ))}

          </div>


          <div className="sidebar-bottom">

            <div
              className="logout-btn"
              onClick={handleLogout}
            >

              <span className="nav-icon">
                🚪
              </span>

              Logout

            </div>

          </div>

        </div>


        {/* =========================
            MAIN CONTENT
        ========================= */}

        <div className="main">

          <div className="topbar">

            <div className="page-heading">

              <h1>
                {pageTitle}
              </h1>

              {pageSubtitle && (
                <p>
                  {pageSubtitle}
                </p>
              )}

            </div>


                        <div className="topbar-right">

              <div className="bell-wrapper" ref={notificationRef}>

                <div
                  className="bell"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="bell-badge">{unreadCount}</span>
                  )}
                </div>

                {showNotifications && (
                  <div className="notification-dropdown">

                    <div className="notification-header">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="mark-all-read" onClick={markAllAsRead}>
                          Mark all as read
                        </span>
                      )}
                    </div>

                    <div className="notification-list">

                      {notifications.length === 0 && (
                        <div className="notification-empty">
                          You're all caught up. No notifications yet.
                        </div>
                      )}

                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notification-item ${n.read ? "" : "unread"}`}
                          onClick={() => !n.read && markAsRead(n.id)}
                        >
                          <div className="notification-message">
                            {n.message}
                          </div>
                          <div className="notification-time">
                            {timeAgo(n.createdAt)}
                          </div>
                        </div>
                      ))}

                    </div>

                  </div>
                )}

              </div>


              <div className="user-chip">

                <div className="avatar">
                  {initials}
                </div>


                <div className="user-chip-text">

                  <span className="user-chip-email">
                    {userEmail || "Guest"}
                  </span>

                  <span className="user-chip-role">
                    {role.toLowerCase()}
                  </span>

                </div>

              </div>

            </div>

          </div>


          {children}

        </div>

      </div>

    </>
  );
}

export default DashboardLayout;