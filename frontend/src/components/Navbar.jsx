import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        DecisionHub
      </div>

<a href="#home">Home</a>
<a href="#features">Features</a>
<a href="#how-it-works">How It Works</a>
<Link
  to="/login"
  onClick={() => window.scrollTo(0, 0)}
>
  Community
</Link>
<a href="#contact">Contact</a>

      <Link to="/register" className="nav-btn">
  Get Started
</Link>
    </nav>
  );
}

export default Navbar;