import heroImage from "../assets/hero.png";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <div id="home" className="container">

      <div className="hero-text">
        <h1>Welcome to DecisionHub</h1>
        <p>Smart Decision Making Platform</p>

        <Link to="/login">
          <button>Get Started</button>
        </Link>
      </div>

      <div className="hero-image">
        <img src={heroImage} alt="DecisionHub" />
      </div>

    </div>
  );
}

export default Hero;