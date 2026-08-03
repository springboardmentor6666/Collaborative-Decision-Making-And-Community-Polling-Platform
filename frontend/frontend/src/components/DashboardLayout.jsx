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

  const initials = userEmail ? userEmail.charAt(0).toUpperCase() : "?";

  return (
    <>
      <style>{`

      *{
        margin:0;
        padding:0;
        box-sizing:border-box;
        font-family:'Segoe UI', Arial, sans-serif;
      }

      body{
        background:#f4f6fb;
      }

      .layout{
        display:flex;
        min-height:100vh;
      }

      /* SIDEBAR */
      .sidebar{
        width:250px;
        background:linear-gradient(180deg,#1e1b4b,#312e81);
        color:white;
        display:flex;
        flex-direction:column;
        padding:25px 18px;
        position:fixed;
        height:100vh;
      }

      .sidebar-logo{
        font-size:24px;
        font-weight:800;
        margin-bottom:35px;
        padding-left:8px;
      }

      .nav-item{
        display:flex;
        align-items:center;
        gap:12px;
        padding:12px 14px;
        border-radius:10px;
        cursor:pointer;
        color:#c7c9f7;
        font-weight:500;
        margin-bottom:4px;
        transition:.15s;
      }

      .nav-item:hover{
        background:rgba(255,255,255,.08);
        color:white;
      }

      .nav-item.active{
        background:#4f46e5;
        color:white;
      }

      .nav-icon{
        font-size:18px;
        width:22px;
        text-align:center;
      }

      .sidebar-bottom{
        margin-top:auto;
      }

      .logout-btn{
        display:flex;
        align-items:center;
        gap:12px;
        padding:12px 14px;
        border-radius:10px;
        cursor:pointer;
        color:#fca5a5;
        font-weight:600;
        background:rgba(239,68,68,.12);
      }

      .logout-btn:hover{
        background:rgba(239,68,68,.22);
      }

      /* MAIN AREA */
      .main{
        margin-left:250px;
        flex:1;
        padding:30px 40px;
      }

      .topbar{
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:30px;
      }

      .page-heading h1{
        font-size:26px;
        color:#111827;
      }

      .page-heading p{
        color:#6b7280;
        margin-top:4px;
        font-size:14px;
      }

      .topbar-right{
        display:flex;
        align-items:center;
        gap:18px;
      }

      .bell{
        font-size:20px;
        cursor:pointer;
      }

      .avatar{
        width:38px;
        height:38px;
        border-radius:50%;
        background:#4f46e5;
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:700;
      }

      .user-chip{
        display:flex;
        align-items:center;
        gap:10px;
        background:white;
        padding:6px 14px 6px 6px;
        border-radius:30px;
        box-shadow:0 1px 4px rgba(0,0,0,.08);
      }

      .user-chip-text{
        display:flex;
        flex-direction:column;
        line-height:1.2;
      }

      .user-chip-email{
        font-size:13px;
        font-weight:600;
        color:#111827;
      }

      .user-chip-role{
        font-size:11px;
        color:#6b7280;
        text-transform:capitalize;
      }

      `}</style>

      <div className="layout">

        <div className="sidebar">

          <div className="sidebar-logo">DecisionHub</div>

          <div>
            {navItems.map((item) => (
              <div
                key={item.route}
                className={
                  "nav-item" +
                  (location.pathname === item.route ? " active" : "")
                }
                onClick={() => navigate(item.route)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          <div className="sidebar-bottom">
            <div className="logout-btn" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              Logout
            </div>
          </div>

        </div>

        <div className="main">

          <div className="topbar">

            <div className="page-heading">
              <h1>{pageTitle}</h1>
              {pageSubtitle && <p>{pageSubtitle}</p>}
            </div>

            <div className="topbar-right">

              <div className="bell">🔔</div>

              <div className="user-chip">
                <div className="avatar">{initials}</div>
                <div className="user-chip-text">
                  <span className="user-chip-email">
                    {userEmail || "Guest"}
                  </span>
                  <span className="user-chip-role">{role.toLowerCase()}</span>
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