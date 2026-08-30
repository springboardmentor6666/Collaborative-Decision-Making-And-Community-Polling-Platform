import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

const API = "http://localhost:8080";

function AdminAnalytics() {
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [communityActivity, setCommunityActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`${API}/api/admin/analytics`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load analytics.");
      }

      const data = await response.json();
      setCategoryBreakdown(data.categoryBreakdown || {});
      setCommunityActivity(data.communityActivity || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  const categoryEntries = Object.entries(categoryBreakdown).sort(
    (a, b) => b[1] - a[1]
  );
  const maxCategoryCount = Math.max(1, ...categoryEntries.map((e) => e[1]));
  const maxMembers = Math.max(1, ...communityActivity.map((c) => c.members));

  return (
    <DashboardLayout
      pageTitle="Analytics"
      pageSubtitle="Category popularity and community activity across the platform."
    >
      <style>{`
        .admin-analytics-page { max-width: 900px; }
        .admin-back-link {
          display: inline-block;
          color: #8b5cf6;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          margin-bottom: 16px;
        }
        .admin-chart-card {
          border: 1px solid var(--app-border);
          border-radius: 14px;
          background: var(--app-card);
          padding: 22px;
          margin-bottom: 24px;
        }
        .admin-chart-title {
          color: var(--app-text);
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 18px;
        }
        .admin-bar-row {
          margin-bottom: 14px;
        }
        .admin-bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--app-text);
          margin-bottom: 5px;
        }
        .admin-bar-track {
          height: 8px;
          border-radius: 6px;
          background: var(--app-card-2);
          overflow: hidden;
        }
        .admin-bar-fill {
          height: 100%;
          border-radius: 6px;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
        }
        .admin-empty {
          color: var(--app-secondary-text);
          font-size: 13px;
        }
      `}</style>

      <div className="admin-analytics-page">
        <Link className="admin-back-link" to="/admin">
          ← Back to Admin Dashboard
        </Link>

        {loading && <div className="admin-empty">Loading analytics…</div>}
        {error && <div className="admin-empty">{error}</div>}

        {!loading && !error && (
          <>
            <div className="admin-chart-card">
              <div className="admin-chart-title">Popular Categories</div>

              {categoryEntries.length === 0 && (
                <div className="admin-empty">No decisions yet.</div>
              )}

              {categoryEntries.map(([category, count]) => (
                <div className="admin-bar-row" key={category}>
                  <div className="admin-bar-label">
                    <span>{category}</span>
                    <span>{count}</span>
                  </div>
                  <div className="admin-bar-track">
                    <div
                      className="admin-bar-fill"
                      style={{
                        width: `${(count / maxCategoryCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-chart-card">
              <div className="admin-chart-title">
                Most Active Communities (by members)
              </div>

              {communityActivity.length === 0 && (
                <div className="admin-empty">No communities yet.</div>
              )}

              {communityActivity.map((community) => (
                <div className="admin-bar-row" key={community.name}>
                  <div className="admin-bar-label">
                    <span>{community.name}</span>
                    <span>{community.members}</span>
                  </div>
                  <div className="admin-bar-track">
                    <div
                      className="admin-bar-fill"
                      style={{
                        width: `${(community.members / maxMembers) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminAnalytics;