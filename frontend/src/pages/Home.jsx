import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function Home() {

  const navigate = useNavigate();

  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);


  useEffect(() => {
    fetchDecisions();
    fetch("http://localhost:8080/api/users/profile", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then(response => response.ok ? response.json() : null).then(setProfile).catch(() => setProfile(null));
  }, []);


  const fetchDecisions = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/decisions",
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );


      if (!response.ok) {
        throw new Error("Failed to load");
      }


      const data = await response.json();

      setDecisions(data);


    } catch (err) {

      setError(
        "Unable to load your decisions right now."
      );


    } finally {

      setLoading(false);

    }

  };


  /* =========================
     QUICK ACTIONS
  ========================= */

  const quickActions = [

    {
      title: "Create Decision",
      description: "Start a new decision board",
      icon: "➕",
      color: "#6d3dcc",
      route: "/create-decision"
    },

    {
      title: "My Decisions",
      description: "View and manage your boards",
      icon: "📊",
      color: "#2563eb",
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
      color: "#be3c88",
      route: "/communities"
    },

    {
      title: "Analytics",
      description: "Track decision trends",
      icon: "📈",
      color: "#168653",
      route: "/analytics"
    },

    {
      title: "Profile",
      description: "Manage your account",
      icon: "👤",
      color: "#b7791f",
      route: "/profile"
    }

  ];


  /* =========================
     STATISTICS
  ========================= */

  const totalDecisions =
    decisions.length;


  const publicDecisions =
    decisions.filter(
      d => d.visibility === "PUBLIC"
    ).length;


  const privateDecisions =
    decisions.filter(
      d => d.visibility === "PRIVATE"
    ).length;


  const stats = [

    {
      label: "Total Decisions",
      value: totalDecisions,
      icon: "🧭"
    },

    {
      label: "Public Boards",
      value: publicDecisions,
      icon: "🌐"
    },

    {
      label: "Private Boards",
      value: privateDecisions,
      icon: "🔒"
    },

    {
      label: "Communities Joined",
      value: profile?.joinedCommunities ?? 0,
      icon: "👥"
    }

  ];


  return (

    <DashboardLayout
      pageTitle="Welcome Back 👋"
      pageSubtitle="Create polls, compare ideas and make smarter decisions together."
    >

      <style>{`

        /* =========================
           HOME PAGE
        ========================= */

        .home-page {

          width: 100%;

          min-height:
            calc(100vh - 100px);

          padding:
            5px 0 40px;

          color: #f8fafc;
        }


        /* =========================
           STATISTICS
        ========================= */

        .stats-grid {

          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 18px;

          margin-bottom: 35px;
        }


        .stat-card {

          display: flex;

          align-items: center;

          gap: 14px;

          min-width: 0;

          padding: 20px;

          background: #15121f;

          border:
            1px solid #2d2840;

          border-radius: 14px;

          transition:
            border-color 0.2s ease,
            transform 0.2s ease;
        }


        .stat-card:hover {

          border-color:
            #4c3a70;

          transform:
            translateY(-2px);
        }


        .stat-icon {

          width: 46px;

          height: 46px;

          min-width: 46px;

          border-radius: 11px;

          background: #211a32;

          border:
            1px solid #3b2c5c;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 20px;
        }


        .stat-value {

          font-size: 24px;

          font-weight: 700;

          color: #f8fafc;

          line-height: 1.2;
        }


        .stat-label {

          font-size: 12px;

          color: #918a9f;

          margin-top: 4px;

          white-space: nowrap;
        }


        /* =========================
           SECTION TITLE
        ========================= */

        .section-title {

          font-size: 17px;

          font-weight: 600;

          color: #eee9f7;

          margin-bottom: 15px;
        }


        /* =========================
           QUICK ACTIONS
        ========================= */

        .actions-grid {

          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 18px;

          margin-bottom: 38px;
        }


        .action-card {

          position: relative;

          min-width: 0;

          background: #15121f;

          border:
            1px solid #2d2840;

          border-top:
            3px solid transparent;

          border-radius: 14px;

          padding: 21px;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }


        .action-card:hover {

          transform:
            translateY(-3px);

          background: #181521;

          border-color:
            #403651;
        }


        .action-icon {

          width: 44px;

          height: 44px;

          border-radius: 10px;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 20px;

          color: white;

          margin-bottom: 15px;
        }


        .action-card h3 {

          font-size: 16px;

          font-weight: 600;

          color: #f3f0f7;

          margin-bottom: 6px;
        }


        .action-card p {

          font-size: 13px;

          color: #918a9f;

          line-height: 1.5;
        }


        /* =========================
           RECENT DECISIONS
        ========================= */

        .recent-list {

          width: 100%;

          background: #15121f;

          border:
            1px solid #2d2840;

          border-radius: 14px;

          overflow: hidden;
        }


        .recent-row {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          padding:
            17px 20px;

          border-bottom:
            1px solid #282334;
        }


        .recent-row:last-child {

          border-bottom: none;
        }


        .recent-row:hover {

          background:
            rgba(255, 255, 255, 0.015);
        }


        .recent-info {

          min-width: 0;
        }


        .recent-title {

          font-weight: 600;

          color: #eeeaf5;

          font-size: 14px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }


        .recent-meta {

          font-size: 12px;

          color: #898192;

          margin-top: 4px;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }


        /* =========================
           RIGHT SIDE
        ========================= */

        .recent-actions {

          display: flex;

          align-items: center;

          gap: 12px;

          flex-shrink: 0;
        }


        /* =========================
           BADGES
        ========================= */

        .badge {

          padding:
            5px 10px;

          border-radius: 6px;

          font-size: 11px;

          font-weight: 600;
        }


        .badge-public {

          background:
            #10251d;

          color:
            #86efac;

          border:
            1px solid #235c43;
        }


        .badge-private {

          background:
            #28191d;

          color:
            #fca5a5;

          border:
            1px solid #66333a;
        }


        /* =========================
           VIEW BUTTON
        ========================= */

        .view-btn {

          background:
            #211a32;

          color:
            #c4b5fd;

          border:
            1px solid #493773;

          padding:
            7px 14px;

          border-radius: 7px;

          font-weight: 600;

          cursor: pointer;

          font-size: 12px;

          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }


        .view-btn:hover {

          background:
            #2a2140;

          border-color:
            #6749a1;
        }


        /* =========================
           EMPTY STATE
        ========================= */

        .empty-state {

          padding:
            40px 25px;

          text-align: center;

          color: #898192;

          font-size: 13px;
        }


        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 1100px) {

          .stats-grid {

            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }


          .actions-grid {

            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

        }


        @media (max-width: 700px) {

          .stats-grid {

            grid-template-columns:
              1fr;
          }


          .actions-grid {

            grid-template-columns:
              1fr;
          }


          .recent-row {

            align-items:
              flex-start;

            flex-direction:
              column;
          }


          .recent-actions {

            width: 100%;

            justify-content:
              space-between;
          }

        }


        @media (max-width: 450px) {

          .stat-card {

            padding: 16px;
          }


          .action-card {

            padding: 18px;
          }

        }

      `}</style>


      <div className="home-page">


        {/* =========================
            STATISTICS
        ========================= */}

        <div className="stats-grid">

          {stats.map((stat, i) => (

            <div
              className="stat-card"
              key={i}
            >

              <div className="stat-icon">
                {stat.icon}
              </div>


              <div>

                <div className="stat-value">
                  {stat.value}
                </div>

                <div className="stat-label">
                  {stat.label}
                </div>

              </div>

            </div>

          ))}

        </div>


        {/* =========================
            QUICK ACTIONS
        ========================= */}

        <div className="section-title">
          Quick Actions
        </div>


        <div className="actions-grid">

          {quickActions.map((action, i) => (

            <div
              className="action-card"
              key={i}

              style={{
                borderTopColor:
                  action.color
              }}

              onClick={() =>
                navigate(action.route)
              }
            >

              <div
                className="action-icon"

                style={{
                  background:
                    action.color
                }}
              >
                {action.icon}
              </div>


              <h3>
                {action.title}
              </h3>


              <p>
                {action.description}
              </p>

            </div>

          ))}

        </div>


        {/* =========================
            RECENT DECISIONS
        ========================= */}

        <div className="section-title">
          Recent Decisions
        </div>


        <div className="recent-list">


          {/* LOADING */}

          {loading && (

            <div className="empty-state">
              Loading your decisions...
            </div>

          )}


          {/* ERROR */}

          {!loading && error && (

            <div className="empty-state">
              {error}
            </div>

          )}


          {/* NO DECISIONS */}

          {!loading &&
            !error &&
            decisions.length === 0 && (

              <div className="empty-state">

                You haven't created any decisions yet.
                Click "Create Decision" to get started.

              </div>

            )}


          {/* DECISIONS */}

          {!loading &&
            !error &&
            decisions
              .slice(0, 5)
              .map((decision) => (

                <div
                  className="recent-row"
                  key={decision.id}
                >


                  <div className="recent-info">

                    <div className="recent-title">
                      {decision.title}
                    </div>


                    <div className="recent-meta">

                      {decision.category ||
                        "Uncategorized"}

                      {decision.deadline
                        ? ` • Deadline: ${decision.deadline}`
                        : ""}

                    </div>

                  </div>


                  <div className="recent-actions">


                    <span
                      className={
                        "badge " +
                        (
                          decision.visibility === "PRIVATE"
                            ? "badge-private"
                            : "badge-public"
                        )
                      }
                    >
                      {decision.visibility ||
                        "PUBLIC"}
                    </span>


                    <button
                      className="view-btn"

                      onClick={() =>
                        navigate("/decisions")
                      }
                    >
                      View
                    </button>


                  </div>

                </div>

              ))}


        </div>

      </div>

    </DashboardLayout>
  );
}

export default Home;
