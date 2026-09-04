import { useNavigate } from "react-router-dom";
import "../styles/Hero.css";
import heroImg from "../assets/hero.png";

function Hero() {
  const navigate = useNavigate();

  const handleLearnMore = () => {
    document.getElementById("features")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section id="home" className="hero">

      <div className="hero-left">

        <h1>Make Better Decisions Together</h1>

        <p>
          Create decision boards, compare options, invite your friends
          to vote, discuss ideas, and make smarter decisions together.
        </p>

        <div className="hero-buttons">

          <button
            className="primary-btn"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>

          <button
            className="secondary-btn"
            onClick={handleLearnMore}
          >
            Learn More
          </button>

        </div>
      </div>

      <div className="hero-right">
        <img src={heroImg} alt="DecisionHub" />
      </div>

    </section>
  );
}

export default Hero;