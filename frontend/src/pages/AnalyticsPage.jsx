import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

function AnalyticsPage() {

  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  /* =========================
     FETCH DECISIONS
  ========================= */

  useEffect(() => {
    fetchDecisions();
  }, []);


  const fetchDecisions = async () => {

    try {

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        setError("Please login to view analytics.");
        setLoading(false);
        return;
      }


      const response = await fetch(
        "http://localhost:8080/api/decisions/my",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      if (!response.ok) {
        throw new Error("Failed to fetch decisions");
      }


      const data = await response.json();

      setDecisions(
        Array.isArray(data) ? data : []
      );


    } catch (err) {

      console.error(err);

      setError(
        "Unable to load analytics."
      );

      setDecisions([]);

    } finally {

      setLoading(false);

    }

  };


  /* =========================
     ANALYTICS
  ========================= */

  const analytics = useMemo(() => {

    const total =
      decisions.length;


    const active =
      decisions.filter((decision) => {

        if (!decision.deadline) {
          return true;
        }

        const deadline =
          new Date(decision.deadline);

        return deadline >= new Date();

      }).length;


    const completed =
      total - active;


    const publicCount =
      decisions.filter(
        d => d.visibility === "PUBLIC"
      ).length;


    const privateCount =
      decisions.filter(
        d => d.visibility === "PRIVATE"
      ).length;


    const anonymousCount =
      decisions.filter(
        d => d.anonymous === true
      ).length;


    /* =========================
       CATEGORY
    ========================= */

    const categoryMap = {};

    decisions.forEach(decision => {

      const category =
        decision.category ||
        "Uncategorized";

      categoryMap[category] =
        (categoryMap[category] || 0) + 1;

    });


    const categories =
      Object.entries(categoryMap)
        .sort(
          (a, b) => b[1] - a[1]
        )
        .slice(0, 6);


    /* =========================
       MONTHLY TREND
    ========================= */

    const monthMap = {};

    decisions.forEach(decision => {

      const rawDate =
        decision.createdAt ||
        decision.createdDate ||
        decision.date;


      if (!rawDate) return;


      const date =
        new Date(rawDate);


      if (isNaN(date.getTime())) {
        return;
      }


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
          count: 0
        };

      }


      monthMap[key].count++;

    });


    const trend =
      Object.values(monthMap)
        .sort(
          (a, b) =>
            a.date - b.date
        )
        .slice(-8)
        .map(item => ({

          month:
            item.date.toLocaleString(
              "default",
              {
                month: "short"
              }
            ),

          count: item.count

        }));


    /* =========================
       OPTIONS
    ========================= */

    const optionMap = {};

    let totalOptions = 0;


    decisions.forEach(decision => {

      if (!Array.isArray(
        decision.options
      )) {
        return;
      }


      decision.options.forEach(option => {

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


    const options =
      Object.entries(optionMap)
        .sort(
          (a, b) => b[1] - a[1]
        )
        .slice(0, 5);


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

      totalOptions

    };

  }, [decisions]);


  const maxCategory =
    Math.max(
      1,
      ...analytics.categories.map(
        ([, count]) => count
      )
    );


  const maxOption =
    Math.max(
      1,
      ...analytics.options.map(
        ([, count]) => count
      )
    );


  const maxTrend =
    Math.max(
      1,
      ...analytics.trend.map(
        item => item.count
      )
    );


  /* =========================
     LOADING
  ========================= */

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

            color: #8f86a8;
          }


          .loading-ring {

            width: 45px;
            height: 45px;

            border-radius: 50%;

            border:
              3px solid #29233a;

            border-top-color:
              #8b5cf6;

            animation:
              spin .8s linear infinite;

            margin-bottom: 16px;

          }


          @keyframes spin {

            to {
              transform: rotate(360deg);
            }

          }

        `}</style>


        <div className="analytics-loading">

          <div className="loading-ring"></div>

          <div>
            Loading analytics...
          </div>

        </div>

      </DashboardLayout>

    );

  }


  return (

    <DashboardLayout
      pageTitle="Analytics"
      pageSubtitle="Understand your decisions and activity at a glance."
    >

      <style>{`

        * {
          box-sizing: border-box;
        }


        /* =========================
           PAGE
        ========================= */

        .analytics-page {

          width: 100%;

          max-width: 1500px;

          margin: 0 auto;

          color: #eee9f7;

          overflow: hidden;

        }


        /* =========================
           HERO
        ========================= */

        .analytics-hero {

          position: relative;

          padding: 26px 28px;

          margin-bottom: 20px;

          border-radius: 18px;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 90% 20%,
              rgba(139,92,246,.18),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #171225,
              #110d1b
            );

          border:
            1px solid #302746;

          box-shadow:
            0 15px 45px
            rgba(0,0,0,.25);
        }


        .analytics-hero::after {

          content: "";

          position: absolute;

          width: 220px;
          height: 220px;

          right: -80px;
          top: -100px;

          border-radius: 50%;

          background:
            rgba(139,92,246,.10);

          filter: blur(35px);

        }


        .hero-content {

          position: relative;

          z-index: 2;

        }


        .hero-label {

          display: inline-flex;

          align-items: center;

          gap: 7px;

          padding:
            6px 10px;

          border-radius: 20px;

          background:
            rgba(139,92,246,.10);

          border:
            1px solid
            rgba(167,139,250,.18);

          color: #bca8f5;

          font-size: 10px;

          font-weight: 600;

          text-transform:
            uppercase;

          letter-spacing:
            1.5px;

          margin-bottom: 12px;

        }


        .hero-dot {

          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #a78bfa;

          box-shadow:
            0 0 9px #a78bfa;

        }


        .hero-title {

          font-size:
            clamp(24px, 3vw, 34px);

          font-weight: 650;

          letter-spacing: -.8px;

          margin-bottom: 7px;

          color: #faf8ff;

        }


        .hero-text {

          color: #9189a2;

          font-size: 13px;

          max-width: 600px;

          line-height: 1.6;

        }


        /* =========================
           KPI GRID
        ========================= */

        .kpi-grid {

          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 15px;

          margin-bottom: 18px;

        }


        .kpi {

          position: relative;

          overflow: hidden;

          padding: 20px;

          min-height: 145px;

          border-radius: 15px;

          background:
            linear-gradient(
              145deg,
              #191526,
              #13101d
            );

          border:
            1px solid #2d263e;

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;

        }


        .kpi:hover {

          transform:
            translateY(-3px);

          border-color:
            #4b3970;

          box-shadow:
            0 15px 35px
            rgba(0,0,0,.25);

        }


        .kpi::before {

          content: "";

          position: absolute;

          width: 90px;
          height: 90px;

          right: -40px;
          top: -40px;

          border-radius: 50%;

          background:
            rgba(139,92,246,.10);

          filter: blur(20px);

        }


        .kpi-top {

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          margin-bottom: 18px;

        }


        .kpi-icon {

          width: 38px;
          height: 38px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 10px;

          background:
            #211a32;

          border:
            1px solid #3b2d58;

          font-size: 17px;

        }


        .kpi-live {

          font-size: 9px;

          color: #6ee7b7;

          display: flex;

          align-items: center;

          gap: 5px;

        }


        .live-dot {

          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #34d399;

          box-shadow:
            0 0 8px #34d399;

        }


        .kpi-number {

          font-size: 28px;

          font-weight: 700;

          color: #f8f5ff;

          margin-bottom: 4px;

        }


        .kpi-label {

          color: #827a91;

          font-size: 11px;

        }


        /* =========================
           MAIN GRID
        ========================= */

        .analytics-grid {

          display: grid;

          grid-template-columns:
            1.45fr 1fr;

          gap: 18px;

          margin-bottom: 18px;

        }


        .analytics-card {

          min-width: 0;

          background:
            linear-gradient(
              145deg,
              #171321,
              #13101c
            );

          border:
            1px solid #2d263e;

          border-radius: 15px;

          padding: 22px;

          box-shadow:
            0 8px 25px
            rgba(0,0,0,.12);

        }


        .card-header {

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 10px;

          margin-bottom: 22px;

        }


        .card-title {

          color: #eeeaf6;

          font-size: 15px;

          font-weight: 600;

        }


        .card-subtitle {

          color: #777083;

          font-size: 10px;

          margin-top: 4px;

        }


        .card-badge {

          padding:
            5px 9px;

          border-radius: 6px;

          background: #211a32;

          border:
            1px solid #3c2d59;

          color: #a78bfa;

          font-size: 9px;

          font-weight: 600;

        }


        /* =========================
           TREND CHART
        ========================= */

        .trend-wrapper {

          height: 250px;

          position: relative;

          padding:
            10px 5px 0;

        }


        .chart-grid {

          position: absolute;

          left: 0;
          right: 0;

          top: 10px;
          bottom: 32px;

          display: flex;

          flex-direction:
            column;

          justify-content:
            space-between;

          pointer-events: none;

        }


        .grid-line {

          width: 100%;

          border-top:
            1px dashed #292337;

        }


        .trend-bars {

          position: absolute;

          left: 0;
          right: 0;

          top: 10px;
          bottom: 0;

          display: flex;

          align-items: flex-end;

          gap: 12px;

          padding:
            0 5px 25px;

        }


        .trend-item {

          flex: 1;

          height: 100%;

          display: flex;

          flex-direction:
            column;

          justify-content:
            flex-end;

          align-items: center;

          min-width: 0;

        }


        .trend-count {

          color: #aaa1b8;

          font-size: 9px;

          margin-bottom: 5px;

        }


        .trend-bar {

          width: 100%;

          max-width: 34px;

          min-height: 4px;

          border-radius:
            6px 6px 2px 2px;

          background:
            linear-gradient(
              to top,
              #633bb0,
              #9b74ef
            );

          box-shadow:
            0 0 14px
            rgba(139,92,246,.16);

          transition:
            height .5s ease;

        }


        .trend-month {

          color: #6e6679;

          font-size: 9px;

          margin-top: 7px;

        }


        /* =========================
           CATEGORY
        ========================= */

        .category-row {

          display: grid;

          grid-template-columns:
            95px 1fr 25px;

          align-items: center;

          gap: 10px;

          margin-bottom: 16px;

        }


        .category-name {

          color: #aaa2b7;

          font-size: 11px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

        }


        .category-track {

          height: 8px;

          background: #25202f;

          border-radius: 20px;

          overflow: hidden;

        }


        .category-fill {

          height: 100%;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              #6639b2,
              #a47cf2
            );

          box-shadow:
            0 0 10px
            rgba(139,92,246,.18);

        }


        .category-count {

          color: #837b91;

          font-size: 10px;

          text-align: right;

        }


        /* =========================
           DONUT
        ========================= */

        .donut-section {

          min-height: 250px;

          display: flex;

          align-items: center;

          justify-content:
            center;

          gap: 30px;

        }


        .donut {

          width: 145px;

          height: 145px;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            conic-gradient(
              #7650c7 0deg,
              #7650c7 var(--public),
              #a78bfa var(--public),
              #a78bfa var(--private),
              #292335 var(--private),
              #292335 360deg
            );

          display: flex;

          align-items: center;

          justify-content: center;

          box-shadow:
            0 0 30px
            rgba(139,92,246,.10);

        }


        .donut-inner {

          width: 92px;

          height: 92px;

          border-radius: 50%;

          background:
            #15121f;

          border:
            1px solid #2c253b;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

        }


        .donut-number {

          font-size: 24px;

          font-weight: 700;

          color: #f7f3ff;

        }


        .donut-label {

          color: #756d80;

          font-size: 9px;

        }


        .legend {

          display: flex;

          flex-direction:
            column;

          gap: 15px;

        }


        .legend-item {

          display: flex;

          align-items: center;

          gap: 8px;

          color: #9991a5;

          font-size: 11px;

        }


        .legend-item strong {

          color: #eee9f5;

          margin-left: 3px;

        }


        .legend-dot {

          width: 8px;
          height: 8px;

          border-radius: 50%;

        }


        /* =========================
           OPTION CARD
        ========================= */

        .option-item {

          margin-bottom: 18px;

        }


        .option-top {

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 10px;

          margin-bottom: 7px;

        }


        .option-name {

          color: #aaa2b7;

          font-size: 11px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

        }


        .option-count {

          color: #7e7689;

          font-size: 10px;

        }


        .option-track {

          height: 7px;

          background: #25202f;

          border-radius: 20px;

          overflow: hidden;

        }


        .option-fill {

          height: 100%;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              #57319a,
              #a47cf2
            );

        }


        /* =========================
           STATUS
        ========================= */

        .status-grid {

          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 10px;

        }


        .status-card {

          padding: 15px;

          border-radius: 10px;

          background: #1b1725;

          border:
            1px solid #292337;

        }


        .status-icon {

          font-size: 16px;

          margin-bottom: 10px;

        }


        .status-value {

          color: #f0ebf8;

          font-size: 20px;

          font-weight: 650;

          margin-bottom: 3px;

        }


        .status-label {

          color: #766e81;

          font-size: 10px;

        }


        /* =========================
           RECENT ACTIVITY
        ========================= */

        .recent-list {

          display: flex;

          flex-direction:
            column;

        }


        .recent-row {

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;

          padding: 13px 0;

          border-bottom:
            1px solid #292337;

        }


        .recent-row:last-child {

          border-bottom: none;

        }


        .recent-left {

          display: flex;

          align-items: center;

          gap: 11px;

          min-width: 0;

        }


        .recent-icon {

          width: 34px;
          height: 34px;

          min-width: 34px;

          border-radius: 9px;

          display: flex;

          align-items: center;

          justify-content: center;

          background: #211a32;

          border:
            1px solid #3a2d54;

          font-size: 14px;

        }


        .recent-title {

          color: #ddd7e8;

          font-size: 11px;

          font-weight: 600;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

        }


        .recent-meta {

          color: #6f687b;

          font-size: 9px;

          margin-top: 3px;

        }


        .visibility {

          flex-shrink: 0;

          padding:
            4px 8px;

          border-radius: 5px;

          font-size: 8px;

          font-weight: 600;

        }


        .visibility-public {

          background: #10251d;

          border:
            1px solid #24573f;

          color: #6ee7b7;

        }


        .visibility-private {

          background: #291b24;

          border:
            1px solid #5b3042;

          color: #f0a4bd;

        }


        /* =========================
           EMPTY
        ========================= */

        .empty {

          min-height: 150px;

          display: flex;

          align-items: center;

          justify-content: center;

          text-align: center;

          color: #70687c;

          font-size: 11px;

        }


        /* =========================
           ERROR
        ========================= */

        .error {

          padding: 13px 16px;

          margin-bottom: 18px;

          border-radius: 10px;

          background: #29191f;

          border:
            1px solid #61323e;

          color: #f3a4b5;

          font-size: 11px;

        }


        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 1150px) {

          .kpi-grid {

            grid-template-columns:
              repeat(2, 1fr);

          }


          .analytics-grid {

            grid-template-columns:
              1fr;

          }

        }


        @media (max-width: 650px) {

          .kpi-grid {

            grid-template-columns:
              repeat(2, 1fr);

          }


          .analytics-card {

            padding: 17px;

          }


          .analytics-hero {

            padding: 21px;

          }


          .donut-section {

            flex-direction:
              column;

            gap: 20px;

          }


          .status-grid {

            grid-template-columns:
              1fr;

          }


          .trend-bars {

            gap: 6px;

          }


          .category-row {

            grid-template-columns:
              75px 1fr 20px;

          }

        }


        @media (max-width: 430px) {

          .kpi-grid {

            grid-template-columns:
              1fr 1fr;

            gap: 9px;

          }


          .kpi {

            padding: 14px;

            min-height: 125px;

          }


          .kpi-number {

            font-size: 23px;

          }


          .kpi-icon {

            width: 32px;

            height: 32px;

            font-size: 14px;

          }


          .recent-row {

            align-items:
              flex-start;

          }

        }

      `}</style>


      <div className="analytics-page">


        {/* =========================
            HERO
        ========================= */}

        <div className="analytics-hero">

          <div className="hero-content">

            <div className="hero-label">

              <span className="hero-dot"></span>

              Decision Intelligence

            </div>


            <div className="hero-title">

              Your Decision Overview

            </div>


            <div className="hero-text">

              Track how you create,
              organize and manage
              decisions across your workspace.

            </div>

          </div>

        </div>


        {/* =========================
            ERROR
        ========================= */}

        {error && (

          <div className="error">
            {error}
          </div>

        )}


        {/* =========================
            KPI
        ========================= */}

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

                ACTIVE

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
                🔐
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


        {/* =========================
            TREND + VISIBILITY
        ========================= */}

        <div className="analytics-grid">


          {/* TREND */}

          <div className="analytics-card">

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
                TREND
              </div>

            </div>


            {analytics.trend.length === 0 ? (

              <div className="empty">
                Create decisions with dates
                to see your activity trend.
              </div>

            ) : (

              <div className="trend-wrapper">


                <div className="chart-grid">

                  <div className="grid-line"></div>

                  <div className="grid-line"></div>

                  <div className="grid-line"></div>

                  <div className="grid-line"></div>

                </div>


                <div className="trend-bars">

                  {analytics.trend.map(
                    item => (

                      <div
                        className="trend-item"
                        key={item.month}
                      >

                        <div className="trend-count">
                          {item.count}
                        </div>


                        <div
                          className="trend-bar"
                          style={{
                            height:
                              `${Math.max(
                                5,
                                (
                                  item.count /
                                  maxTrend
                                ) * 155
                              )}px`
                          }}
                        />


                        <div className="trend-month">
                          {item.month}
                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

          </div>


          {/* VISIBILITY */}

          <div className="analytics-card">

            <div className="card-header">

              <div>

                <div className="card-title">
                  Decision Visibility
                </div>

                <div className="card-subtitle">
                  Public vs private boards
                </div>

              </div>

              <div className="card-badge">
                DISTRIBUTION
              </div>

            </div>


            <div className="donut-section">


              <div
                className="donut"
                style={{
                  "--public":
                    analytics.total === 0
                      ? "0deg"
                      :
                        `${
                          (
                            analytics.publicCount /
                            analytics.total
                          ) * 360
                        }deg`,

                  "--private":
                    analytics.total === 0
                      ? "0deg"
                      : "360deg"
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
                      background:
                        "#7650c7"
                    }}
                  />

                  Public

                  <strong>
                    {analytics.publicCount}
                  </strong>

                </div>


                <div className="legend-item">

                  <span
                    className="legend-dot"
                    style={{
                      background:
                        "#a78bfa"
                    }}
                  />

                  Private

                  <strong>
                    {analytics.privateCount}
                  </strong>

                </div>

              </div>

            </div>

          </div>


        </div>


        {/* =========================
            CATEGORY + OPTIONS
        ========================= */}

        <div className="analytics-grid">


          {/* CATEGORY */}

          <div className="analytics-card">

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
                {analytics.categories.length}
                {" "}TOP
              </div>

            </div>


            {analytics.categories.length === 0 ? (

              <div className="empty">
                No category data available.
              </div>

            ) : (

              analytics.categories.map(
                ([category, count]) => (

                  <div
                    className="category-row"
                    key={category}
                  >

                    <div className="category-name">
                      {category}
                    </div>


                    <div className="category-track">

                      <div
                        className="category-fill"
                        style={{
                          width:
                            `${(
                              count /
                              maxCategory
                            ) * 100}%`
                        }}
                      />

                    </div>


                    <div className="category-count">
                      {count}
                    </div>

                  </div>

                )
              )

            )}

          </div>


          {/* OPTIONS */}

          <div className="analytics-card">

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
                {analytics.totalOptions}
                {" "}TOTAL
              </div>

            </div>


            {analytics.options.length === 0 ? (

              <div className="empty">
                No option data available.
              </div>

            ) : (

              analytics.options.map(
                ([option, count]) => (

                  <div
                    className="option-item"
                    key={option}
                  >

                    <div className="option-top">

                      <div className="option-name">
                        {option}
                      </div>

                      <div className="option-count">
                        {count}
                      </div>

                    </div>


                    <div className="option-track">

                      <div
                        className="option-fill"
                        style={{
                          width:
                            `${(
                              count /
                              maxOption
                            ) * 100}%`
                        }}
                      />

                    </div>

                  </div>

                )
              )

            )}

          </div>


        </div>


        {/* =========================
            STATUS
        ========================= */}

        <div className="analytics-card">

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

            </div>


          </div>

        </div>


        {/* =========================
            RECENT DECISIONS
        ========================= */}

        <div
          className="analytics-card"
          style={{
            marginTop: "18px"
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

          </div>


          {decisions.length === 0 ? (

            <div className="empty">
              No decisions created yet.
            </div>

          ) : (

            <div className="recent-list">

              {decisions
                .slice(0, 5)
                .map(decision => (

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

        </div>


      </div>

    </DashboardLayout>

  );

}

export default AnalyticsPage;