import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Dashboard() {
  const [summary, setSummary] = useState({
    users: 0,
    decisions: 0,
    options: 0,
    votes: 0,
    communities: 0
  });
  const [recentDecisions, setRecentDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch dashboard summary data
    fetch("/api/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.summary) {
          setSummary(data.summary);
        }
        if (data.decisions) {
          setRecentDecisions(data.decisions.slice(0, 3));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading dashboard data:", err);
        setLoading(false);
      });
  }, [token, navigate]);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <header className="dashboard-header animate-fade-in">
          <h1>Welcome to DecisionHub Workspace</h1>
          <p>Harness the power of collective intelligence to make smarter, collaborative decisions.</p>
        </header>

        <section className="dashboard-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{summary.decisions}</h3>
              <p>Decision Boards</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🗳️</div>
            <div className="stat-info">
              <h3>{summary.votes}</h3>
              <p>Votes Cast</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{summary.communities}</h3>
              <p>Active Communities</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-info">
              <h3>{summary.users}</h3>
              <p>Platform Users</p>
            </div>
          </div>
        </section>

        <section className="dashboard-quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-flex">
            <Link to="/decisions" className="action-btn-card">
              <span className="action-icon">➕</span>
              <div>
                <h4>Explore Decisions</h4>
                <p>Create boards or compare options</p>
              </div>
            </Link>
            <Link to="/communities" className="action-btn-card">
              <span className="action-icon">💬</span>
              <div>
                <h4>Communities</h4>
                <p>Join category-based discussion groups</p>
              </div>
            </Link>
            <Link to="/profile" className="action-btn-card">
              <span className="action-icon">⚙️</span>
              <div>
                <h4>My Profile</h4>
                <p>Manage interests and settings</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="dashboard-main-content">
          <div className="recent-decisions-panel">
            <div className="panel-header">
              <h2>Recent Decisions</h2>
              <Link to="/decisions" className="view-all-link">View All Decisions →</Link>
            </div>
            {loading ? (
              <p>Loading recent decisions...</p>
            ) : recentDecisions.length > 0 ? (
              <div className="decisions-list">
                {recentDecisions.map((decision) => (
                  <div key={decision.id} className="decision-card">
                    <span className={`category-tag ${decision.category?.toLowerCase() || 'general'}`}>
                      {decision.category || "General"}
                    </span>
                    <h3>{decision.title}</h3>
                    <p>{decision.description || "No description provided."}</p>
                    <div className="decision-card-footer">
                      <span className="creator-info">By {decision.userfullname || decision.username || "User"}</span>
                      <Link to={`/decisions/${decision.id}`} className="compare-btn">
                        Compare & Vote
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No decision boards created yet. Start the first one today!</p>
                <Link to="/decisions" className="primary-btn">Create Decision Board</Link>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default Dashboard;
