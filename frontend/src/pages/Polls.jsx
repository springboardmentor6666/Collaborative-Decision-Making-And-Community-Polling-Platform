import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function Polls() {

  const navigate = useNavigate();

  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/decisions", {
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

  return (
    <DashboardLayout
      pageTitle="Active Polls"
      pageSubtitle="Vote on decisions that are open right now."
    >
      <style>{`

        .poll-grid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
          gap:20px;
        }

        .poll-card{
          background:white;
          border-radius:16px;
          padding:24px;
          box-shadow:0 1px 4px rgba(0,0,0,.06);
        }

        .poll-card h3{
          color:#111827;
          margin-bottom:10px;
        }

        .option-row{
          display:flex;
          justify-content:space-between;
          align-items:center;
          background:#f9fafb;
          padding:10px 14px;
          border-radius:10px;
          margin-bottom:8px;
        }

        .vote-btn{
          background:#4f46e5;
          color:white;
          border:none;
          padding:6px 14px;
          border-radius:8px;
          font-size:12px;
          font-weight:600;
          cursor:pointer;
        }

        .empty-state{
          background:white;
          border-radius:16px;
          padding:50px;
          text-align:center;
          color:#6b7280;
          box-shadow:0 1px 4px rgba(0,0,0,.06);
        }

      `}</style>

      {loading && <div className="empty-state">Loading polls...</div>}

      {!loading && decisions.length === 0 && (
        <div className="empty-state">
          No polls available yet. Create a decision with options to start one.
        </div>
      )}

      {!loading && decisions.length > 0 && (
        <div className="poll-grid">
          {decisions.map((decision) => (
            <div className="poll-card" key={decision.id}>
              <h3>{decision.title}</h3>

              {(decision.options || []).map((option) => (
                <div className="option-row" key={option.id}>
                  <span>{option.optionName}</span>
                  <button className="vote-btn">
                    Vote ({option.voteCount ?? 0})
                  </button>
                </div>
              ))}

              {(!decision.options || decision.options.length === 0) && (
                <p style={{ color: "#6b7280", fontSize: "13px" }}>
                  No options added for this decision yet.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
}

export default Polls;