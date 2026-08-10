import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import bg1 from "../assets/bg1.png";
import bg2 from "../assets/bg2.png";
import bg3 from "../assets/bg1.png";
import bg4 from "../assets/bg2.png";

function LandingPage() {
  const backgrounds = [bg1, bg2, bg3, bg4];

  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: #05030a;
          color: white;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        a {
          text-decoration: none;
        }

        button {
          font-family: inherit;
        }

        /* =========================
           MAIN
        ========================= */

        .landing {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 20% 20%,
              rgba(124, 58, 237, 0.12),
              transparent 30%
            ),
            radial-gradient(
              circle at 80% 50%,
              rgba(168, 85, 247, 0.08),
              transparent 30%
            ),
            #05030a;
          overflow: hidden;
        }

        /* =========================
           NAVBAR
        ========================= */

        .navbar {
          position: fixed;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 1250px;
          height: 70px;

          padding: 0 25px;

          display: flex;
          justify-content: space-between;
          align-items: center;

          background: rgba(15, 10, 25, 0.62);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);

          border-radius: 20px;

          box-shadow:
            0 15px 50px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);

          z-index: 1000;
        }

        .logo {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 25px;
          font-weight: 700;
          letter-spacing: -1px;

          background: linear-gradient(
            90deg,
            #ffffff,
            #c084fc,
            #8b5cf6
          );

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;

          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;

          background: #a855f7;

          box-shadow:
            0 0 10px #a855f7,
            0 0 25px rgba(168, 85, 247, 0.8);
        }

        .nav-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-btn,
        .register-btn {
          padding: 11px 23px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .login-btn {
          color: #e9d5ff;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .login-btn:hover {
          background: rgba(168, 85, 247, 0.12);
          border-color: rgba(168, 85, 247, 0.5);
          box-shadow: 0 0 25px rgba(168, 85, 247, 0.15);
        }

        .register-btn {
          border: none;
          color: white;

          background: linear-gradient(
            135deg,
            #7c3aed,
            #a855f7
          );

          box-shadow:
            0 0 20px rgba(139, 92, 246, 0.25);
        }

        .register-btn:hover {
          transform: translateY(-2px);

          box-shadow:
            0 0 25px rgba(168, 85, 247, 0.5),
            0 10px 30px rgba(0, 0, 0, 0.3);
        }

        /* =========================
           HERO
        ========================= */

        .hero {
          min-height: 100vh;
          position: relative;

          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          text-align: center;

          padding: 150px 8% 100px;

          background-size: cover;
          background-position: center;

          transition:
            background-image 1.8s ease-in-out;

          overflow: hidden;
        }

        /* Dark overlay */

        .hero::before {
          content: "";
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              180deg,
              rgba(5, 3, 10, 0.72),
              rgba(5, 3, 10, 0.55),
              rgba(5, 3, 10, 0.92)
            );

          z-index: 0;
        }

        /* Purple glow */

        .hero::after {
          content: "";
          position: absolute;

          width: 650px;
          height: 650px;

          border-radius: 50%;

          background: rgba(139, 92, 246, 0.18);

          filter: blur(100px);

          top: 5%;
          left: 50%;

          transform: translateX(-50%);

          z-index: 0;
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 2;

          max-width: 950px;
        }

        /* =========================
           HERO BADGE
        ========================= */

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;

          padding: 9px 16px;

          border-radius: 50px;

          background: rgba(168, 85, 247, 0.09);
          border: 1px solid rgba(192, 132, 252, 0.25);

          backdrop-filter: blur(15px);

          color: #d8b4fe;

          font-size: 13px;
          font-weight: 500;

          margin-bottom: 28px;

          box-shadow:
            0 0 25px rgba(168, 85, 247, 0.08);
        }

        .badge-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #c084fc;

          box-shadow:
            0 0 10px #c084fc;
        }

        /* =========================
           HERO TITLE
        ========================= */

        .hero h1 {
          font-family: 'Space Grotesk', sans-serif;

          font-size: clamp(48px, 7vw, 88px);

          line-height: 1.02;

          letter-spacing: -4px;

          font-weight: 700;

          color: white;

          margin-bottom: 28px;
        }

        .hero h1 span {
          background: linear-gradient(
            90deg,
            #ffffff 0%,
            #d8b4fe 35%,
            #a855f7 70%,
            #7c3aed 100%
          );

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;

          text-shadow:
            0 0 50px rgba(168, 85, 247, 0.18);
        }

        .hero p {
          max-width: 720px;

          margin: auto;

          color: #c4b5fd;

          font-size: 18px;

          line-height: 1.8;

          font-weight: 400;
        }

        /* =========================
           HERO BUTTONS
        ========================= */

        .hero-buttons {
          margin-top: 42px;

          display: flex;
          justify-content: center;

          gap: 15px;
        }

        .primary-btn,
        .secondary-btn {
          padding: 15px 28px;

          border-radius: 13px;

          font-size: 15px;

          font-weight: 600;

          cursor: pointer;

          transition: all 0.35s ease;
        }

        .primary-btn {
          color: white;

          border: 1px solid rgba(255, 255, 255, 0.12);

          background:
            linear-gradient(
              135deg,
              #7c3aed,
              #a855f7
            );

          box-shadow:
            0 0 30px rgba(139, 92, 246, 0.3);
        }

        .primary-btn:hover {
          transform: translateY(-4px) scale(1.02);

          box-shadow:
            0 0 40px rgba(168, 85, 247, 0.5),
            0 15px 35px rgba(0, 0, 0, 0.3);
        }

        .secondary-btn {
          color: #e9d5ff;

          background: rgba(255, 255, 255, 0.04);

          border: 1px solid rgba(255, 255, 255, 0.15);

          backdrop-filter: blur(15px);
        }

        .secondary-btn:hover {
          transform: translateY(-4px);

          background: rgba(168, 85, 247, 0.1);

          border-color: rgba(192, 132, 252, 0.45);

          box-shadow:
            0 0 30px rgba(168, 85, 247, 0.15);
        }

        /* =========================
           FLOATING ORBS
        ========================= */

        .orb {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;

          z-index: 1;

          filter: blur(1px);

          animation: float 7s ease-in-out infinite;
        }

        .orb-1 {
          width: 90px;
          height: 90px;

          top: 25%;
          left: 8%;

          background: rgba(139, 92, 246, 0.12);

          border: 1px solid rgba(192, 132, 252, 0.15);

          box-shadow:
            0 0 50px rgba(139, 92, 246, 0.2);
        }

        .orb-2 {
          width: 55px;
          height: 55px;

          bottom: 22%;
          right: 12%;

          background: rgba(168, 85, 247, 0.1);

          border: 1px solid rgba(216, 180, 254, 0.15);

          animation-delay: 2s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-25px);
          }
        }

        /* =========================
           SECTION
        ========================= */

        .section {
          position: relative;

          padding: 120px 8%;

          background: #05030a;
        }

        .section-header {
          text-align: center;

          max-width: 700px;

          margin: 0 auto 65px;
        }

        .section-label {
          color: #a855f7;

          text-transform: uppercase;

          letter-spacing: 3px;

          font-size: 11px;

          font-weight: 700;

          margin-bottom: 15px;
        }

        .section-header h2 {
          font-family: 'Space Grotesk', sans-serif;

          font-size: clamp(36px, 5vw, 54px);

          letter-spacing: -2px;

          margin-bottom: 18px;
        }

        .section-header p {
          color: #8f86a8;

          line-height: 1.7;

          font-size: 16px;
        }

        /* =========================
           FEATURE CARDS
        ========================= */

        .features {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 22px;

          max-width: 1250px;

          margin: auto;
        }

        .card {
          position: relative;

          padding: 35px;

          min-height: 290px;

          border-radius: 24px;

          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.075),
              rgba(255, 255, 255, 0.025)
            );

          border: 1px solid rgba(255, 255, 255, 0.1);

          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);

          overflow: hidden;

          transition:
            transform 0.4s ease,
            border-color 0.4s ease,
            box-shadow 0.4s ease;
        }

        .card::before {
          content: "";

          position: absolute;

          width: 180px;
          height: 180px;

          top: -80px;
          right: -60px;

          border-radius: 50%;

          background: rgba(168, 85, 247, 0.13);

          filter: blur(40px);

          transition: 0.4s;
        }

        .card:hover {
          transform: translateY(-10px);

          border-color: rgba(192, 132, 252, 0.3);

          box-shadow:
            0 25px 60px rgba(0, 0, 0, 0.4),
            0 0 35px rgba(139, 92, 246, 0.08);
        }

        .card:hover::before {
          background: rgba(168, 85, 247, 0.25);
        }

        .card-icon {
          width: 58px;
          height: 58px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 16px;

          font-size: 25px;

          background:
            linear-gradient(
              135deg,
              rgba(168, 85, 247, 0.2),
              rgba(124, 58, 237, 0.08)
            );

          border: 1px solid rgba(192, 132, 252, 0.2);

          box-shadow:
            0 0 25px rgba(139, 92, 246, 0.1);

          margin-bottom: 28px;
        }

        .card h3 {
          font-family: 'Space Grotesk', sans-serif;

          font-size: 23px;

          margin-bottom: 12px;
        }

        .card p {
          color: #9990b3;

          line-height: 1.7;

          font-size: 14px;
        }

        .card-link {
          display: inline-flex;

          margin-top: 22px;

          color: #c084fc;

          font-size: 13px;

          font-weight: 600;
        }

        /* =========================
           COLLABORATION SECTION
        ========================= */

        .collaboration {
          position: relative;

          padding: 120px 8%;

          background:
            radial-gradient(
              circle at 50% 50%,
              rgba(124, 58, 237, 0.12),
              transparent 40%
            ),
            #08050f;
        }

        .collab-container {
          max-width: 1200px;

          margin: auto;

          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 70px;

          align-items: center;
        }

        .collab-text h2 {
          font-family: 'Space Grotesk', sans-serif;

          font-size: clamp(36px, 5vw, 58px);

          line-height: 1.1;

          letter-spacing: -2px;

          margin-bottom: 25px;
        }

        .collab-text h2 span {
          color: #a855f7;
        }

        .collab-text p {
          color: #9c93b0;

          line-height: 1.8;

          margin-bottom: 30px;
        }

        .collab-list {
          display: flex;

          flex-direction: column;

          gap: 15px;
        }

        .collab-item {
          display: flex;

          align-items: center;

          gap: 14px;

          color: #ddd6fe;

          font-size: 14px;
        }

        .check {
          width: 25px;
          height: 25px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          color: #c084fc;

          background: rgba(168, 85, 247, 0.12);

          border: 1px solid rgba(192, 132, 252, 0.2);

          font-size: 12px;
        }

        /* =========================
           GLASS DASHBOARD MOCKUP
        ========================= */

        .dashboard-preview {
          position: relative;

          min-height: 400px;

          padding: 25px;

          border-radius: 28px;

          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.09),
              rgba(255, 255, 255, 0.025)
            );

          border: 1px solid rgba(255, 255, 255, 0.12);

          backdrop-filter: blur(25px);

          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.45),
            0 0 60px rgba(139, 92, 246, 0.08);

          overflow: hidden;
        }

        .dashboard-top {
          display: flex;

          align-items: center;

          justify-content: space-between;

          padding-bottom: 20px;

          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .dashboard-title {
          font-size: 14px;

          font-weight: 600;

          color: #ddd6fe;
        }

        .online {
          display: flex;

          align-items: center;

          gap: 6px;

          font-size: 11px;

          color: #a7f3d0;
        }

        .online-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #34d399;

          box-shadow: 0 0 10px #34d399;
        }

        .poll {
          margin-top: 25px;

          padding: 22px;

          border-radius: 18px;

          background: rgba(255, 255, 255, 0.035);

          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        .poll h4 {
          font-size: 15px;

          color: white;

          margin-bottom: 18px;
        }

        .poll-option {
          display: flex;

          justify-content: space-between;

          align-items: center;

          padding: 13px;

          margin-top: 10px;

          border-radius: 11px;

          background: rgba(168, 85, 247, 0.06);

          border: 1px solid rgba(168, 85, 247, 0.12);

          color: #b8adc9;

          font-size: 12px;
        }

        .poll-bar {
          width: 80px;

          height: 5px;

          border-radius: 10px;

          background: rgba(255, 255, 255, 0.08);

          overflow: hidden;
        }

        .poll-progress {
          height: 100%;

          border-radius: 10px;

          background:
            linear-gradient(
              90deg,
              #7c3aed,
              #c084fc
            );
        }

        /* =========================
           STEPS
        ========================= */

        .steps {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 20px;

          max-width: 1150px;

          margin: auto;
        }

        .step {
          text-align: center;

          padding: 35px 20px;

          border-radius: 20px;

          background: rgba(255, 255, 255, 0.025);

          border: 1px solid rgba(255, 255, 255, 0.07);

          transition: 0.3s;
        }

        .step:hover {
          background: rgba(168, 85, 247, 0.06);

          border-color: rgba(168, 85, 247, 0.25);

          transform: translateY(-6px);
        }

        .step-number {
          width: 50px;
          height: 50px;

          margin: 0 auto 20px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 15px;

          background:
            linear-gradient(
              135deg,
              #7c3aed,
              #a855f7
            );

          box-shadow:
            0 0 25px rgba(139, 92, 246, 0.25);

          font-weight: 700;
        }

        .step h3 {
          font-family: 'Space Grotesk', sans-serif;

          font-size: 16px;

          margin-bottom: 10px;
        }

        .step p {
          color: #817890;

          font-size: 13px;

          line-height: 1.6;
        }

        /* =========================
           CTA
        ========================= */

        .cta {
          position: relative;

          margin: 40px 8% 80px;

          padding: 90px 30px;

          text-align: center;

          border-radius: 30px;

          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(168, 85, 247, 0.25),
              transparent 45%
            ),
            linear-gradient(
              145deg,
              rgba(124, 58, 237, 0.14),
              rgba(255, 255, 255, 0.025)
            );

          border: 1px solid rgba(192, 132, 252, 0.18);

          backdrop-filter: blur(25px);

          overflow: hidden;
        }

        .cta::before {
          content: "";

          position: absolute;

          width: 300px;
          height: 300px;

          border-radius: 50%;

          background: rgba(139, 92, 246, 0.15);

          filter: blur(80px);

          left: 50%;
          top: 0;

          transform: translateX(-50%);
        }

        .cta-content {
          position: relative;

          z-index: 2;
        }

        .cta h2 {
          font-family: 'Space Grotesk', sans-serif;

          font-size: clamp(35px, 5vw, 52px);

          letter-spacing: -2px;

          margin-bottom: 18px;
        }

        .cta p {
          color: #a8a0b7;

          margin-bottom: 30px;
        }

        /* =========================
           FOOTER
        ========================= */

        footer {
          padding: 30px 8%;

          display: flex;

          justify-content: space-between;

          align-items: center;

          border-top: 1px solid rgba(255, 255, 255, 0.06);

          color: #625b70;

          font-size: 12px;
        }

        .footer-logo {
          color: #a78bfa;

          font-family: 'Space Grotesk', sans-serif;

          font-weight: 600;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 950px) {
          .features {
            grid-template-columns: 1fr;
          }

          .collab-container {
            grid-template-columns: 1fr;
          }

          .steps {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 650px) {
          .navbar {
            width: 94%;
            height: 64px;
            padding: 0 16px;
          }

          .logo {
            font-size: 20px;
          }

          .login-btn,
          .register-btn {
            padding: 9px 14px;
            font-size: 12px;
          }

          .hero {
            padding: 130px 6% 80px;
          }

          .hero h1 {
            letter-spacing: -2px;
          }

          .hero p {
            font-size: 15px;
          }

          .hero-buttons {
            flex-direction: column;
            width: 100%;
            max-width: 300px;
            margin-left: auto;
            margin-right: auto;
          }

          .section,
          .collaboration {
            padding: 80px 6%;
          }

          .steps {
            grid-template-columns: 1fr;
          }

          .cta {
            margin: 20px 5% 60px;
            padding: 70px 20px;
          }

          footer {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }
      `}</style>

      <div className="landing">

        {/* ================= NAVBAR ================= */}

        <nav className="navbar">

          <div className="logo">
            <span className="logo-dot"></span>
            DecisionHub
          </div>

          <div className="nav-buttons">

            <Link to="/login">
              <button className="login-btn">
                Login
              </button>
            </Link>

            <Link to="/signup">
              <button className="register-btn">
                Get Started
              </button>
            </Link>

          </div>

        </nav>


        {/* ================= HERO ================= */}

        <section
          className="hero"
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(5,3,10,0.55),
                rgba(5,3,10,0.55)
              ),
              url(${backgrounds[currentBg]})
            `,
          }}
        >

          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>

          <div className="hero-content">

            <div className="hero-badge">
              <span className="badge-dot"></span>
              Collaborative Decision Making Platform
            </div>

            <h1>
              Make Decisions.
              <br />
              <span>Together.</span>
            </h1>

            <p>
              Bring people together, create meaningful polls,
              collect opinions, collaborate with your community,
              and turn collective ideas into smarter decisions.
            </p>

            <div className="hero-buttons">

              <Link to="/signup">
                <button className="primary-btn">
                  Start Collaborating →
                </button>
              </Link>

              <Link to="/login">
                <button className="secondary-btn">
                  Explore DecisionHub
                </button>
              </Link>

            </div>

          </div>

        </section>


        {/* ================= FEATURES ================= */}

        <section className="section">

          <div className="section-header">

            <div className="section-label">
              Powerful Collaboration
            </div>

            <h2>
              Everything you need
              <br />
              to decide together.
            </h2>

            <p>
              DecisionHub makes group decision-making simple,
              transparent, and engaging.
            </p>

          </div>


          <div className="features">

            <div className="card">

              <div className="card-icon">
                🗳️
              </div>

              <h3>
                Smart Polls
              </h3>

              <p>
                Create engaging polls and gather opinions
                from your team, friends, or community in seconds.
              </p>

              <div className="card-link">
                Create → 
              </div>

            </div>


            <div className="card">

              <div className="card-icon">
                👥
              </div>

              <h3>
                Collaborate
              </h3>

              <p>
                Bring everyone into the conversation and
                make decisions based on collective opinions.
              </p>

              <div className="card-link">
                Collaborate →
              </div>

            </div>


            <div className="card">

              <div className="card-icon">
                📊
              </div>

              <h3>
                Powerful Analytics
              </h3>

              <p>
                Visualize voting patterns and understand
                what your community really thinks.
              </p>

              <div className="card-link">
                Analyze →
              </div>

            </div>

          </div>

        </section>


        {/* ================= COLLABORATION ================= */}

        <section className="collaboration">

          <div className="collab-container">

            <div className="collab-text">

              <div className="section-label">
                Collaboration First
              </div>

              <h2>
                Great decisions
                <br />
                happen <span>together.</span>
              </h2>

              <p>
                Stop making decisions in isolation. DecisionHub
                gives your community a single space where everyone
                can share opinions, vote, discuss ideas, and
                understand the final outcome.
              </p>

              <div className="collab-list">

                <div className="collab-item">
                  <span className="check">✓</span>
                  Real-time community participation
                </div>

                <div className="collab-item">
                  <span className="check">✓</span>
                  Transparent voting
                </div>

                <div className="collab-item">
                  <span className="check">✓</span>
                  Data-driven decisions
                </div>

                <div className="collab-item">
                  <span className="check">✓</span>
                  Interactive analytics
                </div>

              </div>

            </div>


            {/* Dashboard Glass Mockup */}

            <div className="dashboard-preview">

              <div className="dashboard-top">

                <div className="dashboard-title">
                  Community Poll
                </div>

                <div className="online">
                  <span className="online-dot"></span>
                  24 people voting
                </div>

              </div>


              <div className="poll">

                <h4>
                  Where should we host our next event?
                </h4>

                <div className="poll-option">
                  <span>Tech Hub</span>

                  <div className="poll-bar">
                    <div
                      className="poll-progress"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                </div>


                <div className="poll-option">
                  <span>City Center</span>

                  <div className="poll-bar">
                    <div
                      className="poll-progress"
                      style={{ width: "56%" }}
                    ></div>
                  </div>
                </div>


                <div className="poll-option">
                  <span>University</span>

                  <div className="poll-bar">
                    <div
                      className="poll-progress"
                      style={{ width: "42%" }}
                    ></div>
                  </div>
                </div>


                <div className="poll-option">
                  <span>Online</span>

                  <div className="poll-bar">
                    <div
                      className="poll-progress"
                      style={{ width: "28%" }}
                    ></div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================= HOW IT WORKS ================= */}

        <section className="section">

          <div className="section-header">

            <div className="section-label">
              Simple Process
            </div>

            <h2>
              Decide together.
              <br />
              In four simple steps.
            </h2>

          </div>


          <div className="steps">

            <div className="step">

              <div className="step-number">
                01
              </div>

              <h3>
                Create
              </h3>

              <p>
                Create a question or poll
                around your decision.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                02
              </div>

              <h3>
                Share
              </h3>

              <p>
                Invite your friends,
                team, or community.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                03
              </div>

              <h3>
                Collaborate
              </h3>

              <p>
                Let everyone participate
                and share their opinions.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                04
              </div>

              <h3>
                Decide
              </h3>

              <p>
                Analyze the results and
                make the smarter choice.
              </p>

            </div>

          </div>

        </section>


        {/* ================= CTA ================= */}

        <section className="cta">

          <div className="cta-content">

            <h2>
              Your next decision
              <br />
              starts here.
            </h2>

            <p>
              Bring your people together and make better decisions.
            </p>

            <Link to="/signup">

              <button className="primary-btn">
                Create Free Account →
              </button>

            </Link>

          </div>

        </section>


        {/* ================= FOOTER ================= */}

        <footer>

          <div className="footer-logo">
            DecisionHub
          </div>

          <div>
            © 2026 DecisionHub • All Rights Reserved
          </div>

        </footer>

      </div>
    </>
  );
}

export default LandingPage;
