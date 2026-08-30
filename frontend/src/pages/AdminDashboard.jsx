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

      const response = await fetch(`${API}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const cards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers,
          icon: "👤",
          accent: "#4f46e5",
        },
        {
          label: "Total Decisions",
          value: stats.totalDecisions,
          icon: "📊",
          accent: "#8b5cf6",
        },
        {
          label: "Total Communities",
          value: stats.totalCommunities,
          icon: "👥",
          accent: "#10b981",
        },
        {
          label: "Total Votes",
          value: stats.totalVotes,
          icon: "🗳",
          accent: "#f59e0b",
        },
      ]
    : [];

  const quickActions = [
    {
      label: "Manage Users",
      description: "View, search, and remove platform users.",
      icon: "🧑‍💼",
      accent: "#4f46e5",
      to: "/admin/users",
    },
    {
      label: "Manage Decisions",
      description: "Moderate and remove decisions across the platform.",
      icon: "📊",
      accent: "#8b5cf6",
      to: "/admin/decisions",
    },
    {
      label: "Manage Communities",
      description: "Oversee community groups and their membership.",
      icon: "👥",
      accent: "#10b981",
      to: "/admin/communities",
    },
    {
      label: "View Analytics",
      description: "Track category trends and community activity.",
      icon: "📈",
      accent: "#f59e0b",
      to: "/admin/analytics",
    },
  ];

  return (
    <DashboardLayout
      pageTitle="Admin Dashboard"
      pageSubtitle="Platform-wide overview for administrators."
    >
      <style>{`
        .admin-section-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--app-secondary-text);
          margin: 0 0 14px;
        }

        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          max-width: 1180px;
          margin-bottom: 36px;
        }

        .admin-stat-card {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--app-border);
          border-radius: 18px;
          background: var(--app-card);
          padding: 24px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .admin-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 32px -12px var(--stat-accent);
          border-color: var(--stat-accent);
        }

        .admin-stat-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 3px;
          background: var(--stat-accent);
        }

        .admin-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border-radius: 13px;
          font-size: 21px;
          margin-bottom: 18px;
          background: color-mix(in srgb, var(--stat-accent) 16%, transparent);
        }

        .admin-stat-value {
          color: var(--app-text);
          font-size: 32px;
          font-weight: 800;
          line-height: 1;
        }

        .admin-stat-label {
          color: var(--app-secondary-text);
          font-size: 13.5px;
          font-weight: 500;
          margin-top: 8px;
        }

        .admin-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
          max-width: 1180px;
        }

        .admin-action-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          border: 1px solid var(--app-border);
          border-radius: 16px;
          background: var(--app-card);
          padding: 20px;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease,
            border-color 0.2s ease, background-color 0.2s ease;
        }

        .admin-action-card:hover {
          transform: translateY(-2px);
          border-color: var(--action-accent);
          box-shadow: 0 14px 28px -14px var(--action-accent);
          background: var(--app-card-2);
        }

        .admin-action-icon {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          font-size: 19px;
          background: color-mix(in srgb, var(--action-accent) 16%, transparent);
        }

        .admin-action-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: var(--app-text);
          font-size: 15px;
          font-weight: 700;
        }

        .admin-action-arrow {
          color: var(--action-accent);
          font-size: 15px;
          transition: transform 0.2s ease;
        }

        .admin-action-card:hover .admin-action-arrow {
          transform: translateX(3px);
        }

        .admin-action-desc {
          margin-top: 4px;
          color: var(--app-secondary-text);
          font-size: 13px;
          line-height: 1.5;
        }

        .admin-empty {
          color: var(--app-secondary-text);
          font-size: 13px;
        }

        .admin-error-card {
          max-width: 420px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          border-radius: 14px;
          padding: 16px 18px;
          font-size: 13.5px;
          font-weight: 600;
        }

        .admin-skeleton {
          border: 1px solid var(--app-border);
          border-radius: 18px;
          background: var(--app-card);
          height: 140px;
          position: relative;
          overflow: hidden;
        }

        .admin-skeleton::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
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
      `}</style>

      {loading && (
        <div className="admin-stats-grid">
          {[0, 1, 2, 3].map((i) => (
            <div className="admin-skeleton" key={i} />
          ))}
        </div>
      )}

      {error && <div className="admin-error-card">{error}</div>}

      {!loading && !error && (
        <>
          <div className="admin-stats-grid">
            {cards.map((card) => (
              <div
                className="admin-stat-card"
                key={card.label}
                style={{ "--stat-accent": card.accent }}
              >
                <div className="admin-stat-icon">{card.icon}</div>
                <div className="admin-stat-value">{card.value}</div>
                <div className="admin-stat-label">{card.label}</div>
              </div>
            ))}
          </div>

          <h2 className="admin-section-title">Quick Actions</h2>

          <div className="admin-actions-grid">
            {quickActions.map((action) => (
              <Link
                className="admin-action-card"
                key={action.label}
                to={action.to}
                style={{ "--action-accent": action.accent }}
              >
                <div className="admin-action-icon">{action.icon}</div>

                <div className="min-w-0">
                  <div className="admin-action-title">
                    <span>{action.label}</span>
                    <span className="admin-action-arrow">→</span>
                  </div>
                  <div className="admin-action-desc">
                    {action.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;