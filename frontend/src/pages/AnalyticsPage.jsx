import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

function AnalyticsPage() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     FETCH DECISIONS
  ========================================================= */

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please login to view analytics.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/decisions/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch decisions");
      }

      const data = await response.json();

      setDecisions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load analytics.");
      setDecisions([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     ANALYTICS
  ========================================================= */

  const analytics = useMemo(() => {
    const total = decisions.length;

    const active = decisions.filter((decision) => {
      if (!decision.deadline) {
        return true;
      }

      const deadline = new Date(decision.deadline);

      return deadline >= new Date();
    }).length;

    const completed = total - active;

    const publicCount = decisions.filter(
      (decision) => decision.visibility === "PUBLIC"
    ).length;

    const privateCount = decisions.filter(
      (decision) => decision.visibility === "PRIVATE"
    ).length;

    const anonymousCount = decisions.filter(
      (decision) => decision.anonymous === true
    ).length;

    /* =========================
       CATEGORY
    ========================= */

    const categoryMap = {};

    decisions.forEach((decision) => {
      const category = decision.category || "Uncategorized";

      categoryMap[category] =
        (categoryMap[category] || 0) + 1;
    });

    const categories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    /* =========================
       MONTHLY TREND
    ========================= */

    const monthMap = {};

    decisions.forEach((decision) => {
      const rawDate =
        decision.createdAt ||
        decision.createdDate ||
        decision.date;

      if (!rawDate) return;

      const date = new Date(rawDate);

      if (isNaN(date.getTime())) return;

      const key =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

      if (!monthMap[key]) {
        monthMap[key] = {
          date: new Date(
            date.getFullYear(),
            date.getMonth(),
            1
          ),
          count: 0,
        };
      }

      monthMap[key].count++;
    });

    const trend = Object.values(monthMap)
      .sort((a, b) => a.date - b.date)
      .slice(-8)
      .map((item) => ({
        month: item.date.toLocaleString("default", {
          month: "short",
        }),
        count: item.count,
      }));

    /* =========================
       OPTIONS
    ========================= */

    const optionMap = {};
    let totalOptions = 0;

    decisions.forEach((decision) => {
      if (!Array.isArray(decision.options)) return;

      decision.options.forEach((option) => {
        totalOptions++;

        const name =
          typeof option === "string"
            ? option
            : option?.optionText ||
              option?.text ||
              option?.name ||
              option?.label ||
              "Option";

        optionMap[name] =
          (optionMap[name] || 0) + 1;
      });
    });

    const options = Object.entries(optionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    /* =========================
       PERCENTAGES
    ========================= */

    const publicPercentage =
      total > 0
        ? Math.round((publicCount / total) * 100)
        : 0;

    const privatePercentage =
      total > 0
        ? Math.round((privateCount / total) * 100)
        : 0;

    const activePercentage =
      total > 0
        ? Math.round((active / total) * 100)
        : 0;

    const completedPercentage =
      total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    return {
      total,
      active,
      completed,
      publicCount,
      privateCount,
      anonymousCount,
      categories,
      trend,
      options,
      totalOptions,
      publicPercentage,
      privatePercentage,
      activePercentage,
      completedPercentage,
    };
  }, [decisions]);

  const maxCategory = Math.max(
    1,
    ...analytics.categories.map(([, count]) => count)
  );

  const maxOption = Math.max(
    1,
    ...analytics.options.map(([, count]) => count)
  );

  const maxTrend = Math.max(
    1,
    ...analytics.trend.map((item) => item.count)
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <DashboardLayout
        pageTitle="Analytics"
        pageSubtitle="Understand your decision activity."
      >
        <style>{`
          .analytics-loading {
            min-height: 500px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--app-muted);
          }

          .loading-orbit {
            width: 55px;
            height: 55px;
            border-radius: 50%;
            border: 2px solid var(--app-border);
            border-top-color: #8b5cf6;
            border-right-color: #a78bfa;
            animation: analyticsSpin 1s linear infinite;
            box-shadow: 0 0 25px rgba(139, 92, 246, .25);
            margin-bottom: 18px;
          }

          .loading-text {
            font-size: 12px;
            letter-spacing: .8px;
          }

          @keyframes analyticsSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        <div className="analytics-loading">
          <div className="loading-orbit"></div>
          <div className="loading-text">
            ANALYZING YOUR DECISIONS...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <DashboardLayout
      pageTitle="Analytics"
      pageSubtitle="Understand your decisions and activity at a glance."
    >
      <style>{`

        * {
          box-sizing: border-box;
        }

        /* =====================================================
           PAGE
        ===================================================== */

        .analytics-page {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          color: var(--app-text);
          padding-bottom: 40px;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .analytics-hero {
          position: relative;
          overflow: hidden;
          min-height: 190px;
          padding: 30px;
          margin-bottom: 20px;
          border: 1px solid var(--app-border);
          border-radius: 22px;

          background:
            radial-gradient(
              circle at 85% 20%,
              rgba(139, 92, 246, .22),
              transparent 28%
            ),
            radial-gradient(
              circle at 15% 90%,
              rgba(59, 130, 246, .10),
              transparent 25%
            ),
            var(--app-card);

          box-shadow:
            0 20px 60px rgba(0, 0, 0, .08);

          transition:
            background .25s ease,
            border-color .25s ease;
        }

        .analytics-hero::before {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          right: -110px;
          top: -160px;
          border: 1px solid rgba(139, 92, 246, .20);
          border-radius: 50%;
        }

        .analytics-hero::after {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -45px;
          top: -100px;
          border: 1px solid rgba(139, 92, 246, .12);
          border-radius: 50%;
        }

        .hero-content {
          position: relative;
          z-index: 2;
        }

        .hero-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border-radius: 20px;

          background: rgba(139, 92, 246, .10);
          border: 1px solid rgba(139, 92, 246, .25);

          color: #8b5cf6;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;

          margin-bottom: 14px;
        }

        .hero-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8b5cf6;
          box-shadow: 0 0 12px #8b5cf6;
          animation: heroPulse 1.8s infinite;
        }

        @keyframes heroPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }

          50% {
            opacity: .45;
            transform: scale(.75);
          }
        }

        .hero-title {
          font-size: clamp(25px, 3vw, 36px);
          font-weight: 700;
          letter-spacing: -1px;
          margin-bottom: 8px;
          color: var(--app-text);
        }

        .hero-text {
          max-width: 620px;
          color: var(--app-muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .hero-status {
          position: absolute;
          right: 28px;
          bottom: 25px;

          display: flex;
          align-items: center;
          gap: 7px;

          color: #10b981;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .hero-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 12px #10b981;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .analytics-error {
          padding: 13px 16px;
          margin-bottom: 18px;

          border-radius: 11px;

          background: rgba(239, 68, 68, .08);
          border: 1px solid rgba(239, 68, 68, .28);

          color: #dc2626;
          font-size: 11px;
        }

        [data-theme="dark"] .analytics-error {
          color: #f87171;
          background: rgba(127, 29, 29, .15);
        }

        /* =====================================================
           KPI
        ===================================================== */

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 18px;
        }

        .kpi {
          position: relative;
          overflow: hidden;

          min-height: 150px;
          padding: 20px;

          border: 1px solid var(--app-border);
          border-radius: 17px;

          background: var(--app-card);

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;
        }

        .kpi:hover {
          transform: translateY(-5px);
          border-color: rgba(139, 92, 246, .55);

          box-shadow:
            0 18px 40px rgba(139, 92, 246, .10);
        }

        .kpi::before {
          content: "";
          position: absolute;

          width: 120px;
          height: 120px;

          right: -60px;
          top: -60px;

          border-radius: 50%;

          background: rgba(139, 92, 246, .12);
          filter: blur(20px);
        }

        .kpi::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #8b5cf6,
              transparent
            );

          opacity: .5;
        }

        .kpi-top {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 20px;
        }

        .kpi-icon {
          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: rgba(139, 92, 246, .10);
          border: 1px solid rgba(139, 92, 246, .22);

          font-size: 17px;

          box-shadow:
            inset 0 0 15px rgba(139, 92, 246, .06);
        }

        .kpi-live {
          display: flex;
          align-items: center;
          gap: 5px;

          color: #10b981;

          font-size: 8px;
          font-weight: 700;
          letter-spacing: .7px;
        }

        .live-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #10b981;

          box-shadow:
            0 0 9px #10b981;
        }

        .kpi-number {
          position: relative;
          z-index: 2;

          font-size: 30px;
          font-weight: 750;
          letter-spacing: -1px;

          color: var(--app-text);

          margin-bottom: 4px;
        }

        .kpi-label {
          position: relative;
          z-index: 2;

          color: var(--app-muted);
          font-size: 10px;
          letter-spacing: .2px;
        }

        /* =====================================================
           MAIN GRID
        ===================================================== */

        .analytics-grid {
          display: grid;
          grid-template-columns: 1.45fr 1fr;
          gap: 18px;
          margin-bottom: 18px;
        }

        .analytics-card {
          min-width: 0;

          padding: 22px;

          border-radius: 17px;
          border: 1px solid var(--app-border);

          background: var(--app-card);

          box-shadow:
            0 10px 30px rgba(0, 0, 0, .05);

          transition:
            background .25s ease,
            border-color .25s ease,
            transform .25s ease;
        }

        .analytics-card:hover {
          border-color: rgba(139, 92, 246, .25);
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;

          margin-bottom: 22px;
        }

        .card-title {
          color: var(--app-text);
          font-size: 15px;
          font-weight: 650;
        }

        .card-subtitle {
          color: var(--app-muted);
          font-size: 10px;
          margin-top: 4px;
        }

        .card-badge {
          flex-shrink: 0;

          padding: 6px 10px;

          border-radius: 7px;

          background: rgba(139, 92, 246, .09);
          border: 1px solid rgba(139, 92, 246, .22);

          color: #8b5cf6;

          font-size: 8px;
          font-weight: 700;
          letter-spacing: .7px;
        }

        /* =====================================================
           FUTURISTIC TREND CHART
        ===================================================== */

        .trend-chart {
          position: relative;
          height: 275px;
          padding: 10px 4px 30px;
        }

        .chart-grid {
          position: absolute;

          left: 0;
          right: 0;

          top: 10px;
          bottom: 38px;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          pointer-events: none;
        }

        .chart-grid-line {
          width: 100%;
          border-top: 1px dashed var(--app-border);
          opacity: .7;
        }

        .chart-y-label {
          position: absolute;
          left: 0;
          transform: translateY(-50%);

          color: var(--app-muted);
          font-size: 8px;
        }

        .trend-bars {
          position: absolute;

          left: 28px;
          right: 0;

          top: 10px;
          bottom: 38px;

          display: flex;
          align-items: flex-end;

          gap: 10px;
        }

        .trend-column {
          flex: 1;
          height: 100%;

          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;

          min-width: 0;
        }

        .trend-value {
          color: var(--app-text);
          font-size: 9px;
          font-weight: 700;

          margin-bottom: 7px;
        }

        .trend-bar-container {
          width: 100%;
          max-width: 42px;

          height: 175px;

          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .trend-bar {
          width: 100%;
          min-height: 5px;

          border-radius: 9px 9px 3px 3px;

          background:
            linear-gradient(
              to top,
              #5b21b6,
              #8b5cf6,
              #c4b5fd
            );

          box-shadow:
            0 0 20px rgba(139, 92, 246, .18);

          animation: barGrow .8s ease-out both;

          transition:
            filter .25s ease,
            transform .25s ease;
        }

        .trend-bar:hover {
          filter: brightness(1.25);
          transform: scaleX(1.08);
        }

        @keyframes barGrow {
          from {
            height: 0 !important;
          }
        }

        .trend-month {
          margin-top: 9px;

          color: var(--app-muted);

          font-size: 9px;
        }

        .trend-empty {
          min-height: 220px;

          display: flex;
          align-items: center;
          justify-content: center;

          text-align: center;

          color: var(--app-muted);
          font-size: 11px;
        }

        /* =====================================================
           DONUT
        ===================================================== */

        .donut-layout {
          min-height: 260px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 35px;
        }

        .donut {
          position: relative;

          width: 165px;
          height: 165px;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            conic-gradient(
              #8b5cf6 0deg,
              #8b5cf6 var(--public-angle),
              #c4b5fd var(--public-angle),
              #c4b5fd 360deg
            );

          box-shadow:
            0 0 35px rgba(139, 92, 246, .16);

          animation: donutAppear .8s ease-out;
        }

        .donut::before {
          content: "";

          position: absolute;

          inset: -6px;

          border-radius: 50%;

          border: 1px solid rgba(139, 92, 246, .20);
        }

        .donut-inner {
          position: absolute;

          inset: 20px;

          border-radius: 50%;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          background: var(--app-card);

          border: 1px solid var(--app-border);

          box-shadow:
            inset 0 0 25px rgba(139, 92, 246, .05);
        }

        .donut-number {
          color: var(--app-text);

          font-size: 27px;
          font-weight: 750;
        }

        .donut-label {
          margin-top: 2px;

          color: var(--app-muted);

          font-size: 8px;
          letter-spacing: 1px;
        }

        @keyframes donutAppear {
          from {
            opacity: 0;
            transform: scale(.7) rotate(-90deg);
          }

          to {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        .legend {
          display: flex;
          flex-direction: column;

          gap: 17px;
        }

        .legend-item {
          display: grid;
          grid-template-columns: 9px auto auto;

          align-items: center;

          gap: 8px;

          color: var(--app-secondary-text);

          font-size: 10px;
        }

        .legend-item strong {
          color: var(--app-text);
          font-size: 12px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          box-shadow: 0 0 8px currentColor;
        }

        .legend-percent {
          color: var(--app-muted);

          font-size: 9px;
        }

        /* =====================================================
           RANKING BARS
        ===================================================== */

        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .ranking-item {
          animation: rankingAppear .5s ease both;
        }

        .ranking-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 7px;

          gap: 10px;
        }

        .ranking-name {
          min-width: 0;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          color: var(--app-secondary-text);

          font-size: 10px;
        }

        .ranking-count {
          flex-shrink: 0;

          color: var(--app-text);

          font-size: 10px;
          font-weight: 700;
        }

        .ranking-track {
          height: 8px;

          overflow: hidden;

          border-radius: 20px;

          background: var(--app-card-2);

          border: 1px solid var(--app-border);
        }

        .ranking-fill {
          height: 100%;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              #5b21b6,
              #8b5cf6,
              #c4b5fd
            );

          box-shadow:
            0 0 14px rgba(139, 92, 246, .22);

          animation: fillGrow .8s ease-out;
        }

        @keyframes fillGrow {
          from {
            width: 0 !important;
          }
        }

        @keyframes rankingAppear {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .rank-number {
          width: 20px;
          height: 20px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          margin-right: 7px;

          border-radius: 6px;

          background: rgba(139, 92, 246, .09);
          border: 1px solid rgba(139, 92, 246, .18);

          color: #8b5cf6;

          font-size: 8px;
          font-weight: 700;
        }

        /* =====================================================
           STATUS
        ===================================================== */

        .status-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .status-card {
          position: relative;
          overflow: hidden;

          padding: 17px;

          border-radius: 12px;

          background: var(--app-card-2);

          border: 1px solid var(--app-border);

          transition:
            transform .25s ease,
            border-color .25s ease;
        }

        .status-card:hover {
          transform: translateY(-3px);
          border-color: rgba(139, 92, 246, .35);
        }

        .status-card::after {
          content: "";

          position: absolute;

          width: 60px;
          height: 60px;

          right: -20px;
          top: -20px;

          border-radius: 50%;

          background: rgba(139, 92, 246, .08);

          filter: blur(10px);
        }

        .status-icon {
          font-size: 16px;
          margin-bottom: 12px;
        }

        .status-value {
          color: var(--app-text);

          font-size: 22px;
          font-weight: 700;

          margin-bottom: 3px;
        }

        .status-label {
          color: var(--app-muted);
          font-size: 9px;
        }

        .status-progress {
          height: 4px;

          margin-top: 12px;

          border-radius: 10px;

          background: var(--app-border);

          overflow: hidden;
        }

        .status-progress-fill {
          height: 100%;

          border-radius: 10px;

          background:
            linear-gradient(
              90deg,
              #6d28d9,
              #a78bfa
            );
        }

        /* =====================================================
           RECENT
        ===================================================== */

        .recent-list {
          display: flex;
          flex-direction: column;
        }

        .recent-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding: 14px 0;

          border-bottom: 1px solid var(--app-border);
        }

        .recent-row:last-child {
          border-bottom: none;
        }

        .recent-left {
          min-width: 0;

          display: flex;
          align-items: center;

          gap: 11px;
        }

        .recent-icon {
          width: 36px;
          height: 36px;

          min-width: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: rgba(139, 92, 246, .09);

          border: 1px solid rgba(139, 92, 246, .20);

          font-size: 14px;
        }

        .recent-title {
          color: var(--app-text);

          font-size: 11px;
          font-weight: 650;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .recent-meta {
          color: var(--app-muted);

          font-size: 9px;

          margin-top: 4px;
        }

        .visibility {
          flex-shrink: 0;

          padding: 5px 9px;

          border-radius: 6px;

          font-size: 8px;
          font-weight: 700;
          letter-spacing: .3px;
        }

        .visibility-public {
          background: rgba(34, 197, 94, .09);
          border: 1px solid rgba(34, 197, 94, .22);
          color: #16a34a;
        }

        .visibility-private {
          background: rgba(239, 68, 68, .08);
          border: 1px solid rgba(239, 68, 68, .20);
          color: #dc2626;
        }

        [data-theme="dark"] .visibility-public {
          background: rgba(16, 102, 71, .18);
          border-color: #24573f;
          color: #6ee7b7;
        }

        [data-theme="dark"] .visibility-private {
          background: rgba(91, 48, 66, .20);
          border-color: #5b3042;
          color: #f0a4bd;
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .empty {
          min-height: 150px;

          display: flex;
          align-items: center;
          justify-content: center;

          text-align: center;

          color: var(--app-muted);

          font-size: 11px;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1150px) {

          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {

          .analytics-hero {
            padding: 23px;
          }

          .hero-status {
            position: static;
            margin-top: 20px;
          }

          .analytics-card {
            padding: 17px;
          }

          .donut-layout {
            flex-direction: column;
            gap: 22px;
          }

          .status-grid {
            grid-template-columns: 1fr;
          }

          .trend-chart {
            height: 245px;
          }
        }

        @media (max-width: 500px) {

          .kpi-grid {
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .kpi {
            min-height: 130px;
            padding: 14px;
          }

          .kpi-number {
            font-size: 24px;
          }

          .kpi-icon {
            width: 34px;
            height: 34px;
            font-size: 14px;
          }

          .card-header {
            align-items: flex-start;
          }

          .card-badge {
            font-size: 7px;
          }

          .recent-row {
            align-items: flex-start;
          }

          .visibility {
            margin-top: 3px;
          }
        }

      `}</style>

      <div className="analytics-page">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="analytics-hero">

          <div className="hero-content">

            <div className="hero-label">
              <span className="hero-dot"></span>
              Decision Intelligence
            </div>

            <div className="hero-title">
              Your Decision Overview
            </div>

            <div className="hero-text">
              Track how you create, organize and manage
              decisions across your DecisionHub workspace.
            </div>

          </div>

          <div className="hero-status">
            <span className="hero-status-dot"></span>
            ANALYTICS ACTIVE
          </div>

        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="analytics-error">
            {error}
          </div>
        )}

        {/* =====================================================
            KPI
        ===================================================== */}

        <div className="kpi-grid">

          <div className="kpi">

            <div className="kpi-top">

              <div className="kpi-icon">
                📊
              </div>

              <div className="kpi-live">
                <span className="live-dot"></span>
                LIVE
              </div>

            </div>

            <div className="kpi-number">
              {analytics.total}
            </div>

            <div className="kpi-label">
              Total Decisions
            </div>

          </div>

          <div className="kpi">

            <div className="kpi-top">

              <div className="kpi-icon">
                ⚡
              </div>

              <div className="kpi-live">
                <span className="live-dot"></span>
                {analytics.activePercentage}%
              </div>

            </div>

            <div className="kpi-number">
              {analytics.active}
            </div>

            <div className="kpi-label">
              Active Decisions
            </div>

          </div>

          <div className="kpi">

            <div className="kpi-top">

              <div className="kpi-icon">
                🌐
              </div>

            </div>

            <div className="kpi-number">
              {analytics.publicCount}
            </div>

            <div className="kpi-label">
              Public Decisions
            </div>

          </div>

          <div className="kpi">

            <div className="kpi-top">

              <div className="kpi-icon">
                👤
              </div>

            </div>

            <div className="kpi-number">
              {analytics.anonymousCount}
            </div>

            <div className="kpi-label">
              Anonymous Decisions
            </div>

          </div>

        </div>

        {/* =====================================================
            TREND + VISIBILITY
        ===================================================== */}

        <div className="analytics-grid">

          {/* TREND */}

          <section className="analytics-card">

            <div className="card-header">

              <div>

                <div className="card-title">
                  Decision Activity
                </div>

                <div className="card-subtitle">
                  Decisions created over time
                </div>

              </div>

              <div className="card-badge">
                ACTIVITY
              </div>

            </div>

            {analytics.trend.length === 0 ? (

              <div className="trend-empty">
                Create decisions with dates to see your
                activity trend.
              </div>

            ) : (

              <div className="trend-chart">

                <div className="chart-grid">

                  <div className="chart-grid-line"></div>
                  <div className="chart-grid-line"></div>
                  <div className="chart-grid-line"></div>
                  <div className="chart-grid-line"></div>
                  <div className="chart-grid-line"></div>

                </div>

                <div className="trend-bars">

                  {analytics.trend.map(
                    (item, index) => (

                      <div
                        className="trend-column"
                        key={`${item.month}-${index}`}
                      >

                        <div className="trend-value">
                          {item.count}
                        </div>

                        <div className="trend-bar-container">

                          <div
                            className="trend-bar"
                            style={{
                              height:
                                `${Math.max(
                                  5,
                                  (item.count / maxTrend) *
                                    165
                                )}px`,
                              animationDelay:
                                `${index * 80}ms`,
                            }}
                          />

                        </div>

                        <div className="trend-month">
                          {item.month}
                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

          </section>

          {/* VISIBILITY */}

          <section className="analytics-card">

            <div className="card-header">

              <div>

                <div className="card-title">
                  Decision Visibility
                </div>

                <div className="card-subtitle">
                  Public vs private decisions
                </div>

              </div>

              <div className="card-badge">
                DISTRIBUTION
              </div>

            </div>

            <div className="donut-layout">

              <div
                className="donut"
                style={{
                  "--public-angle":
                    `${analytics.publicPercentage * 3.6}deg`,
                }}
              >

                <div className="donut-inner">

                  <div className="donut-number">
                    {analytics.total}
                  </div>

                  <div className="donut-label">
                    TOTAL
                  </div>

                </div>

              </div>

              <div className="legend">

                <div className="legend-item">

                  <span
                    className="legend-dot"
                    style={{
                      background: "#8b5cf6",
                      color: "#8b5cf6",
                    }}
                  />

                  <span>
                    Public
                  </span>

                  <strong>
                    {analytics.publicCount}
                  </strong>

                  <span className="legend-percent">
                    {analytics.publicPercentage}%
                  </span>

                </div>

                <div className="legend-item">

                  <span
                    className="legend-dot"
                    style={{
                      background: "#c4b5fd",
                      color: "#c4b5fd",
                    }}
                  />

                  <span>
                    Private
                  </span>

                  <strong>
                    {analytics.privateCount}
                  </strong>

                  <span className="legend-percent">
                    {analytics.privatePercentage}%
                  </span>

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* =====================================================
            CATEGORY + OPTIONS
        ===================================================== */}

        <div className="analytics-grid">

          {/* CATEGORY */}

          <section className="analytics-card">

            <div className="card-header">

              <div>

                <div className="card-title">
                  Decision Categories
                </div>

                <div className="card-subtitle">
                  Areas where you create the most decisions
                </div>

              </div>

              <div className="card-badge">
                TOP {analytics.categories.length}
              </div>

            </div>

            {analytics.categories.length === 0 ? (

              <div className="empty">
                No category data available.
              </div>

            ) : (

              <div className="ranking-list">

                {analytics.categories.map(
                  ([category, count], index) => (

                    <div
                      className="ranking-item"
                      key={category}
                      style={{
                        animationDelay:
                          `${index * 70}ms`,
                      }}
                    >

                      <div className="ranking-top">

                        <div className="ranking-name">

                          <span className="rank-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          {category}

                        </div>

                        <div className="ranking-count">
                          {count}
                        </div>

                      </div>

                      <div className="ranking-track">

                        <div
                          className="ranking-fill"
                          style={{
                            width:
                              `${(
                                count /
                                maxCategory
                              ) * 100}%`,
                          }}
                        />

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

          {/* OPTIONS */}

          <section className="analytics-card">

            <div className="card-header">

              <div>

                <div className="card-title">
                  Decision Options
                </div>

                <div className="card-subtitle">
                  Most frequently used options
                </div>

              </div>

              <div className="card-badge">
                {analytics.totalOptions} TOTAL
              </div>

            </div>

            {analytics.options.length === 0 ? (

              <div className="empty">
                No option data available.
              </div>

            ) : (

              <div className="ranking-list">

                {analytics.options.map(
                  ([option, count], index) => (

                    <div
                      className="ranking-item"
                      key={option}
                      style={{
                        animationDelay:
                          `${index * 70}ms`,
                      }}
                    >

                      <div className="ranking-top">

                        <div className="ranking-name">

                          <span className="rank-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          {option}

                        </div>

                        <div className="ranking-count">
                          {count}
                        </div>

                      </div>

                      <div className="ranking-track">

                        <div
                          className="ranking-fill"
                          style={{
                            width:
                              `${(
                                count /
                                maxOption
                              ) * 100}%`,
                          }}
                        />

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        </div>

        {/* =====================================================
            STATUS
        ===================================================== */}

        <section className="analytics-card">

          <div className="card-header">

            <div>

              <div className="card-title">
                Decision Status
              </div>

              <div className="card-subtitle">
                Current state of your decision boards
              </div>

            </div>

            <div className="card-badge">
              OVERVIEW
            </div>

          </div>

          <div className="status-grid">

            <div className="status-card">

              <div className="status-icon">
                ⚡
              </div>

              <div className="status-value">
                {analytics.active}
              </div>

              <div className="status-label">
                Active decisions
              </div>

              <div className="status-progress">

                <div
                  className="status-progress-fill"
                  style={{
                    width:
                      `${analytics.activePercentage}%`,
                  }}
                />

              </div>

            </div>

            <div className="status-card">

              <div className="status-icon">
                ✓
              </div>

              <div className="status-value">
                {analytics.completed}
              </div>

              <div className="status-label">
                Completed decisions
              </div>

              <div className="status-progress">

                <div
                  className="status-progress-fill"
                  style={{
                    width:
                      `${analytics.completedPercentage}%`,
                  }}
                />

              </div>

            </div>

            <div className="status-card">

              <div className="status-icon">
                🔒
              </div>

              <div className="status-value">
                {analytics.privateCount}
              </div>

              <div className="status-label">
                Private decisions
              </div>

              <div className="status-progress">

                <div
                  className="status-progress-fill"
                  style={{
                    width:
                      `${analytics.privatePercentage}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            RECENT DECISIONS
        ===================================================== */}

        <section
          className="analytics-card"
          style={{
            marginTop: "18px",
          }}
        >

          <div className="card-header">

            <div>

              <div className="card-title">
                Recent Decision Activity
              </div>

              <div className="card-subtitle">
                Latest boards created in your workspace
              </div>

            </div>

            <div className="card-badge">
              RECENT
            </div>

          </div>

          {decisions.length === 0 ? (

            <div className="empty">
              No decisions created yet.
            </div>

          ) : (

            <div className="recent-list">

              {decisions
                .slice(0, 5)
                .map((decision) => (

                  <div
                    className="recent-row"
                    key={decision.id}
                  >

                    <div className="recent-left">

                      <div className="recent-icon">
                        📊
                      </div>

                      <div>

                        <div className="recent-title">
                          {decision.title}
                        </div>

                        <div className="recent-meta">

                          {decision.category ||
                            "Uncategorized"}

                          {decision.deadline
                            ? ` • Deadline: ${decision.deadline}`
                            : ""}

                        </div>

                      </div>

                    </div>

                    <div
                      className={
                        "visibility " +
                        (
                          decision.visibility ===
                          "PRIVATE"
                            ? "visibility-private"
                            : "visibility-public"
                        )
                      }
                    >
                      {decision.visibility ||
                        "PUBLIC"}
                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>

      </div>

    </DashboardLayout>
  );
}

export default AnalyticsPage;