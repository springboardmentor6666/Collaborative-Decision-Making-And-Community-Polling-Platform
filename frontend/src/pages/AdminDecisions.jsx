import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

const API = "http://localhost:8080";

function AdminDecisions() {
  const [decisions, setDecisions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [comments, setComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});

  const headers = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  });

  const notify = (text, error = false) => {
    setIsError(error);
    setMessage(text);
  };

  useEffect(() => {
    loadDecisions();
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  const loadDecisions = async () => {
    try {
      const response = await fetch(`${API}/api/admin/decisions`, {
        headers: headers(),
      });

      if (!response.ok) {
        throw new Error("Unable to load decisions.");
      }

      const data = await response.json();
      setDecisions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      notify("Unable to load decisions.", true);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (decisionId) => {
    // Already fetched once — don't refetch every time the row is reopened.
    if (comments[decisionId]) return;

    setCommentsLoading((current) => ({ ...current, [decisionId]: true }));

    try {
      const response = await fetch(
        `${API}/api/decisions/${decisionId}/comments`,
        { headers: headers() }
      );

      if (!response.ok) {
        throw new Error("Unable to load comments.");
      }

      const data = await response.json();
      setComments((current) => ({
        ...current,
        [decisionId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error(err);
      notify("Unable to load comments.", true);
    } finally {
      setCommentsLoading((current) => ({
        ...current,
        [decisionId]: false,
      }));
    }
  };

  const toggleExpand = (decisionId) => {
    setExpandedId((current) => {
      const next = current === decisionId ? null : decisionId;
      if (next) loadComments(next);
      return next;
    });
  };

  const deleteDecision = async (id, title) => {
    const confirmed = window.confirm(
      `Delete "${title}"? This will also remove its options, votes, and comments.`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/api/admin/decisions/${id}`, {
        method: "DELETE",
        headers: headers(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete decision.");
      }

      notify("Decision deleted.");
      setDecisions((current) => current.filter((d) => d.id !== id));
    } catch (err) {
      notify(err.message, true);
    }
  };

  const deleteComment = async (decisionId, commentId) => {
    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/api/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: headers(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete comment.");
      }

      notify("Comment deleted.");
      setComments((current) => ({
        ...current,
        [decisionId]: (current[decisionId] || []).filter(
          (c) => c.id !== commentId
        ),
      }));
    } catch (err) {
      notify(err.message, true);
    }
  };

  const filteredDecisions = decisions.filter((d) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      d.title?.toLowerCase().includes(term) ||
      d.category?.toLowerCase().includes(term) ||
      d.createdByName?.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout
      pageTitle="Manage Decisions"
      pageSubtitle="View, search, and remove decisions across the platform."
    >
      <Toast message={message} isError={isError} />

      <style>{`
        .admin-decisions-page { max-width: 1100px; }
        .admin-back-link {
          display: inline-block;
          color: #8b5cf6;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          margin-bottom: 16px;
        }
        .admin-search {
          width: 100%;
          max-width: 320px;
          padding: 10px 12px;
          border: 1px solid var(--app-border);
          border-radius: 8px;
          background: var(--app-card-2);
          color: var(--app-text);
          margin-bottom: 18px;
        }
        .admin-decisions-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid var(--app-border);
          border-radius: 12px;
          overflow: hidden;
        }
        .admin-decisions-table th, .admin-decisions-table td {
          text-align: left;
          padding: 12px 14px;
          font-size: 13px;
          border-bottom: 1px solid var(--app-border);
          color: var(--app-text);
        }
        .admin-decisions-table th {
          color: var(--app-secondary-text);
          font-weight: 700;
          background: var(--app-card-2);
        }
        .admin-decision-row { cursor: pointer; }
        .admin-decision-row:hover { background: var(--app-card-2); }
        .admin-badge {
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(139, 92, 246, .12);
          color: #8b5cf6;
        }
        .admin-delete-btn {
          border: 0;
          border-radius: 7px;
          background: #b91c1c;
          color: #fff;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .admin-empty {
          color: var(--app-secondary-text);
          font-size: 13px;
        }
        .admin-options-panel {
          background: var(--app-card-2);
        }
        .admin-options-panel td {
          padding: 14px 20px;
        }
        .admin-option-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 13px;
          color: var(--app-text);
          border-bottom: 1px dashed var(--app-border);
        }
        .admin-option-row:last-child { border-bottom: none; }
        .admin-panel-section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
          color: var(--app-secondary-text);
          margin: 18px 0 8px;
        }
        .admin-panel-section-title:first-child { margin-top: 0; }
        .admin-comment-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px dashed var(--app-border);
        }
        .admin-comment-row:last-child { border-bottom: none; }
        .admin-comment-body {
          font-size: 13px;
          color: var(--app-text);
          line-height: 1.5;
        }
        .admin-comment-meta {
          margin-top: 2px;
          font-size: 11px;
          color: var(--app-secondary-text);
        }
        .admin-comment-delete-btn {
          flex-shrink: 0;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #ef4444;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }
        .admin-comment-delete-btn:hover {
          background: rgba(239, 68, 68, 0.12);
        }
      `}</style>

      <div className="admin-decisions-page">
        <Link className="admin-back-link" to="/admin">
          ← Back to Admin Dashboard
        </Link>

        <input
          className="admin-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, category, or creator"
        />

        {loading && <div className="admin-empty">Loading decisions…</div>}

        {!loading && filteredDecisions.length === 0 && (
          <div className="admin-empty">No decisions found.</div>
        )}

        {!loading && filteredDecisions.length > 0 && (
          <table className="admin-decisions-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Created By</th>
                <th>Votes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredDecisions.map((decision) => {
                const decisionComments = comments[decision.id] || [];
                const loadingComments = commentsLoading[decision.id];

                return (
                  <>
                    <tr
                      key={decision.id}
                      className="admin-decision-row"
                      onClick={() => toggleExpand(decision.id)}
                    >
                      <td>{decision.title}</td>
                      <td>
                        <span className="admin-badge">
                          {decision.category || "Uncategorized"}
                        </span>
                      </td>
                      <td>{decision.createdByName || "—"}</td>
                      <td>{decision.totalVotes}</td>
                      <td>
                        <button
                          className="admin-delete-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteDecision(decision.id, decision.title);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {expandedId === decision.id && (
                      <tr className="admin-options-panel">
                        <td colSpan={5}>
                          <div className="admin-panel-section-title">
                            Options
                          </div>

                          {decision.options?.length ? (
                            decision.options.map((option) => (
                              <div
                                className="admin-option-row"
                                key={option.id}
                              >
                                <span>{option.optionText}</span>
                                <span>{option.voteCount} votes</span>
                              </div>
                            ))
                          ) : (
                            <div className="admin-empty">
                              No options on this decision.
                            </div>
                          )}

                          <div className="admin-panel-section-title">
                            Comments
                          </div>

                          {loadingComments && (
                            <div className="admin-empty">
                              Loading comments…
                            </div>
                          )}

                          {!loadingComments &&
                            decisionComments.length === 0 && (
                              <div className="admin-empty">
                                No comments on this decision.
                              </div>
                            )}

                          {!loadingComments &&
                            decisionComments.map((comment) => (
                              <div
                                className="admin-comment-row"
                                key={comment.id}
                              >
                                <div>
                                  <div className="admin-comment-body">
                                    {comment.content}
                                  </div>
                                  <div className="admin-comment-meta">
                                    {comment.userName || "Unknown user"}
                                    {comment.createdAt &&
                                      ` · ${new Date(
                                        comment.createdAt
                                      ).toLocaleString()}`}
                                  </div>
                                </div>

                                <button
                                  className="admin-comment-delete-btn"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    deleteComment(decision.id, comment.id);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            ))}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminDecisions;