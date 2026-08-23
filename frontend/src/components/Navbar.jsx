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
      <h2><Link to={token ? "/dashboard" : "/"} style={{ textDecoration: "none", color: "inherit" }}>DecisionHub</Link></h2>

      <ul>
        <li><Link to={token ? "/dashboard" : "/"}>Home</Link></li>
        {token && (
          <>
            <li><Link to="/decisions">Decisions</Link></li>
            <li><Link to="/communities">Communities</Link></li>
          </>
        )}
        <li><Link to="/database">Database</Link></li>
        {!token && (
          <>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
          </>
        )}
        {token && user ? (
          <>
            <li style={{ fontWeight: "bold" }}>
              <Link to="/profile" style={{ color: "#ffd700" }}>Hi, {user.fullName}</Link>
            </li>
            <li>
              <button onClick={handleLogout} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0 }}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
