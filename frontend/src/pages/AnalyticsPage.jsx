import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

function AnalyticsPage() {

  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/api/decisions", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      setDecisions(data);

    } catch (err) {

      setDecisions([]);

    } finally {

      setLoading(false);

    }

  };

  const categoryCounts = decisions.reduce((acc, d) => {
    const cat = d.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const maxCount = Math.max(1, ...Object.values(categoryCounts));

  return (
    <DashboardLayout
      pageTitle="Analytics"
      pageSubtitle="A quick look at your decision activity."
    >
      <style>{`

        .analytics-card{
          background:white;
          border-radius:16px;
          padding:26px;
          box-shadow:0 1px 4px rgba(0,0,0,.06);
          margin-bottom:24px;
        }

        .analytics-card h3{
          color:#111827;
          margin-bottom:18px;
        }

        .bar-row{
          display:flex;
          align-items:center;
          gap:14px;
          margin-bottom:14px;
        }

        .bar-label{
          width:110px;
          font-size:13px;
          color:#374151;
          flex-shrink:0;
        }

        .bar-track{
          flex:1;
          background:#f1f2f6;
          border-radius:8px;
          height:14px;
          overflow:hidden;
        }

        .bar-fill{
          height:100%;
          background:linear-gradient(90deg,#4f46e5,#7c3aed);
          border-radius:8px;
        }

        .bar-count{
          width:24px;
          font-size:13px;
          color:#6b7280;
          text-align:right;
        }

        .empty-state{
          color:#6b7280;
          font-size:14px;
        }

      `}</style>

      <div className="analytics-card">
        <h3>Decisions by Category</h3>

        {loading && <div className="empty-state">Loading...</div>}

        {!loading && Object.keys(categoryCounts).length === 0 && (
          <div className="empty-state">
            No data yet — create a few decisions to see trends here.
          </div>
        )}

        {!loading && Object.entries(categoryCounts).map(([cat, count]) => (
          <div className="bar-row" key={cat}>
            <div className="bar-label">{cat}</div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <div className="bar-count">{count}</div>
          </div>
        ))}
      </div>

      <div className="analytics-card">
        <h3>Coming Soon</h3>
        <p className="empty-state">
          Vote distribution, participation rate, and poll completion charts
          will appear here once the voting and community modules are built.
        </p>
      </div>

    </DashboardLayout>
  );
}

export default AnalyticsPage;