import React from "react";
import "../styles/Features.css";

function Features() {
  return (
    <section id="features" className="features-section">
      <div className="features-container">

        <h1>Why Choose DecisionHub?</h1>

        <p className="features-subtitle">
          Everything you need to make better decisions together.
        </p>
        <div className="features-cards">

          {/* Card 1 */}
          <div className="feature-card">
            <div className="feature-icon">🗳️</div>

            <h2>Smart Poll Creation</h2>

            <p>
              Create polls, compare different options and let everyone vote easily.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div className="feature-icon">👥</div>

            <h2>Community Collaboration</h2>

            <p>
              Invite friends or communities to participate and  collect opinions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div className="feature-icon">📊</div>

            <h2>Real-Time Insights</h2>

            <p>
              See voting results instantly in real time and make better decision.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Features;