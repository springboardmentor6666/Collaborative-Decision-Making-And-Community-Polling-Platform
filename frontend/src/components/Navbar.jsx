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
      <h2>DecisionHub</h2>

      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/database">Database</Link></li>
        <li><a href="#about">About</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#contact">Contact</a></li>
        {token && user ? (
          <>
            <li style={{ color: "#3498db", fontWeight: "bold" }}>Hi, {user.fullName}</li>
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
