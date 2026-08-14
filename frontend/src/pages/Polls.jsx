import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

function Polls() {

  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login to view active polls.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/decisions/public",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load polls");
      }

      const data = await response.json();

      setDecisions(data);

    } catch (err) {

      console.error(err);
      setDecisions([]);
      setMessage("Unable to load active polls.");

    } finally {
      setLoading(false);
    }
  };


  const vote = async (decisionId, optionId) => {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    setVotingId(optionId);

    try {

      const response = await fetch(
        `http://localhost:8080/api/decisions/${decisionId}/vote/${optionId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to vote"
        );
      }

      setMessage("Vote recorded successfully!");

      await fetchPolls();

    } catch (error) {

      console.error("Vote error:", error);
      alert(error.message);

    } finally {

      setVotingId(null);

    }
  };


  return (

    <DashboardLayout
      pageTitle="Active Polls"
      pageSubtitle="Vote on decisions that are open right now."
    >

      <style>{`

        /* =========================
           PAGE
        ========================= */

        .poll-page {
  width: 100%;
  min-height: calc(100vh - 100px);

  padding: 10px 0 40px;

  background: transparent;

  color: #f8fafc;
}


        /* =========================
           SUCCESS MESSAGE
        ========================= */

        .success-message {
          background: #10251d;
          border: 1px solid #1d6b4d;
          color: #6ee7b7;

          padding: 14px 18px;

          border-radius: 8px;

          margin-bottom: 24px;

          font-size: 14px;
        }


        /* =========================
           POLL GRID
        ========================= */

        .poll-grid {
  width: 100%;
  max-width: 1250px;
  margin: 0 auto;

  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 22px;
}


        /* =========================
           POLL CARD
        ========================= */

        .poll-card {
          background: #15121f;

          border: 1px solid #2a2538;

          border-radius: 14px;

          padding: 24px;

          transition: 0.2s ease;
           min-width: 0;
          width: 100%;
        }

        .poll-card:hover {
          border-color: #7046c9;

          box-shadow:
            0 8px 25px rgba(0, 0, 0, 0.25);

          transform: translateY(-2px);
        }


        /* =========================
           CATEGORY
        ========================= */

        .poll-category {
          display: inline-block;

          background: #25183f;

          color: #c4a7ff;

          border: 1px solid #4b3278;

          padding: 5px 10px;

          border-radius: 6px;

          font-size: 11px;

          font-weight: 600;

          margin-bottom: 14px;
        }


        /* =========================
           TITLE
        ========================= */

        .poll-card h3 {
          color: #ffffff;

          font-size: 20px;

          font-weight: 600;

          line-height: 1.35;

          margin: 0 0 10px;
        }


        /* =========================
           DESCRIPTION
        ========================= */

        .poll-description {
          color: #a7a1b5;

          font-size: 14px;

          line-height: 1.6;

          margin: 0 0 18px;
        }


        /* =========================
           DEADLINE
        ========================= */

        .deadline {
          color: #918a9f;

          font-size: 12px;

          padding-bottom: 16px;

          margin-bottom: 16px;

          border-bottom:
            1px solid #292533;
        }


        /* =========================
           OPTION
        ========================= */

        .option-row {
          background: #1b1825;

          border: 1px solid #302b3b;

          border-radius: 9px;

          padding: 12px;

          margin-bottom: 10px;

          transition: 0.2s ease;
        }

        .option-row:hover {
          border-color: #60419b;

          background: #211c2e;
        }


        .option-content {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;
        }


        .option-name {
          color: #e5e1ec;

          font-size: 14px;

          font-weight: 500;
        }


        .vote-count {
          color: #918a9f;

          font-size: 11px;

          white-space: nowrap;
        }


        /* =========================
           VOTE BUTTON
        ========================= */

        .vote-btn {
          width: 100%;

          margin-top: 9px;

          padding: 10px;

          border: none;

          border-radius: 7px;

          background: #6938c7;

          color: white;

          font-size: 13px;

          font-weight: 600;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .vote-btn:hover:not(:disabled) {
          background: #7c4bd4;
        }

        .vote-btn:disabled {
          cursor: not-allowed;

          opacity: 0.65;
        }


        /* =========================
           VOTED
        ========================= */

        .option-row.voted {
          background: #10251d;

          border-color: #23734f;
        }

        .option-row.voted .option-name {
          color: #86efac;
        }

        .voted .vote-btn {
          background: #168653;
        }

        .voted .vote-btn:hover {
          background: #168653;
        }


        /* =========================
           EMPTY / LOADING
        ========================= */

        .empty-state {
          max-width: 600px;

          margin: 60px auto;

          padding: 45px 30px;

          text-align: center;

          background: #15121f;

          border: 1px solid #2a2538;

          border-radius: 14px;

          color: #96909f;

          font-size: 14px;
        }


        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 1100px) {

  .poll-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

}


@media (max-width: 700px) {

  .poll-grid {
    grid-template-columns: 1fr;
  }

}

      `}</style>


      <div className="poll-page">

        {/* Success Message */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}


        {/* Loading */}

        {loading && (
          <div className="empty-state">
            Loading active polls...
          </div>
        )}


        {/* No Polls */}

        {!loading && decisions.length === 0 && (
          <div className="empty-state">
            No active public polls available right now.
          </div>
        )}


        {/* Polls */}

        {!loading && decisions.length > 0 && (

          <div className="poll-grid">

            {decisions.map((decision) => (

              <div
                className="poll-card"
                key={decision.id}
              >

                {/* Category */}

                {decision.category && (
                  <div className="poll-category">
                    {decision.category}
                  </div>
                )}


                {/* Title */}

                <h3>
                  {decision.title}
                </h3>


                {/* Description */}

                <p className="poll-description">
                  {decision.description}
                </p>


                {/* Deadline */}

                <div className="deadline">
                  🕐 Deadline:{" "}
                  {decision.deadline
                    ? decision.deadline
                    : "No deadline"}
                </div>


                {/* Options */}

                {decision.options &&
                decision.options.length > 0 ? (

                  decision.options.map((option) => (

                    <div
                      className={
                        option.selected
                          ? "option-row voted"
                          : "option-row"
                      }

                      key={option.id}
                    >

                      <div className="option-content">

                        <span className="option-name">
                          {option.optionText}
                        </span>

                        <span className="vote-count">
                          {option.voteCount} vote
                          {option.voteCount !== 1
                            ? "s"
                            : ""}
                        </span>

                      </div>


                      <button
                        className="vote-btn"

                        disabled={
                          option.selected ||
                          votingId === option.id
                        }

                        onClick={() =>
                          vote(
                            decision.id,
                            option.id
                          )
                        }
                      >

                        {option.selected
                          ? "✓ Voted"
                          : votingId === option.id
                          ? "Voting..."
                          : "Vote"}

                      </button>

                    </div>

                  ))

                ) : (

                  <p className="poll-description">
                    No options available.
                  </p>

                )}

              </div>

            ))}

          </div>

        )}

      </div>

    </DashboardLayout>
  );
}

export default Polls;
