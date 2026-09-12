import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  let user = null;

  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch (e) {
      // Ignore
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: "none" }}>
        <h2>⚡ DecisionHub</h2>
      </Link>

      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/decisions">Decisions</Link></li>
        <li><Link to="/communities">Communities</Link></li>
        <li><Link to="/analytics">Analytics</Link></li>
        <li><Link to="/database">Database</Link></li>

        {token && user ? (
          <div className="nav-user">
            <Link to="/profile" className="user-badge">
              👤 {user.username || user.fullName || "User"}
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li>
              <Link to="/register">
                <button className="primary-btn" style={{ padding: "6px 16px", fontSize: "14px" }}>
                  Get Started
                </button>
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
