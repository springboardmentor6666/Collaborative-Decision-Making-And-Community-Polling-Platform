import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function Home() {

  const navigate = useNavigate();

  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/decisions", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to load");
      }

      const data = await response.json();

      setDecisions(data);

    } catch (err) {

      setError("Unable to load your decisions right now.");

    } finally {

      setLoading(false);

    }

  };

  const quickActions = [
    {
      title: "Create Decision",
      description: "Start a new decision board",
      icon: "➕",
      color: "#4f46e5",
      route: "/create-decision"
    },
    {
      title: "My Decisions",
      description: "View and manage your boards",
      icon: "📊",
      color: "#0891b2",
      route: "/decisions"
    },
    {
      title: "Active Polls",
      description: "See polls you can vote on",
      icon: "🗳",
      color: "#7c3aed",
      route: "/polls"
    },
    {
      title: "Communities",
      description: "Join and collaborate with others",
      icon: "👥",
      color: "#db2777",
      route: "/communities"
    },
    {
      title: "Analytics",
      description: "Track decision trends",
      icon: "📈",
      color: "#059669",
      route: "/analytics"
    },
    {
      title: "Profile",
      description: "Manage your account",
      icon: "👤",
      color: "#d97706",
      route: "/profile"
    }
  ];

  const totalDecisions = decisions.length;
  const publicDecisions = decisions.filter(d => d.visibility === "PUBLIC").length;
  const privateDecisions = decisions.filter(d => d.visibility === "PRIVATE").length;

  const stats = [
    { label: "Total Decisions", value: totalDecisions, icon: "🧭" },
    { label: "Public Boards", value: publicDecisions, icon: "🌐" },
    { label: "Private Boards", value: privateDecisions, icon: "🔒" },
    { label: "Communities Joined", value: 0, icon: "👥" }
  ];

  return (
    <DashboardLayout
      pageTitle="Welcome Back 👋"
      pageSubtitle="Create polls, compare ideas and make smarter decisions together."
    >
      <style>{`

        .stats-grid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
          gap:20px;
          margin-bottom:35px;
        }

        .stat-card{
          background:white;
          border-radius:16px;
          padding:22px;
          box-shadow:0 1px 4px rgba(0,0,0,.06);
          display:flex;
          align-items:center;
          gap:16px;
        }

        .stat-icon{
          width:48px;
          height:48px;
          border-radius:12px;
          background:#eef2ff;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:22px;
        }

        .stat-value{
          font-size:24px;
          font-weight:800;
          color:#111827;
        }

        .stat-label{
          font-size:13px;
          color:#6b7280;
        }

        .section-title{
          font-size:18px;
          font-weight:700;
          color:#111827;
          margin-bottom:16px;
        }

        .actions-grid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:20px;
          margin-bottom:40px;
        }

        .action-card{
          background:white;
          border-radius:16px;
          padding:24px;
          cursor:pointer;
          box-shadow:0 1px 4px rgba(0,0,0,.06);
          transition:.2s;
          border-top:4px solid transparent;
        }

        .action-card:hover{
          transform:translateY(-4px);
          box-shadow:0 8px 20px rgba(0,0,0,.1);
        }

        .action-icon{
          width:46px;
          height:46px;
          border-radius:12px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:22px;
          color:white;
          margin-bottom:16px;
        }

        .action-card h3{
          font-size:17px;
          color:#111827;
          margin-bottom:6px;
        }

        .action-card p{
          font-size:13px;
          color:#6b7280;
        }

        .recent-list{
          background:white;
          border-radius:16px;
          box-shadow:0 1px 4px rgba(0,0,0,.06);
          overflow:hidden;
        }

        .recent-row{
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:18px 22px;
          border-bottom:1px solid #f1f2f6;
        }

        .recent-row:last-child{
          border-bottom:none;
        }

        .recent-title{
          font-weight:600;
          color:#111827;
        }

        .recent-meta{
          font-size:12px;
          color:#6b7280;
          margin-top:3px;
        }

        .badge{
          padding:5px 12px;
          border-radius:20px;
          font-size:12px;
          font-weight:700;
        }

        .badge-public{
          background:#dcfce7;
          color:#15803d;
        }

        .badge-private{
          background:#fee2e2;
          color:#b91c1c;
        }

        .view-btn{
          background:#eef2ff;
          color:#4338ca;
          border:none;
          padding:8px 16px;
          border-radius:8px;
          font-weight:600;
          cursor:pointer;
          font-size:13px;
        }

        .empty-state{
          padding:40px;
          text-align:center;
          color:#6b7280;
        }

      `}</style>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{stat.icon}</div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title">Quick Actions</div>

      <div className="actions-grid">
        {quickActions.map((action, i) => (
          <div
            className="action-card"
            key={i}
            style={{ borderTopColor: action.color }}
            onClick={() => navigate(action.route)}
          >
            <div className="action-icon" style={{ background: action.color }}>
              {action.icon}
            </div>
            <h3>{action.title}</h3>
            <p>{action.description}</p>
          </div>
        ))}
      </div>

      <div className="section-title">Recent Decisions</div>

      <div className="recent-list">

        {loading && (
          <div className="empty-state">Loading your decisions...</div>
        )}

        {!loading && error && (
          <div className="empty-state">{error}</div>
        )}

        {!loading && !error && decisions.length === 0 && (
          <div className="empty-state">
            You haven't created any decisions yet. Click "Create Decision" to get started.
          </div>
        )}

        {!loading && !error && decisions.slice(0, 5).map((decision) => (
          <div className="recent-row" key={decision.id}>

            <div>
              <div className="recent-title">{decision.title}</div>
              <div className="recent-meta">
                {decision.category || "Uncategorized"}
                {decision.deadline ? ` • Deadline: ${decision.deadline}` : ""}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span
                className={
                  "badge " +
                  (decision.visibility === "PRIVATE" ? "badge-private" : "badge-public")
                }
              >
                {decision.visibility || "PUBLIC"}
              </span>

              <button
                className="view-btn"
                onClick={() => navigate("/decisions")}
              >
                View
              </button>
            </div>

          </div>
        ))}

      </div>

    </DashboardLayout>
  );
}

export default Home;