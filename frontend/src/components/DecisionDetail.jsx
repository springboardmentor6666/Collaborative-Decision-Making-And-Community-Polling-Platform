import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function DecisionDetail() {
  const { id } = useParams();
  const [decision, setDecision] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const loadDecisionData = () => {
    fetch(`${API_BASE_URL}/decisions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Decision board not found.");
        return res.json();
      })
      .then((data) => {
        setDecision(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    fetch(`${API_BASE_URL}/comments/decision/${id}`)
      .then((res) => res.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => {});

    if (token) {
      fetch(`${API_BASE_URL}/votes/decision/${id}/my-vote`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((vote) => {
          if (vote) {
            setMyVote(vote);
            setSelectedOptionId(vote.optionId);
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadDecisionData();
  }, [id]);

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOptionId) {
      alert("Please select an option before casting your vote.");
      return;
    }

    setVoting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/votes/decision/${id}/option/${selectedOptionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ voteType: "SINGLE" }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit vote. Please make sure you are logged in.");
      }

      await res.json();
      setVoting(false);
      loadDecisionData();
    } catch (err) {
      alert(err.message);
      setVoting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/comments/decision/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ commentText: newComment }),
      });

      if (!res.ok) {
        throw new Error("Failed to post comment. Please log in first.");
      }

      setNewComment("");
      loadDecisionData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportCsv = () => {
    window.open(`${API_BASE_URL}/reports/export/decision/${id}`, "_blank");
  };

  if (loading) {
    return <main className="page-container"><p style={{ color: "var(--text-muted)" }}>Loading decision board details...</p></main>;
  }

  if (error || !decision) {
    return (
      <main className="page-container">
        <h2>Decision Not Found</h2>
        <p style={{ color: "var(--text-muted)", margin: "16px 0" }}>{error || "The requested board does not exist."}</p>
        <Link to="/decisions"><button className="primary-btn">← Back to Decisions</button></Link>
      </main>
    );
  }

  const totalVotes = decision.totalVotes || 0;

  return (
    <main className="page-container">
      {/* Board Title & Actions */}
      <div className="page-header">
        <div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
            <span className="category-tag">{decision.category}</span>
            <span className={decision.visibility === "PUBLIC" ? "badge-public" : "badge-private"}>
              {decision.visibility}
            </span>
          </div>
          <h1 className="page-title">{decision.title}</h1>
          <p className="page-subtitle">{decision.description || "No description provided."}</p>
          <small style={{ color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
            Created by <strong>@{decision.username || "anonymous"}</strong> • {totalVotes} total community votes
          </small>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={handleExportCsv} className="secondary-btn">
            📥 Export Report (CSV)
          </button>
          <Link to="/decisions">
            <button className="secondary-btn">← Back to List</button>
          </Link>
        </div>
      </div>

      {/* Side-by-Side Option Comparison & Pros/Cons */}
      <section className="content-section">
        <h2 className="section-title">⚖️ Option Comparison Matrix</h2>

        <div className="comparison-grid">
          {decision.options && decision.options.map((opt) => {
            const votePercentage = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
            const isMyChoice = myVote && myVote.optionId === opt.id;

            return (
              <div
                key={opt.id}
                className="option-card"
                style={{
                  borderColor: isMyChoice ? "var(--primary)" : "var(--border-color)",
                  boxShadow: isMyChoice ? "0 0 0 2px var(--primary)" : "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h4>{opt.optionTitle}</h4>
                  {isMyChoice && <span className="badge-public">Your Vote ✓</span>}
                </div>

                <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "8px 0" }}>
                  {opt.description || "No option details."}
                </p>

                {/* Vote Progress Visualization */}
                <div className="vote-progress-container">
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "700" }}>
                    <span>{opt.voteCount} Votes</span>
                    <span>{votePercentage}%</span>
                  </div>
                  <div className="vote-bar-bg">
                    <div className="vote-bar-fill" style={{ width: `${votePercentage}%` }}></div>
                  </div>
                </div>

                <div className="pros-cons-box">
                  {opt.pros && (
                    <div className="pros-list">
                      <strong>✅ Pros:</strong> {opt.pros}
                    </div>
                  )}
                  {opt.cons && (
                    <div className="cons-list">
                      <strong>⚠️ Cons:</strong> {opt.cons}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Voting Module */}
      <section className="content-section">
        <h2 className="section-title">🗳️ Cast Your Vote</h2>

        <form onSubmit={handleVoteSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {decision.options && decision.options.map((opt) => (
              <label
                key={opt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 18px",
                  borderRadius: "10px",
                  backgroundColor: selectedOptionId === opt.id ? "var(--primary-light)" : "var(--bg-subtle)",
                  border: "1px solid",
                  borderColor: selectedOptionId === opt.id ? "var(--primary)" : "var(--border-color)",
                  cursor: "pointer"
                }}
              >
                <input
                  type="radio"
                  name="decisionOption"
                  value={opt.id}
                  checked={selectedOptionId === opt.id}
                  onChange={() => setSelectedOptionId(opt.id)}
                />
                <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{opt.optionTitle}</span>
              </label>
            ))}
          </div>

          <button type="submit" className="primary-btn" disabled={voting}>
            {voting ? "Submitting Vote..." : myVote ? "Update My Vote" : "Submit Vote"}
          </button>
        </form>
      </section>

      {/* Discussion & Feedback Forum */}
      <section className="content-section comments-section">
        <h2 className="section-title">💬 Community Discussion & Advice</h2>

        <form onSubmit={handleCommentSubmit} style={{ marginBottom: "24px" }}>
          <textarea
            placeholder="Share your experience, expert advice, or suggestion..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-subtle)",
              color: "var(--text-main)",
              marginBottom: "12px"
            }}
          />
          <button type="submit" className="primary-btn">Post Comment</button>
        </form>

        {comments.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No comments yet. Be the first to share your insights!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-card">
              <div className="comment-author">@{comment.username}</div>
              <div className="comment-text">{comment.commentText}</div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

export default DecisionDetail;
