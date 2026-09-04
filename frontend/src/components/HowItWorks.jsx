import React from "react";
import "../styles/HowItWorks.css";

function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-container">

        <h1>How It Works</h1>

        <p className="how-subtitle">
          Create, share, and make better decisions together.
        </p>

        <div className="steps-container">

          {/* Step 1 */}
          <div className="step-card">
            <div className="step-number">1</div>

            <div className="step-icon">📝</div>

            <h2>Create a Poll</h2>

            <p>
              Create your decision poll in just a few seconds.
            </p>
          </div>

          {/* Step 2 */}
          <div className="step-card">
            <div className="step-number">2</div>

            <div className="step-icon">📤</div>

            <h2>Share With Community</h2>

            <p>
              Share it with your friends or community members to vote.
            </p>
          </div>

          {/* Step 3 */}
          <div className="step-card">
            <div className="step-number">3</div>

           <div className="step-icon">📈</div>

            <h2>View Results</h2>

            <p>
              Review votes and choose the best option.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HowItWorks;