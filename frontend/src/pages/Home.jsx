import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import waveIcon from "../assets/wave-icon.png";

const API = "http://localhost:8080";

function Home() {
  const navigate = useNavigate();

  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  /* =========================================================
     FETCH DATA
  ========================================================= */

  useEffect(() => {
    fetchDecisions();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setProfile(null);
        return;
      }

      const response = await fetch(
        `${API}/api/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        setProfile(null);
        return;
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error(error);
      setProfile(null);
    }
  };

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please login to continue.");
        return;
      }

      const response = await fetch(
        `${API}/api/decisions/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load decisions");
      }

      const data = await response.json();

      setDecisions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load your decisions right now."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     QUICK ACTIONS
  ========================================================= */

  const quickActions = [
    {
      title: "Create Decision",
      description: "Start a new decision board",
      icon: "＋",
      color: "#8b5cf6",
      route: "/create-decision",
      tag: "CREATE",
    },
    {
      title: "My Decisions",
      description: "View and manage your boards",
      icon: "◈",
      color: "#a855f7",
      route: "/decisions",
      tag: "MANAGE",
    },
    {
      title: "Active Polls",
      description: "See polls you can vote on",
      icon: "◉",
      color: "#c084fc",
      route: "/polls",
      tag: "VOTE",
    },
    {
      title: "Communities",
      description: "Join and collaborate with others",
      icon: "♧",
      color: "#7c3aed",
      route: "/communities",
      tag: "CONNECT",
    },
    {
      title: "Analytics",
      description: "Track decision trends",
      icon: "⌁",
      color: "#a78bfa",
      route: "/analytics",
      tag: "INSIGHTS",
    },
    {
      title: "Profile",
      description: "Manage your account",
      icon: "◯",
      color: "#8b5cf6",
      route: "/profile",
      tag: "ACCOUNT",
    },
  ];

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalDecisions = decisions.length;

  const publicDecisions = decisions.filter(
    (decision) =>
      decision.visibility === "PUBLIC"
  ).length;

  const privateDecisions = decisions.filter(
    (decision) =>
      decision.visibility === "PRIVATE"
  ).length;

  const stats = [
    {
      label: "Total Decisions",
      value: totalDecisions,
      icon: "◇",
      accent: "#8b5cf6",
      description: "Decision boards",
    },
    {
      label: "Public Boards",
      value: publicDecisions,
      icon: "◎",
      accent: "#a855f7",
      description: "Open to communities",
    },
    {
      label: "Private Boards",
      value: privateDecisions,
      icon: "◆",
      accent: "#c084fc",
      description: "Private decisions",
    },
    {
      label: "Communities Joined",
      value: profile?.joinedCommunities ?? 0,
      icon: "♧",
      accent: "#7c3aed",
      description: "Your communities",
    },
  ];

  return (
    <DashboardLayout
  pageTitle={
    <>
      Welcome Back{" "}
      <img
        src={waveIcon}
        alt=""
        aria-hidden="true"
        className="inline-block h-8 w-8 object-contain align-middle"
      />
    </>
  }
  pageSubtitle="Create polls, compare ideas and make smarter decisions together."
>
      <style>{`

        /* =====================================================
           MAIN PAGE
        ===================================================== */

        .home-page {
          width: 100%;
          min-width: 0;
          max-width: 1250px;
          margin: 0 auto;
          padding-bottom: 10px;
          color: var(--app-text);
        }

        /* =====================================================
           HERO
        ===================================================== */

        .home-hero {
          position: relative;
          overflow: hidden;
          min-height: 190px;
          margin-bottom: 25px;
          padding: 28px 30px;
          border: 1px solid rgba(139, 92, 246, 0.24);
          border-radius: 22px;

          background:
            radial-gradient(
              circle at 90% 15%,
              rgba(139, 92, 246, 0.23),
              transparent 30%
            ),
            radial-gradient(
              circle at 10% 100%,
              rgba(168, 85, 247, 0.12),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              var(--app-card),
              var(--app-card-2)
            );

          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.07),
            inset 0 1px 0 rgba(255,255,255,.04);
        }

        .home-hero::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -80px;
          top: -110px;
          border-radius: 50%;
          background: rgba(139,92,246,.13);
          filter: blur(8px);
        }

        .home-hero::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 42%;
          height: 2px;
          background:
            linear-gradient(
              90deg,
              transparent,
              #8b5cf6,
              #c084fc,
              transparent
            );
          box-shadow:
            0 0 15px rgba(139,92,246,.65);
        }

        .home-hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
        }

        .home-hero-text {
          min-width: 0;
        }

        .home-hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 9px;

          color: #a78bfa;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .hero-live-dot {
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #8b5cf6;

          box-shadow:
            0 0 7px rgba(139,92,246,.9),
            0 0 18px rgba(139,92,246,.5);
        }

        .home-hero-title {
          margin: 0;

          font-size: clamp(
            25px,
            4vw,
            35px
          );

          line-height: 1.15;
          font-weight: 850;
          letter-spacing: -.04em;

          background:
            linear-gradient(
              90deg,
              var(--app-text),
              #a78bfa,
              #c084fc
            );

          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .home-hero-description {
          max-width: 650px;
          margin: 10px 0 0;

          color: var(--app-secondary-text);
          font-size: 13px;
          line-height: 1.65;
        }

        .home-hero-orb {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;

          width: 82px;
          height: 82px;
          flex-shrink: 0;

          border: 1px solid rgba(139,92,246,.3);
          border-radius: 23px;

          background:
            linear-gradient(
              145deg,
              rgba(139,92,246,.2),
              rgba(168,85,247,.05)
            );

          color: #c4b5fd;
          font-size: 34px;

          box-shadow:
            0 0 35px rgba(139,92,246,.12),
            inset 0 1px 0 rgba(255,255,255,.06);
        }

        .home-hero-orb::before {
          content: "";
          position: absolute;
          inset: 7px;
          border: 1px solid rgba(192,132,252,.18);
          border-radius: 17px;
        }

        /* =====================================================
           SECTION HEADER
        ===================================================== */

        .home-section {
          margin-top: 34px;
        }

        .home-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .home-section-title {
          flex-shrink: 0;
          margin: 0;

          color: var(--app-text);
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -.02em;
        }

        .home-section-line {
          flex: 1;
          height: 1px;
          background: var(--app-border);
        }

        .home-section-label {
          flex-shrink: 0;

          color: #a78bfa;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        /* =====================================================
           STATISTICS
        ===================================================== */

        .home-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0,1fr));
          gap: 15px;
        }

        .home-stat {
          position: relative;
          overflow: hidden;
          min-width: 0;

          padding: 19px;

          border: 1px solid var(--app-border);
          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              var(--app-card),
              var(--app-card-2)
            );

          box-shadow:
            0 10px 30px rgba(0,0,0,.04);

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;
        }

        .home-stat::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;

          height: 2px;

          background: var(--stat-accent);

          box-shadow:
            0 0 15px var(--stat-accent);
        }

        .home-stat::after {
          content: "";

          position: absolute;

          width: 110px;
          height: 110px;

          right: -55px;
          bottom: -55px;

          border-radius: 50%;

          background: var(--stat-accent);
          opacity: .08;

          filter: blur(5px);

          transition:
            transform .4s ease;
        }

        .home-stat:hover {
          transform: translateY(-4px);

          border-color:
            var(--stat-accent);

          box-shadow:
            0 18px 40px
            rgba(139,92,246,.10);
        }

        .home-stat:hover::after {
          transform: scale(1.5);
        }

        .home-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .home-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 43px;
          height: 43px;
          flex-shrink: 0;

          border: 1px solid rgba(139,92,246,.18);
          border-radius: 12px;

          background:
            rgba(139,92,246,.08);

          color: var(--stat-accent);
          font-size: 21px;

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .home-stat:hover .home-stat-icon {
          transform: scale(1.07);

          box-shadow:
            0 0 20px rgba(139,92,246,.16);
        }

        .home-stat-live {
          color: var(--stat-accent);

          font-size: 8px;
          font-weight: 800;

          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .home-stat-value {
          position: relative;
          z-index: 2;

          margin-top: 18px;

          color: var(--app-text);

          font-size: 29px;
          font-weight: 850;

          line-height: 1;
          letter-spacing: -.04em;
        }

        .home-stat-label {
          position: relative;
          z-index: 2;

          margin-top: 8px;

          color: var(--app-text);

          font-size: 12px;
          font-weight: 750;
        }

        .home-stat-description {
          position: relative;
          z-index: 2;

          margin-top: 3px;

          color: var(--app-secondary-text);

          font-size: 9px;
        }

        /* =====================================================
           QUICK ACTIONS
        ===================================================== */

        .quick-actions {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0,1fr));

          gap: 14px;
        }

        .quick-action {
          position: relative;
          overflow: hidden;

          min-height: 155px;
          min-width: 0;

          padding: 20px;

          text-align: left;

          border: 1px solid var(--app-border);
          border-top: 2px solid var(--action-color);

          border-radius: 17px;

          background:
            linear-gradient(
              145deg,
              var(--app-card),
              var(--app-card-2)
            );

          color: var(--app-text);

          cursor: pointer;

          box-shadow:
            0 8px 28px rgba(0,0,0,.035);

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;
        }

        .quick-action:hover {
          transform: translateY(-5px);

          border-color:
            rgba(139,92,246,.35);

          box-shadow:
            0 18px 40px
            rgba(139,92,246,.10);
        }

        .quick-action-glow {
          position: absolute;

          width: 150px;
          height: 150px;

          right: -60px;
          top: -65px;

          border-radius: 50%;

          background:
            var(--action-color);

          opacity: .07;

          filter: blur(25px);

          pointer-events: none;

          transition:
            transform .5s ease,
            opacity .5s ease;
        }

        .quick-action:hover
        .quick-action-glow {
          transform: scale(1.5);
          opacity: .14;
        }

        .quick-action-top {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .quick-action-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 43px;
          height: 43px;

          border-radius: 12px;

          background:
            var(--action-color);

          color: white;

          font-size: 21px;

          box-shadow:
            0 8px 22px
            rgba(139,92,246,.18);

          transition:
            transform .25s ease;
        }

        .quick-action:hover
        .quick-action-icon {
          transform:
            scale(1.08)
            rotate(-3deg);
        }

        .quick-action-tag {
          color: var(--action-color);

          font-size: 8px;
          font-weight: 850;

          letter-spacing: .12em;
        }

        .quick-action-title {
          position: relative;
          z-index: 2;

          margin: 17px 0 5px;

          color: var(--app-text);

          font-size: 14px;
          font-weight: 800;
        }

        .quick-action-description {
          position: relative;
          z-index: 2;

          margin: 0;

          color: var(--app-secondary-text);

          font-size: 11px;
          line-height: 1.55;
        }

        .quick-action-arrow {
          position: absolute;

          right: 18px;
          bottom: 17px;

          color: var(--action-color);

          font-size: 17px;

          opacity: .7;

          transition:
            transform .25s ease;
        }

        .quick-action:hover
        .quick-action-arrow {
          transform: translateX(5px);
        }

        .quick-action-line {
          position: absolute;

          left: 0;
          bottom: 0;

          width: 0;
          height: 2px;

          background:
            linear-gradient(
              90deg,
              var(--action-color),
              transparent
            );

          transition:
            width .35s ease;
        }

        .quick-action:hover
        .quick-action-line {
          width: 100%;
        }

        /* =====================================================
           RECENT DECISIONS
        ===================================================== */

        .recent-card {
          overflow: hidden;

          border: 1px solid var(--app-border);
          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              var(--app-card),
              var(--app-card-2)
            );

          box-shadow:
            0 10px 30px rgba(0,0,0,.04);
        }

        .recent-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;

          padding: 14px 19px;

          border-bottom:
            1px solid var(--app-border);

          background:
            rgba(139,92,246,.025);
        }

        .recent-card-label {
          color: var(--app-secondary-text);

          font-size: 9px;
          font-weight: 750;

          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .recent-card-count {
          padding: 4px 8px;

          border: 1px solid rgba(139,92,246,.18);
          border-radius: 999px;

          background:
            rgba(139,92,246,.06);

          color: #a78bfa;

          font-size: 8px;
          font-weight: 800;
        }

        /* =====================================================
           DECISION ROW
        ===================================================== */

        .decision-row {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 18px;

          padding: 16px 19px;

          border-bottom:
            1px solid var(--app-border);

          transition:
            background .2s ease,
            padding-left .2s ease;
        }

        .decision-row:last-child {
          border-bottom: none;
        }

        .decision-row:hover {
          background:
            rgba(139,92,246,.025);

          padding-left: 23px;
        }

        .decision-row::before {
          content: "";

          position: absolute;

          left: 0;
          top: 0;
          bottom: 0;

          width: 2px;

          background:
            #8b5cf6;

          opacity: 0;

          transition:
            opacity .2s ease;
        }

        .decision-row:hover::before {
          opacity: 1;
        }

        .decision-info {
          min-width: 0;
          flex: 1;
        }

        .decision-title {
          margin: 0;

          color: var(--app-text);

          font-size: 13px;
          font-weight: 750;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .decision-meta {
          margin: 5px 0 0;

          color: var(--app-secondary-text);

          font-size: 10px;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .decision-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;

          gap: 9px;

          flex-shrink: 0;
        }

        /* =====================================================
           BADGES
        ===================================================== */

        .visibility-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;

          padding: 5px 9px;

          border-radius: 999px;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: .04em;
        }

        .visibility-badge::before {
          content: "";

          width: 5px;
          height: 5px;

          border-radius: 50%;
        }

        .visibility-public {
          border:
            1px solid rgba(22,163,74,.2);

          background:
            rgba(22,163,74,.07);

          color: #15803d;
        }

        .visibility-public::before {
          background: #22c55e;
          box-shadow:
            0 0 7px rgba(34,197,94,.6);
        }

        .visibility-private {
          border:
            1px solid rgba(220,38,38,.2);

          background:
            rgba(220,38,38,.07);

          color: #dc2626;
        }

        .visibility-private::before {
          background: #ef4444;
        }

        [data-theme="dark"]
        .visibility-public {
          border-color: #24573f;
          background: #10251d;
          color: #86efac;
        }

        [data-theme="dark"]
        .visibility-private {
          border-color: #66333a;
          background: #28191d;
          color: #fca5a5;
        }

        /* =====================================================
           VIEW BUTTON
        ===================================================== */

        .view-button {
          padding: 7px 13px;

          border:
            1px solid rgba(139,92,246,.23);

          border-radius: 8px;

          background:
            rgba(139,92,246,.07);

          color: var(--app-primary-light);

          font-size: 9px;
          font-weight: 750;

          cursor: pointer;

          transition:
            background .2s ease,
            border-color .2s ease,
            transform .2s ease;
        }

        .view-button:hover {
          background:
            rgba(139,92,246,.14);

          border-color:
            rgba(139,92,246,.42);

          transform:
            translateY(-1px);
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .home-loading {
          padding: 48px 20px;
          text-align: center;
        }

        .home-spinner {
          width: 30px;
          height: 30px;

          margin:
            0 auto 13px;

          border:
            2px solid var(--app-border);

          border-top-color:
            #8b5cf6;

          border-right-color:
            #c084fc;

          border-radius: 50%;

          animation:
            homeSpin .8s linear infinite;

          box-shadow:
            0 0 15px rgba(139,92,246,.15);
        }

        @keyframes homeSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .home-message {
          margin: 0;

          color:
            var(--app-secondary-text);

          font-size: 11px;
        }

        /* =====================================================
           EMPTY STATE
        ===================================================== */

        .home-empty {
          padding: 55px 20px;
          text-align: center;
        }

        .home-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 60px;
          height: 60px;

          margin:
            0 auto 15px;

          border:
            1px solid rgba(139,92,246,.22);

          border-radius: 17px;

          background:
            rgba(139,92,246,.07);

          color: #a78bfa;

          font-size: 27px;

          box-shadow:
            0 0 25px rgba(139,92,246,.08);
        }

        .home-empty-title {
          margin: 0;

          color: var(--app-text);

          font-size: 14px;
          font-weight: 750;
        }

        .home-empty-text {
          margin: 6px 0 0;

          color: var(--app-secondary-text);

          font-size: 11px;
        }

        .home-button {
          margin-top: 18px;

          padding: 9px 16px;

          border:
            1px solid rgba(139,92,246,.25);

          border-radius: 9px;

          background:
            rgba(139,92,246,.08);

          color:
            var(--app-primary-light);

          font-size: 10px;
          font-weight: 750;

          cursor: pointer;

          transition:
            transform .2s ease,
            background .2s ease;
        }

        .home-button:hover {
          transform:
            translateY(-2px);

          background:
            rgba(139,92,246,.15);
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .home-footer {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          margin-top: 42px;
          padding: 20px 10px 5px;

          border-top:
            1px solid var(--app-border);

          color:
            var(--app-secondary-text);

          font-size: 9px;

          text-align: center;
        }

        .footer-dot {
          width: 4px;
          height: 4px;

          border-radius: 50%;

          background:
            #8b5cf6;

          box-shadow:
            0 0 7px rgba(139,92,246,.7);
        }

        .footer-brand {
          color: #a78bfa;
          font-weight: 750;
        }

        /* =====================================================
           LIGHT THEME
        ===================================================== */

        [data-theme="light"] .home-stat,
        [data-theme="light"] .quick-action,
        [data-theme="light"] .recent-card,
        [data-theme="light"] .home-hero {
          box-shadow:
            0 10px 30px
            rgba(31,41,55,.055);
        }

        [data-theme="light"] .home-stat:hover,
        [data-theme="light"] .quick-action:hover {
          box-shadow:
            0 18px 40px
            rgba(109,40,217,.10);
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1050px) {

          .home-stats {
            grid-template-columns:
              repeat(2, minmax(0,1fr));
          }

          .quick-actions {
            grid-template-columns:
              repeat(2, minmax(0,1fr));
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .home-page {
            max-width: 100%;
          }

          .home-hero {
            min-height: auto;
            padding: 20px;
            border-radius: 18px;
          }

          .home-hero-content {
            align-items: flex-start;
          }

          .home-hero-title {
            font-size: 25px;
          }

          .home-hero-description {
            font-size: 11px;
          }

          .home-hero-orb {
            width: 54px;
            height: 54px;
            border-radius: 15px;
            font-size: 23px;
          }

          .home-section {
            margin-top: 27px;
          }

          .home-section-title {
            font-size: 14px;
          }

          .home-section-label {
            display: none;
          }

          .quick-actions {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .quick-action {
            min-height: 125px;
            padding: 16px;
          }

          .quick-action-title {
            margin-top: 13px;
          }

          .decision-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 11px;
            padding: 15px;
          }

          .decision-row:hover {
            padding-left: 18px;
          }

          .decision-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .recent-card-header {
            padding: 12px 15px;
          }

          .home-footer {
            margin-top: 32px;
            flex-wrap: wrap;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 500px) {

          .home-stats {
            grid-template-columns:
              repeat(2, minmax(0,1fr));

            gap: 9px;
          }

          .home-stat {
            padding: 14px;
            border-radius: 14px;
          }

          .home-stat-icon {
            width: 35px;
            height: 35px;
            border-radius: 10px;
            font-size: 16px;
          }

          .home-stat-live {
            display: none;
          }

          .home-stat-value {
            margin-top: 15px;
            font-size: 22px;
          }

          .home-stat-label {
            font-size: 9px;
          }

          .home-stat-description {
            font-size: 8px;
          }

          .home-hero {
            padding: 17px;
          }

          .home-hero-orb {
            display: none;
          }

          .home-hero-eyebrow {
            font-size: 8px;
          }

          .home-hero-title {
            font-size: 22px;
          }

          .home-hero-description {
            font-size: 10px;
          }

          .quick-action {
            min-height: 120px;
          }

          .decision-title {
            font-size: 12px;
          }

          .decision-meta {
            font-size: 9px;
            white-space: normal;
          }

          .home-footer {
            font-size: 8px;
          }
        }

      `}</style>

      <div className="home-page">

        {/* =====================================================
            FUTURISTIC HERO
        ===================================================== */}

        <section className="home-hero">

          <div className="home-hero-content">

            <div className="home-hero-text">

              <div className="home-hero-eyebrow">
                <span className="hero-live-dot" />
                Decision Intelligence Platform
              </div>

              <h1 className="home-hero-title">
                Think Better.
                <br />
                Decide Together.
              </h1>

              <p className="home-hero-description">
                Create decisions, gather community opinions,
                explore polls and turn collective ideas into
                smarter outcomes.
              </p>

            </div>

            <div className="home-hero-orb">
              ✦
            </div>

          </div>

        </section>

        {/* =====================================================
            PLATFORM STATISTICS
        ===================================================== */}

        <section>

          <div className="home-section-header">

            <span className="home-section-label">
              Overview
            </span>

            <h2 className="home-section-title">
              Your Activity
            </h2>

            <div className="home-section-line" />

          </div>

          <div className="home-stats">

            {stats.map((stat) => (

              <div
                key={stat.label}
                className="home-stat"
                style={{
                  "--stat-accent": stat.accent,
                }}
              >

                <div className="home-stat-top">

                  <div className="home-stat-icon">
                    {stat.icon}
                  </div>

                  <span className="home-stat-live">
                    Live
                  </span>

                </div>

                <div className="home-stat-value">
                  {stat.value}
                </div>

                <div className="home-stat-label">
                  {stat.label}
                </div>

                <div className="home-stat-description">
                  {stat.description}
                </div>

              </div>

            ))}

          </div>

        </section>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section className="home-section">

          <div className="home-section-header">

            <span className="home-section-label">
              Explore
            </span>

            <h2 className="home-section-title">
              Quick Actions
            </h2>

            <div className="home-section-line" />

          </div>

          <div className="quick-actions">

            {quickActions.map((action) => (

              <button
                key={action.title}
                type="button"
                onClick={() =>
                  navigate(action.route)
                }
                className="quick-action"
                style={{
                  "--action-color": action.color,
                }}
              >

                <div className="quick-action-glow" />

                <div className="quick-action-top">

                  <div className="quick-action-icon">
                    {action.icon}
                  </div>

                  <span className="quick-action-tag">
                    {action.tag}
                  </span>

                </div>

                <h3 className="quick-action-title">
                  {action.title}
                </h3>

                <p className="quick-action-description">
                  {action.description}
                </p>

                <span className="quick-action-arrow">
                  →
                </span>

                <div className="quick-action-line" />

              </button>

            ))}

          </div>

        </section>

        {/* =====================================================
            RECENT DECISIONS
        ===================================================== */}

        <section className="home-section">

          <div className="home-section-header">

            <span className="home-section-label">
              Activity
            </span>

            <h2 className="home-section-title">
              Recent Decisions
            </h2>

            <div className="home-section-line" />

          </div>

          <div className="recent-card">

            <div className="recent-card-header">

              <span className="recent-card-label">
                Latest decision boards
              </span>

              <span className="recent-card-count">
                {Math.min(decisions.length, 5)} shown
              </span>

            </div>

            {/* LOADING */}

            {loading && (

              <div className="home-loading">

                <div className="home-spinner" />

                <p className="home-message">
                  Loading your decisions...
                </p>

              </div>

            )}

            {/* ERROR */}

            {!loading && error && (

              <div className="home-loading">

                <p className="home-message">
                  {error}
                </p>

              </div>

            )}

            {/* EMPTY */}

            {!loading &&
              !error &&
              decisions.length === 0 && (

                <div className="home-empty">

                  <div className="home-empty-icon">
                    ◇
                  </div>

                  <h3 className="home-empty-title">
                    No decisions yet
                  </h3>

                  <p className="home-empty-text">
                    Create your first decision board
                    and start collecting opinions.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/create-decision"
                      )
                    }
                    className="home-button"
                  >
                    ＋ Create Decision
                  </button>

                </div>

              )}

            {/* DECISIONS */}

            {!loading &&
              !error &&
              decisions
                .slice(0, 5)
                .map((decision) => (

                  <div
                    key={decision.id}
                    className="decision-row"
                  >

                    <div className="decision-info">

                      <h3 className="decision-title">
                        {decision.title}
                      </h3>

                      <p className="decision-meta">

                        {decision.category ||
                          "Uncategorized"}

                        {decision.deadline
                          ? ` • Deadline: ${decision.deadline}`
                          : ""}

                      </p>

                    </div>

                    <div className="decision-actions">

                      <span
                        className={`
                          visibility-badge
                          ${
                            decision.visibility ===
                            "PRIVATE"
                              ? "visibility-private"
                              : "visibility-public"
                          }
                        `}
                      >
                        {decision.visibility ||
                          "PUBLIC"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/decisions"
                          )
                        }
                        className="view-button"
                      >
                        View →
                      </button>

                    </div>

                  </div>

                ))}

          </div>

        </section>

        {/* =====================================================
            COPYRIGHT
        ===================================================== */}

        <footer className="home-footer">

          <span>
            © 2026
          </span>

          <span className="footer-brand">
            Collaborative Decision Making
          </span>

          <span className="footer-dot" />

          <span>
            Community Polling Platform
          </span>

          <span>
            • All Rights Reserved
          </span>

        </footer>

      </div>
    </DashboardLayout>
  );
}

export default Home;