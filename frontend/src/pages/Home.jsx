import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function Home() {
  const navigate = useNavigate();

  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  /* =========================================================
     FETCH PROFILE
  ========================================================= */

  useEffect(() => {
    fetchDecisions();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setProfile(null);
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        setProfile(null);
        return;
      }

      const data = await response.json();

      setProfile(data);
    } catch (error) {
      console.error(error);
      setProfile(null);
    }
  };

  /* =========================================================
     FETCH DECISIONS
  ========================================================= */

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please login to continue.");
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/decisions/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load decisions");
      }

      const data = await response.json();

      setDecisions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load your decisions right now."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     QUICK ACTIONS
  ========================================================= */

  const quickActions = [
    {
      title: "Create Decision",
      description: "Start a new decision board",
      icon: "➕",
      color: "#6d3dcc",
      route: "/create-decision",
    },
    {
      title: "My Decisions",
      description: "View and manage your boards",
      icon: "📊",
      color: "#2563eb",
      route: "/decisions",
    },
    {
      title: "Active Polls",
      description: "See polls you can vote on",
      icon: "🗳",
      color: "#7c3aed",
      route: "/polls",
    },
    {
      title: "Communities",
      description: "Join and collaborate with others",
      icon: "👥",
      color: "#be3c88",
      route: "/communities",
    },
    {
      title: "Analytics",
      description: "Track decision trends",
      icon: "📈",
      color: "#168653",
      route: "/analytics",
    },
    {
      title: "Profile",
      description: "Manage your account",
      icon: "👤",
      color: "#b7791f",
      route: "/profile",
    },
  ];

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalDecisions = decisions.length;

  const publicDecisions = decisions.filter(
    (decision) =>
      decision.visibility === "PUBLIC"
  ).length;

  const privateDecisions = decisions.filter(
    (decision) =>
      decision.visibility === "PRIVATE"
  ).length;

  const stats = [
    {
      label: "Total Decisions",
      value: totalDecisions,
      icon: "🧭",
    },
    {
      label: "Public Boards",
      value: publicDecisions,
      icon: "🌐",
    },
    {
      label: "Private Boards",
      value: privateDecisions,
      icon: "🔒",
    },
    {
      label: "Communities Joined",
      value: profile?.joinedCommunities ?? 0,
      icon: "👥",
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <DashboardLayout
      pageTitle="Welcome Back 👋"
      pageSubtitle="Create polls, compare ideas and make smarter decisions together."
    >
      <style>{`

        /* =====================================================
           HOME PAGE
        ===================================================== */

        .home-page {
          width: 100%;
          min-width: 0;
          padding-bottom: 40px;

          color: var(--app-text);
        }

        /* =====================================================
           STATISTICS
        ===================================================== */

        .home-stats {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 15px;
        }

        .home-stat {
          position: relative;

          display: flex;
          align-items: center;

          gap: 14px;

          min-width: 0;

          padding: 20px;

          overflow: hidden;

          border:
            1px solid
            var(--app-border);

          border-radius: 15px;

          background:
            var(--app-card);

          box-shadow:
            0 8px 25px
            rgba(0, 0, 0, .04);

          transition:
            transform .25s ease,
            border-color .25s ease,
            background .25s ease,
            box-shadow .25s ease;
        }

        .home-stat::after {
          content: "";

          position: absolute;

          width: 90px;
          height: 90px;

          right: -45px;
          top: -45px;

          border-radius: 50%;

          background:
            rgba(124, 58, 237, .08);

          filter: blur(12px);

          transition:
            transform .35s ease;
        }

        .home-stat:hover {
          transform:
            translateY(-3px);

          border-color:
            rgba(124, 58, 237, .35);

          box-shadow:
            0 14px 32px
            rgba(124, 58, 237, .08);
        }

        .home-stat:hover::after {
          transform:
            scale(1.5);
        }

        .home-stat-icon {
          position: relative;
          z-index: 2;

          display: flex;

          align-items: center;
          justify-content: center;

          width: 46px;
          height: 46px;

          flex-shrink: 0;

          border:
            1px solid
            var(--app-border);

          border-radius: 11px;

          background:
            var(--app-card-2);

          font-size: 20px;

          transition:
            transform .25s ease,
            border-color .25s ease,
            background .25s ease;
        }

        .home-stat:hover .home-stat-icon {
          transform:
            scale(1.06);

          border-color:
            rgba(124, 58, 237, .30);
        }

        .home-stat-content {
          position: relative;
          z-index: 2;

          min-width: 0;
        }

        .home-stat-value {
          color:
            var(--app-text);

          font-size: 25px;

          font-weight: 750;

          line-height: 1.1;
        }

        .home-stat-label {
          margin-top: 5px;

          color:
            var(--app-secondary-text);

          font-size: 11px;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }

        /* =====================================================
           SECTION HEADER
        ===================================================== */

        .home-section {
          margin-top: 36px;
        }

        .home-section-header {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-bottom: 15px;
        }

        .home-section-title {
          flex-shrink: 0;

          color:
            var(--app-text);

          font-size: 17px;

          font-weight: 650;
        }

        .home-section-line {
          flex: 1;

          height: 1px;

          background:
            var(--app-border);
        }

        /* =====================================================
           QUICK ACTIONS
        ===================================================== */

        .quick-actions {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 15px;
        }

        .quick-action {
          position: relative;

          min-height: 150px;

          min-width: 0;

          overflow: hidden;

          padding: 21px;

          text-align: left;

          border:
            1px solid
            var(--app-border);

          border-top:
            3px solid
            var(--action-color);

          border-radius: 15px;

          background:
            var(--app-card);

          cursor: pointer;

          box-shadow:
            0 8px 25px
            rgba(0, 0, 0, .04);

          transition:
            transform .25s ease,
            border-color .25s ease,
            background .25s ease,
            box-shadow .25s ease;
        }

        .quick-action:hover {
          transform:
            translateY(-4px);

          background:
            var(--app-card-2);

          border-color:
            var(--app-border);

          box-shadow:
            0 16px 35px
            rgba(124, 58, 237, .09);
        }

        .quick-action-glow {
          position: absolute;

          pointer-events: none;

          width: 120px;
          height: 120px;

          right: -45px;
          top: -45px;

          border-radius: 50%;

          background:
            var(--action-color);

          opacity: .08;

          filter: blur(25px);

          transition:
            transform .5s ease,
            opacity .5s ease;
        }

        .quick-action:hover
        .quick-action-glow {
          transform:
            scale(1.5);

          opacity: .14;
        }

        .quick-action-icon {
          position: relative;
          z-index: 2;

          display: flex;

          align-items: center;
          justify-content: center;

          width: 44px;
          height: 44px;

          margin-bottom: 15px;

          border-radius: 11px;

          color: white;

          background:
            var(--action-color);

          box-shadow:
            0 8px 20px
            color-mix(
              in srgb,
              var(--action-color) 25%,
              transparent
            );

          transition:
            transform .25s ease;
        }

        .quick-action:hover
        .quick-action-icon {
          transform:
            scale(1.1);
        }

        .quick-action-title {
          position: relative;
          z-index: 2;

          margin-bottom: 6px;

          color:
            var(--app-text);

          font-size: 15px;

          font-weight: 650;
        }

        .quick-action-description {
          position: relative;
          z-index: 2;

          color:
            var(--app-secondary-text);

          font-size: 12px;

          line-height: 1.6;
        }

        .quick-action-line {
          position: absolute;

          left: 0;
          bottom: 0;

          width: 0;
          height: 2px;

          background:
            var(--action-color);

          transition:
            width .3s ease;
        }

        .quick-action:hover
        .quick-action-line {
          width: 100%;
        }

        /* =====================================================
           RECENT DECISIONS
        ===================================================== */

        .recent-card {
          width: 100%;

          overflow: hidden;

          border:
            1px solid
            var(--app-border);

          border-radius: 15px;

          background:
            var(--app-card);

          box-shadow:
            0 8px 25px
            rgba(0, 0, 0, .04);
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .home-loading {
          padding: 48px 24px;

          text-align: center;
        }

        .home-spinner {
          width: 30px;
          height: 30px;

          margin:
            0 auto 12px;

          border:
            2px solid
            var(--app-border);

          border-top-color:
            var(--app-primary);

          border-radius: 50%;

          animation:
            homeSpin .8s linear infinite;
        }

        @keyframes homeSpin {
          to {
            transform:
              rotate(360deg);
          }
        }

        .home-message {
          color:
            var(--app-secondary-text);

          font-size: 12px;
        }

        /* =====================================================
           EMPTY STATE
        ===================================================== */

        .home-empty {
          padding: 50px 24px;

          text-align: center;
        }

        .home-empty-icon {
          margin-bottom: 10px;

          font-size: 32px;
        }

        .home-empty-text {
          color:
            var(--app-secondary-text);

          font-size: 12px;
        }

        /* =====================================================
           BUTTON
        ===================================================== */

        .home-button {
          margin-top: 18px;

          padding:
            9px 15px;

          border:
            1px solid
            rgba(124, 58, 237, .25);

          border-radius: 8px;

          background:
            rgba(124, 58, 237, .08);

          color:
            var(--app-primary-light);

          font-size: 11px;

          font-weight: 650;

          cursor: pointer;
        }

        .home-button:hover {
          background:
            rgba(124, 58, 237, .14);

          border-color:
            rgba(124, 58, 237, .40);
        }

        /* =====================================================
           RECENT ROW
        ===================================================== */

        .decision-row {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 18px;

          padding:
            17px 20px;

          border-bottom:
            1px solid
            var(--app-border);

          transition:
            background .2s ease;
        }

        .decision-row:last-child {
          border-bottom:
            none;
        }

        .decision-row:hover {
          background:
            var(--app-card-2);
        }

        .decision-info {
          min-width: 0;
        }

        .decision-title {
          color:
            var(--app-text);

          font-size: 13px;

          font-weight: 650;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }

        .decision-meta {
          margin-top: 5px;

          color:
            var(--app-secondary-text);

          font-size: 10px;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }

        .decision-actions {
          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 9px;

          flex-shrink: 0;
        }

        /* =====================================================
           VISIBILITY BADGES
        ===================================================== */

        .visibility-badge {
          padding:
            5px 10px;

          border-radius: 6px;

          font-size: 9px;

          font-weight: 700;

          letter-spacing: .3px;
        }

        .visibility-public {
          border:
            1px solid
            rgba(22, 163, 74, .22);

          background:
            rgba(22, 163, 74, .08);

          color:
            #15803d;
        }

        .visibility-private {
          border:
            1px solid
            rgba(220, 38, 38, .20);

          background:
            rgba(220, 38, 38, .07);

          color:
            #dc2626;
        }

        /* Dark mode badges */

        [data-theme="dark"]
        .visibility-public {
          border-color:
            #24573f;

          background:
            #10251d;

          color:
            #86efac;
        }

        [data-theme="dark"]
        .visibility-private {
          border-color:
            #66333a;

          background:
            #28191d;

          color:
            #fca5a5;
        }

        /* =====================================================
           VIEW BUTTON
        ===================================================== */

        .view-button {
          padding:
            7px 13px;

          border:
            1px solid
            rgba(124, 58, 237, .22);

          border-radius: 7px;

          background:
            rgba(124, 58, 237, .07);

          color:
            var(--app-primary-light);

          font-size: 10px;

          font-weight: 650;

          cursor: pointer;
        }

        .view-button:hover {
          background:
            rgba(124, 58, 237, .14);

          border-color:
            rgba(124, 58, 237, .40);
        }

        /* =====================================================
           LIGHT THEME POLISH
        ===================================================== */

        [data-theme="light"] .home-stat,
        [data-theme="light"] .quick-action,
        [data-theme="light"] .recent-card {
          box-shadow:
            0 8px 28px
            rgba(31, 41, 55, .055);
        }

        [data-theme="light"] .home-stat:hover,
        [data-theme="light"] .quick-action:hover {
          box-shadow:
            0 15px 35px
            rgba(109, 40, 217, .09);
        }

        [data-theme="light"] .home-button,
        [data-theme="light"] .view-button {
          background:
            #f3efff;

          border-color:
            #ddd3f7;

          color:
            #6d28d9;
        }

        [data-theme="light"] .home-button:hover,
        [data-theme="light"] .view-button:hover {
          background:
            #e9e0ff;

          border-color:
            #c9b8f1;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1150px) {

          .home-stats {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .quick-actions {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {

          .quick-actions {
            grid-template-columns:
              1fr;
          }

          .home-section {
            margin-top: 30px;
          }

          .decision-row {
            align-items:
              flex-start;

            flex-direction:
              column;

            gap: 12px;
          }

          .decision-actions {
            width: 100%;

            justify-content:
              flex-start;
          }
        }

        @media (max-width: 500px) {

          .home-stats {
            grid-template-columns:
              1fr 1fr;

            gap: 9px;
          }

          .home-stat {
            padding: 14px;

            gap: 10px;
          }

          .home-stat-icon {
            width: 36px;
            height: 36px;

            font-size: 16px;
          }

          .home-stat-value {
            font-size: 21px;
          }

          .home-stat-label {
            font-size: 9px;
          }

          .quick-action {
            min-height: 140px;

            padding: 18px;
          }
        }

      `}</style>

      <div className="home-page">

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <section className="home-stats">

          {stats.map((stat) => (

            <div
              key={stat.label}
              className="home-stat"
            >

              <div className="home-stat-icon">
                {stat.icon}
              </div>

              <div className="home-stat-content">

                <div className="home-stat-value">
                  {stat.value}
                </div>

                <div className="home-stat-label">
                  {stat.label}
                </div>

              </div>

            </div>

          ))}

        </section>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section className="home-section">

          <div className="home-section-header">

            <h2 className="home-section-title">
              Quick Actions
            </h2>

            <div className="home-section-line" />

          </div>

          <div className="quick-actions">

            {quickActions.map((action) => (

              <button
                key={action.title}
                type="button"
                onClick={() =>
                  navigate(action.route)
                }
                className="quick-action"
                style={{
                  "--action-color":
                    action.color,
                }}
              >

                <div className="quick-action-glow" />

                <div className="quick-action-icon">
                  {action.icon}
                </div>

                <h3 className="quick-action-title">
                  {action.title}
                </h3>

                <p className="quick-action-description">
                  {action.description}
                </p>

                <div className="quick-action-line" />

              </button>

            ))}

          </div>

        </section>

        {/* =====================================================
            RECENT DECISIONS
        ===================================================== */}

        <section className="home-section">

          <div className="home-section-header">

            <h2 className="home-section-title">
              Recent Decisions
            </h2>

            <div className="home-section-line" />

          </div>

          <div className="recent-card">

            {/* LOADING */}

            {loading && (

              <div className="home-loading">

                <div className="home-spinner" />

                <p className="home-message">
                  Loading your decisions...
                </p>

              </div>

            )}

            {/* ERROR */}

            {!loading && error && (

              <div className="home-loading">

                <p className="home-message">
                  {error}
                </p>

              </div>

            )}

            {/* EMPTY */}

            {!loading &&
              !error &&
              decisions.length === 0 && (

                <div className="home-empty">

                  <div className="home-empty-icon">
                    🧭
                  </div>

                  <p className="home-empty-text">
                    You haven't created any decisions yet.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/create-decision"
                      )
                    }
                    className="home-button"
                  >
                    Create Decision
                  </button>

                </div>

              )}

            {/* DECISIONS */}

            {!loading &&
              !error &&
              decisions
                .slice(0, 5)
                .map((decision) => (

                  <div
                    key={decision.id}
                    className="decision-row"
                  >

                    <div className="decision-info">

                      <h3 className="decision-title">
                        {decision.title}
                      </h3>

                      <p className="decision-meta">

                        {decision.category ||
                          "Uncategorized"}

                        {decision.deadline
                          ? ` • Deadline: ${decision.deadline}`
                          : ""}

                      </p>

                    </div>

                    <div className="decision-actions">

                      <span
                        className={`
                          visibility-badge
                          ${
                            decision.visibility ===
                            "PRIVATE"
                              ? "visibility-private"
                              : "visibility-public"
                          }
                        `}
                      >
                        {decision.visibility ||
                          "PUBLIC"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/decisions"
                          )
                        }
                        className="view-button"
                      >
                        View
                      </button>

                    </div>

                  </div>

                ))}

          </div>

        </section>

      </div>
    </DashboardLayout>
  );
}

export default Home;