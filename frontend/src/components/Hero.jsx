import { Link } from "react-router-dom";

function Hero() {
  return (
    <section id="home" className="container">

      <div className="hero-text">

        <span className="tag">🚀 Smart Community Platform</span>

        <h1>
          Smart Decisions,
          <br />
          Better Communities
        </h1>
        Create polls • Vote securely • Make smarter decisions

        <p>
          DecisionHub is an online polling and voting platform that helps
          communities, colleges and teams create polls, collect votes and
          make transparent decisions in real time.
        </p>

        <div className="hero-buttons">
          <Link to="/register">
            <button className="primary-btn">
              Get Started
            </button>
          </Link>

          <Link to="/about">
            <button className="secondary-btn">
              Learn More
            </button>
          </Link>
        </div>

        <div className="hero-stats">

          <div>
            <h3>🗳️ 500+</h3>
            <p>Votes</p>
          </div>

          <div>
            <h3>📊 120+</h3>
            <p>Polls</p>
          </div>

          <div>
            <h3>⭐ 95%</h3>
            <p>Satisfaction</p>
          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;