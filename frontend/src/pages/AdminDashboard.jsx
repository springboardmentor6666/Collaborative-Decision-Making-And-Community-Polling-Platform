import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

const API = "http://localhost:8080";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API}/api/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load admin dashboard.");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     STAT CARDS
  ===================================================== */

  const cards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers,
          icon: "👤",
          accent: "#8b5cf6",
          description: "Registered platform users",
        },
        {
          label: "Total Decisions",
          value: stats.totalDecisions,
          icon: "📊",
          accent: "#a855f7",
          description: "Community decisions created",
        },
        {
          label: "Total Communities",
          value: stats.totalCommunities,
          icon: "👥",
          accent: "#c084fc",
          description: "Active community groups",
        },
        {
          label: "Total Votes",
          value: stats.totalVotes,
          icon: "🗳️",
          accent: "#7c3aed",
          description: "Votes submitted by users",
        },
      ]
    : [];

  /* =====================================================
     QUICK ACTIONS
  ===================================================== */

  const quickActions = [
    {
      label: "Manage Users",
      description:
        "View, search, promote or remove platform users.",
      icon: "👤",
      accent: "#8b5cf6",
      to: "/admin/users",
    },
    {
      label: "Manage Decisions",
      description:
        "Review and moderate decisions across the platform.",
      icon: "📊",
      accent: "#a855f7",
      to: "/admin/decisions",
    },
    {
      label: "Manage Communities",
      description:
        "Oversee community groups and their membership.",
      icon: "👥",
      accent: "#c084fc",
      to: "/admin/communities",
    },
    {
      label: "View Analytics",
      description:
        "Explore trends, activity and platform insights.",
      icon: "📈",
      accent: "#7c3aed",
      to: "/admin/analytics",
    },
  ];

  return (
    <DashboardLayout
      pageTitle="Admin Dashboard"
      pageSubtitle="Platform-wide overview for administrators."
    >
      <style>{`
        /* =====================================================
           PAGE
        ===================================================== */

        .admin-dashboard {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          box-sizing: border-box;
          padding-bottom: 10px;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .admin-hero {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 22px;
          padding: 26px;
          margin-bottom: 28px;

          background:
            radial-gradient(
              circle at 85% 20%,
              rgba(139, 92, 246, 0.22),
              transparent 32%
            ),
            radial-gradient(
              circle at 10% 100%,
              rgba(168, 85, 247, 0.13),
              transparent 30%
            ),
            var(--app-card);

          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .admin-hero::before {
          content: "";
          position: absolute;
          width: 190px;
          height: 190px;
          right: -75px;
          top: -95px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.14);
          filter: blur(6px);
          pointer-events: none;
        }

        .admin-hero::after {
          content: "";
          position: absolute;
          width: 80px;
          height: 80px;
          left: 25%;
          bottom: -55px;
          border-radius: 50%;
          background: rgba(168, 85, 247, 0.09);
          filter: blur(10px);
          pointer-events: none;
        }

        .admin-hero-content {
          position: relative;
          z-index: 1;

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .admin-hero-left {
          min-width: 0;
        }

        .admin-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 9px;

          color: #a78bfa;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .admin-status-dot {
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #8b5cf6;

          box-shadow:
            0 0 8px rgba(139, 92, 246, 0.8),
            0 0 18px rgba(139, 92, 246, 0.35);
        }

        .admin-hero-title {
          margin: 0;

          color: var(--app-text);
          font-size: clamp(23px, 4vw, 32px);
          line-height: 1.15;
          font-weight: 850;
          letter-spacing: -0.035em;
        }

        .admin-hero-description {
          max-width: 650px;
          margin: 9px 0 0;

          color: var(--app-secondary-text);
          font-size: 13px;
          line-height: 1.65;
        }

        .admin-hero-badge {
          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          width: 72px;
          height: 72px;

          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 19px;

          background:
            linear-gradient(
              145deg,
              rgba(139, 92, 246, 0.22),
              rgba(168, 85, 247, 0.06)
            );

          color: #c4b5fd;
          font-size: 31px;

          box-shadow:
            0 0 30px rgba(139, 92, 246, 0.13),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        /* =====================================================
           SECTION HEADER
        ===================================================== */

        .admin-section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 15px;
        }

        .admin-section-label {
          color: #a78bfa;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .admin-section-title {
          margin: 0;
          color: var(--app-text);
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .admin-section-subtitle {
          margin: 4px 0 0;
          color: var(--app-secondary-text);
          font-size: 11px;
        }

        /* =====================================================
           STATS GRID
        ===================================================== */

        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 34px;
        }

        .admin-stat-card {
          position: relative;
          overflow: hidden;
          min-width: 0;

          border: 1px solid var(--app-border);
          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              var(--app-card),
              var(--app-card-2)
            );

          padding: 20px;

          box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.025);

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .admin-stat-card::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 2px;

          background: var(--stat-accent);
          box-shadow: 0 0 14px var(--stat-accent);
        }

        .admin-stat-card::after {
          content: "";
          position: absolute;

          width: 105px;
          height: 105px;

          right: -52px;
          bottom: -57px;

          border-radius: 50%;
          background: var(--stat-accent);
          opacity: 0.07;
          filter: blur(4px);

          pointer-events: none;
        }

        .admin-stat-card:hover {
          transform: translateY(-4px);

          border-color: var(--stat-accent);

          box-shadow:
            0 18px 40px -18px var(--stat-accent),
            0 0 25px rgba(139, 92, 246, 0.06);
        }

        .admin-stat-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .admin-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 45px;
          height: 45px;
          flex-shrink: 0;

          border: 1px solid
            color-mix(
              in srgb,
              var(--stat-accent) 28%,
              transparent
            );

          border-radius: 13px;

          background:
            color-mix(
              in srgb,
              var(--stat-accent) 13%,
              transparent
            );

          font-size: 20px;
        }

        .admin-stat-mini {
          color: var(--stat-accent);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .admin-stat-value {
          margin-top: 20px;

          color: var(--app-text);
          font-size: clamp(26px, 3vw, 34px);
          font-weight: 850;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .admin-stat-label {
          margin-top: 8px;

          color: var(--app-text);
          font-size: 13px;
          font-weight: 700;
        }

        .admin-stat-description {
          margin-top: 4px;

          color: var(--app-secondary-text);
          font-size: 10px;
          line-height: 1.4;
        }

        /* =====================================================
           QUICK ACTIONS
        ===================================================== */

        .admin-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 26px;
        }

        .admin-action-card {
          position: relative;

          display: flex;
          align-items: center;
          gap: 15px;

          min-width: 0;
          overflow: hidden;

          border: 1px solid var(--app-border);
          border-radius: 17px;

          background: var(--app-card);
          padding: 17px;

          text-decoration: none;

          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .admin-action-card::before {
          content: "";

          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;

          width: 2px;

          background: var(--action-accent);
          opacity: 0;

          transition: opacity 0.25s ease;
        }

        .admin-action-card::after {
          content: "";

          position: absolute;
          width: 100px;
          height: 100px;

          right: -60px;
          top: -60px;

          border-radius: 50%;

          background: var(--action-accent);
          opacity: 0.035;

          filter: blur(6px);
          pointer-events: none;
        }

        .admin-action-card:hover {
          transform: translateY(-3px);

          border-color:
            color-mix(
              in srgb,
              var(--action-accent) 55%,
              var(--app-border)
            );

          background: var(--app-card-2);

          box-shadow:
            0 16px 35px -20px var(--action-accent),
            0 0 20px rgba(139, 92, 246, 0.05);
        }

        .admin-action-card:hover::before {
          opacity: 1;
        }

        .admin-action-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 46px;
          height: 46px;
          flex-shrink: 0;

          border: 1px solid
            color-mix(
              in srgb,
              var(--action-accent) 25%,
              transparent
            );

          border-radius: 13px;

          background:
            color-mix(
              in srgb,
              var(--action-accent) 12%,
              transparent
            );

          font-size: 20px;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .admin-action-card:hover .admin-action-icon {
          transform: scale(1.05);

          box-shadow:
            0 0 20px
              color-mix(
                in srgb,
                var(--action-accent) 20%,
                transparent
              );
        }

        .admin-action-content {
          min-width: 0;
          flex: 1;
        }

        .admin-action-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;

          color: var(--app-text);
          font-size: 14px;
          font-weight: 750;
        }

        .admin-action-arrow {
          flex-shrink: 0;

          color: var(--action-accent);
          font-size: 17px;

          transition: transform 0.25s ease;
        }

        .admin-action-card:hover .admin-action-arrow {
          transform: translateX(4px);
        }

        .admin-action-desc {
          margin-top: 4px;

          color: var(--app-secondary-text);
          font-size: 11px;
          line-height: 1.5;
        }

        /* =====================================================
           SYSTEM STATUS
        ===================================================== */

        .admin-system-status {
          display: flex;
          align-items: center;
          gap: 8px;

          width: fit-content;

          border: 1px solid rgba(139, 92, 246, 0.18);
          border-radius: 999px;

          background: rgba(139, 92, 246, 0.05);

          padding: 7px 11px;

          color: var(--app-secondary-text);
          font-size: 10px;
          font-weight: 600;
        }

        .admin-system-status-dot {
          width: 6px;
          height: 6px;
          flex-shrink: 0;

          border-radius: 50%;

          background: #8b5cf6;

          box-shadow:
            0 0 8px rgba(139, 92, 246, 0.8);
        }

        /* =====================================================
           COPYRIGHT
        ===================================================== */

        .admin-copyright {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          gap: 7px;

          margin-top: 42px;
          padding: 20px 10px 8px;

          border-top: 1px solid var(--app-border);

          color: var(--app-secondary-text);

          font-size: 9px;
          line-height: 1.5;

          text-align: center;
        }

        .admin-copyright-brand {
          color: #a78bfa;
          font-weight: 750;
          transition: color 0.2s ease;
        }

        .admin-copyright-dot {
          width: 4px;
          height: 4px;
          flex-shrink: 0;

          border-radius: 50%;

          background: #8b5cf6;

          box-shadow:
            0 0 8px rgba(139, 92, 246, 0.75);
        }

        .admin-copyright:hover .admin-copyright-brand {
          color: #c084fc;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .admin-error-card {
          max-width: 500px;

          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 15px;

          background: rgba(239, 68, 68, 0.08);

          padding: 16px 18px;

          color: #ef4444;
          font-size: 13px;
          font-weight: 600;
        }

        /* =====================================================
           SKELETON
        ===================================================== */

        .admin-skeleton {
          position: relative;

          height: 160px;

          overflow: hidden;

          border: 1px solid var(--app-border);
          border-radius: 18px;

          background: var(--app-card);
        }

        .admin-skeleton::after {
          content: "";

          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              90deg,
              transparent,
              var(--app-card-2),
              transparent
            );

          transform: translateX(-100%);
          animation: admin-shimmer 1.4s infinite;
        }

        @keyframes admin-shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 950px) {
          .admin-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-actions-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 650px) {
          .admin-dashboard {
            max-width: 100%;
          }

          .admin-hero {
            padding: 18px;
            border-radius: 18px;
            margin-bottom: 23px;
          }

          .admin-hero-content {
            align-items: flex-start;
          }

          .admin-eyebrow {
            font-size: 9px;
          }

          .admin-hero-title {
            font-size: 23px;
          }

          .admin-hero-description {
            font-size: 12px;
            line-height: 1.55;
          }

          .admin-hero-badge {
            width: 51px;
            height: 51px;

            border-radius: 14px;

            font-size: 22px;
          }

          .admin-section-header {
            margin-bottom: 12px;
          }

          .admin-section-label {
            font-size: 9px;
          }

          .admin-section-title {
            font-size: 14px;
          }

          .admin-section-subtitle {
            font-size: 10px;
          }

          .admin-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));

            gap: 10px;
            margin-bottom: 27px;
          }

          .admin-stat-card {
            padding: 15px;
            border-radius: 15px;
          }

          .admin-stat-icon {
            width: 38px;
            height: 38px;

            border-radius: 11px;

            font-size: 17px;
          }

          .admin-stat-mini {
            display: none;
          }

          .admin-stat-value {
            margin-top: 16px;
            font-size: 26px;
          }

          .admin-stat-label {
            font-size: 11px;
          }

          .admin-stat-description {
            font-size: 9px;
          }

          .admin-actions-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .admin-action-card {
            padding: 14px;
            border-radius: 14px;
          }

          .admin-action-icon {
            width: 40px;
            height: 40px;

            border-radius: 11px;

            font-size: 18px;
          }

          .admin-action-title {
            font-size: 13px;
          }

          .admin-action-desc {
            font-size: 10px;
          }

          .admin-system-status {
            margin-top: 18px;
            font-size: 9px;
          }

          .admin-copyright {
            margin-top: 31px;
            padding-top: 17px;

            font-size: 8px;
            gap: 5px;
          }
        }

        /* =====================================================
           VERY SMALL PHONES
        ===================================================== */

        @media (max-width: 380px) {
          .admin-hero {
            padding: 15px;
          }

          .admin-hero-badge {
            display: none;
          }

          .admin-stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .admin-stat-card {
            padding: 13px;
          }

          .admin-stat-value {
            font-size: 23px;
          }

          .admin-stat-label {
            font-size: 10px;
          }

          .admin-stat-description {
            font-size: 8px;
          }

          .admin-action-card {
            gap: 11px;
          }
        }
      `}</style>

      <div className="admin-dashboard">

        {/* =====================================================
            FUTURISTIC HERO
        ===================================================== */}

        <section className="admin-hero">
          <div className="admin-hero-content">

            <div className="admin-hero-left">

              <div className="admin-eyebrow">
                <span className="admin-status-dot" />
                Admin Control Center
              </div>

              <h1 className="admin-hero-title">
                Platform Overview
              </h1>

              <p className="admin-hero-description">
                Monitor your community platform, manage users
                and decisions, and keep track of platform
                activity from one place.
              </p>

            </div>

            <div className="admin-hero-badge">
              ⚡
            </div>

          </div>
        </section>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <>
            <div className="admin-section-header">
              <div>
                <div className="admin-section-label">
                  Loading
                </div>

                <h2 className="admin-section-title">
                  Platform Metrics
                </h2>

                <p className="admin-section-subtitle">
                  Fetching the latest platform statistics...
                </p>
              </div>
            </div>

            <div className="admin-stats-grid">
              {[0, 1, 2, 3].map((i) => (
                <div
                  className="admin-skeleton"
                  key={i}
                />
              ))}
            </div>
          </>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="admin-error-card">
            {error}
          </div>
        )}

        {/* =====================================================
            DASHBOARD CONTENT
        ===================================================== */}

        {!loading && !error && (
          <>

            {/* =================================================
                METRICS
            ================================================= */}

            <div className="admin-section-header">
              <div>

                <div className="admin-section-label">
                  Live Metrics
                </div>

                <h2 className="admin-section-title">
                  Platform Statistics
                </h2>

                <p className="admin-section-subtitle">
                  Current platform-wide totals
                </p>

              </div>
            </div>

            <div className="admin-stats-grid">

              {cards.map((card) => (
                <div
                  className="admin-stat-card"
                  key={card.label}
                  style={{
                    "--stat-accent": card.accent,
                  }}
                >

                  <div className="admin-stat-top">

                    <div className="admin-stat-icon">
                      {card.icon}
                    </div>

                    <span className="admin-stat-mini">
                      Live
                    </span>

                  </div>

                  <div className="admin-stat-value">
                    {card.value}
                  </div>

                  <div className="admin-stat-label">
                    {card.label}
                  </div>

                  <div className="admin-stat-description">
                    {card.description}
                  </div>

                </div>
              ))}

            </div>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div className="admin-section-header">
              <div>

                <div className="admin-section-label">
                  Control Center
                </div>

                <h2 className="admin-section-title">
                  Quick Actions
                </h2>

                <p className="admin-section-subtitle">
                  Manage important areas of your platform
                </p>

              </div>
            </div>

            <div className="admin-actions-grid">

              {quickActions.map((action) => (
                <Link
                  className="admin-action-card"
                  key={action.label}
                  to={action.to}
                  style={{
                    "--action-accent": action.accent,
                  }}
                >

                  <div className="admin-action-icon">
                    {action.icon}
                  </div>

                  <div className="admin-action-content">

                    <div className="admin-action-title">

                      <span>
                        {action.label}
                      </span>

                      <span className="admin-action-arrow">
                        →
                      </span>

                    </div>

                    <div className="admin-action-desc">
                      {action.description}
                    </div>

                  </div>

                </Link>
              ))}

            </div>

            {/* =================================================
                SYSTEM STATUS
            ================================================= */}

            <div className="admin-system-status">
              <span className="admin-system-status-dot" />
              Admin dashboard connected
            </div>

          </>
        )}

        {/* =====================================================
            COPYRIGHT
        ===================================================== */}

        <footer className="admin-copyright">
          <span>© 2026</span>

          <span className="admin-copyright-brand">
            Collaborative Decision Making
          </span>

          <span className="admin-copyright-dot" />

          <span>
            Community Polling Platform
          </span>

          <span>
            • All Rights Reserved
          </span>
        </footer>

      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;