import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function DecisionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  let currentUser = null;
  if (userJson) {
    try {
      currentUser = JSON.parse(userJson);
    } catch (e) {
      // Ignore
    }
  }

  const [decision, setDecision] = useState(null);
  const [options, setOptions] = useState([]);
  const [comments, setComments] = useState([]);
  const [voteStatus, setVoteStatus] = useState({ voted: false, votedOptionId: null });
  const [loading, setLoading] = useState(true);

  // Form states for adding new options
  const [newOptionTitle, setNewOptionTitle] = useState("");
  const [newOptionDesc, setNewOptionDesc] = useState("");
  const [newOptionPros, setNewOptionPros] = useState("");
  const [newOptionCons, setNewOptionCons] = useState("");
  const [optionError, setOptionError] = useState("");

  // Comment states
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    fetchDecisionDetails();
  }, [id]);

  const fetchDecisionDetails = async () => {
    try {
      setLoading(true);
      // Fetch decision info
      const decRes = await fetch(`/api/decisions/${id}`);
      if (!decRes.ok) throw new Error("Decision not found");
      const decData = await decRes.json();
      setDecision(decData);

      // Fetch options
      const optRes = await fetch(`/api/decisions/${id}/options`);
      const optData = await optRes.json();
      setOptions(optData);

      // Fetch comments
      const commRes = await fetch(`/api/decisions/${id}/comments`);
      const commData = await commRes.json();
      setComments(commData);

      // Fetch user's vote status if logged in
      if (token) {
        const voteRes = await fetch(`/api/decisions/${id}/vote/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const voteData = await voteRes.json();
        setVoteStatus(voteData);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      navigate("/decisions");
    }
  };

  const handleAddOption = (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }
    if (!newOptionTitle.trim()) {
      setOptionError("Option title is required");
      return;
    }

    fetch(`/api/decisions/${id}/options`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        optionTitle: newOptionTitle,
        description: newOptionDesc,
        pros: newOptionPros,
        cons: newOptionCons
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add option");
        return res.json();
      })
      .then(() => {
        setNewOptionTitle("");
        setNewOptionDesc("");
        setNewOptionPros("");
        setNewOptionCons("");
        setOptionError("");
        fetchDecisionDetails(); // Reload details
      })
      .catch((err) => {
        setOptionError(err.message);
      });
  };

  const handleCastVote = (optionId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`/api/decisions/${id}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ optionId })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to cast vote");
        fetchDecisionDetails(); // Reload to update scores and percentages
      })
      .catch((err) => console.error(err));
  };

  const handleRemoveVote = () => {
    if (!token) return;

    fetch(`/api/decisions/${id}/vote`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to remove vote");
        fetchDecisionDetails();
      })
      .catch((err) => console.error(err));
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }
    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }

    fetch(`/api/decisions/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ commentText })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add comment");
        return res.json();
      })
      .then(() => {
        setCommentText("");
        setCommentError("");
        fetchDecisionDetails();
      })
      .catch((err) => setCommentError(err.message));
  };

  const handleDeleteComment = (commentId) => {
    if (!token) return;

    fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete comment");
        fetchDecisionDetails();
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteBoard = () => {
    if (!window.confirm("Are you sure you want to delete this decision board?")) return;

    fetch(`/api/decisions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete board");
        navigate("/decisions");
      })
      .catch((err) => console.error(err));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-state">Loading details...</div>
        <Footer />
      </>
    );
  }

  const isCreator = currentUser && decision && currentUser.id === decision.userId;
  const totalVotes = options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);

  return (
    <>
      <Navbar />
      <div className="decision-detail-container">
        <header className="decision-detail-header">
          <div className="header-meta">
            <span className={`category-tag ${decision.category?.toLowerCase() || 'general'}`}>
              {decision.category || "General"}
            </span>
            <span className="visibility-badge">{decision.visibility}</span>
          </div>
          <h1>{decision.title}</h1>
          <p className="description">{decision.description || "No description provided."}</p>
          <div className="creator-bar">
            <span>Posted by: <strong>{decision.userFullName || decision.username}</strong></span>
            <span>Created on: {new Date(decision.createdAt).toLocaleDateString()}</span>
            {isCreator && (
              <button className="danger-btn delete-board-btn" onClick={handleDeleteBoard}>
                🗑️ Delete Board
              </button>
            )}
          </div>
        </header>

        {/* Comparison grid / listing options */}
        <section className="options-comparison-section">
          <h2>Compare Options</h2>
          {options.length > 0 ? (
            <div className="options-grid">
              {options.map((opt) => {
                const votePercent = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                const hasVotedThis = voteStatus.voted && voteStatus.votedOptionId === opt.id;

                return (
                  <div key={opt.id} className={`option-comparison-card ${hasVotedThis ? "voted-highlight" : ""}`}>
                    <div className="option-card-header">
                      <h3>{opt.optionTitle}</h3>
                      <div className="vote-score-badge">🏆 {opt.voteCount || 0} votes</div>
                    </div>
                    <p className="opt-desc">{opt.description || "No description provided."}</p>

                    <div className="pros-cons-grid">
                      <div className="pros-column">
                        <h4>Pros</h4>
                        {opt.pros ? (
                          <ul>
                            {opt.pros.split("\n").filter(Boolean).map((pro, index) => (
                              <li key={index}>🟢 {pro}</li>
                            ))}
                          </ul>
                        ) : <p className="none-text">None listed</p>}
                      </div>
                      <div className="cons-column">
                        <h4>Cons</h4>
                        {opt.cons ? (
                          <ul>
                            {opt.cons.split("\n").filter(Boolean).map((con, index) => (
                              <li key={index}>🔴 {con}</li>
                            ))}
                          </ul>
                        ) : <p className="none-text">None listed</p>}
                      </div>
                    </div>

                    <div className="vote-results-bar">
                      <div className="bar-fill" style={{ width: `${votePercent}%` }}></div>
                      <span className="percent-label">{votePercent}%</span>
                    </div>

                    <div className="vote-action-footer">
                      {hasVotedThis ? (
                        <button className="voted-btn" onClick={handleRemoveVote}>
                          ✓ Voted (Click to remove)
                        </button>
                      ) : (
                        <button className="primary-btn vote-btn" onClick={() => handleCastVote(opt.id)}>
                          Vote for this
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>No options have been added to this comparison yet.</p>
            </div>
          )}
        </section>

        {/* Creator adding options form */}
        {isCreator && (
          <section className="add-option-form-section">
            <h2>Add Comparison Option</h2>
            {optionError && <p className="error-message">{optionError}</p>}
            <form onSubmit={handleAddOption} className="add-option-form">
              <div className="form-group">
                <label>Option Title *</label>
                <input
                  type="text"
                  value={newOptionTitle}
                  onChange={(e) => setNewOptionTitle(e.target.value)}
                  placeholder="e.g. Go to Goa, Buy iPhone 15"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newOptionDesc}
                  onChange={(e) => setNewOptionDesc(e.target.value)}
                  placeholder="Quick summary of this option..."
                />
              </div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Pros (One per line)</label>
                  <textarea
                    value={newOptionPros}
                    onChange={(e) => setNewOptionPros(e.target.value)}
                    placeholder="e.g. Cheaper flights&#10;Warm weather"
                    rows="3"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Cons (One per line)</label>
                  <textarea
                    value={newOptionCons}
                    onChange={(e) => setNewOptionCons(e.target.value)}
                    placeholder="e.g. High monsoon risk&#10;Crowded beaches"
                    rows="3"
                  />
                </div>
              </div>
              <button type="submit" className="primary-btn">➕ Add Option to Board</button>
            </form>
          </section>
        )}

        {/* Discussion / Threaded Feedback system */}
        <section className="comments-section">
          <h2>Discussion & Recommendations</h2>
          
          <form onSubmit={handleAddComment} className="comment-post-form">
            {commentError && <p className="error-message">{commentError}</p>}
            <div className="comment-input-row">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={token ? "Write your recommendation or query..." : "Log in to post a comment"}
                disabled={!token}
                required
              />
              <button type="submit" className="primary-btn" disabled={!token}>
                Post Comment
              </button>
            </div>
          </form>

          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map((c) => {
                const canDelete = currentUser && (currentUser.id === c.userId || isCreator);
                return (
                  <div key={c.id} className="comment-card">
                    <div className="comment-header">
                      <span className="author">💬 <strong>{c.userFullName || c.username}</strong></span>
                      <span className="time">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text">{c.commentText}</p>
                    {canDelete && (
                      <button className="comment-delete-btn" onClick={() => handleDeleteComment(c.id)}>
                        Delete
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="no-comments">No discussion yet. Be the first to share your advice!</p>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default DecisionDetail;
