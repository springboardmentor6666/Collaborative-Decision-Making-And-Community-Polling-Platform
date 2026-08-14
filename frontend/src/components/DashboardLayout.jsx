import { useNavigate, useLocation } from "react-router-dom";

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


        .bell {
          font-size: 20px;

          cursor: pointer;

          flex-shrink: 0;
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

              <div className="bell">
                🔔
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