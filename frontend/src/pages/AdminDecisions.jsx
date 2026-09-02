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
    // Already fetched once — don't refetch every time the decision is reopened.
    if (comments[decisionId]) return;

    setCommentsLoading((current) => ({
      ...current,
      [decisionId]: true,
    }));

    try {
      const response = await fetch(
        `${API}/api/decisions/${decisionId}/comments`,
        {
          headers: headers(),
        }
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

      if (next) {
        loadComments(next);
      }

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

      setDecisions((current) =>
        current.filter((d) => d.id !== id)
      );

      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (err) {
      notify(err.message, true);
    }
  };

  const deleteComment = async (decisionId, commentId) => {
    const confirmed = window.confirm("Delete this comment?");

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/api/admin/comments/${commentId}`,
        {
          method: "DELETE",
          headers: headers(),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete comment."
        );
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

  /* =====================================================
     REUSABLE EXPANDED CONTENT
  ===================================================== */

  const DecisionDetails = ({ decision }) => {
    const decisionComments = comments[decision.id] || [];
    const loadingComments = commentsLoading[decision.id];

    return (
      <div className="admin-details-panel">
        {/* OPTIONS */}
        <div className="admin-panel-section-title">
          Options
        </div>

        {decision.options?.length ? (
          <div className="admin-options-list">
            {decision.options.map((option) => (
              <div
                className="admin-option-row"
                key={option.id}
              >
                <span className="admin-option-text">
                  {option.optionText}
                </span>

                <span className="admin-option-votes">
                  {option.voteCount} votes
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-empty">
            No options on this decision.
          </div>
        )}

        {/* COMMENTS */}
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
          decisionComments.length > 0 && (
            <div className="admin-comments-list">
              {decisionComments.map((comment) => (
                <div
                  className="admin-comment-row"
                  key={comment.id}
                >
                  <div className="admin-comment-content">
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

                      deleteComment(
                        decision.id,
                        comment.id
                      );
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
      </div>
    );
  };

  return (
    <DashboardLayout
      pageTitle="Manage Decisions"
      pageSubtitle="View, search, and remove decisions across the platform."
    >
      <Toast message={message} isError={isError} />

      <style>{`
        /* =====================================================
           MAIN PAGE
        ===================================================== */

        .admin-decisions-page {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        /* =====================================================
           BACK LINK
        ===================================================== */

        .admin-back-link {
          display: inline-block;
          color: #8b5cf6;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          margin-bottom: 16px;
          transition: color 0.2s ease;
        }

        .admin-back-link:hover {
          color: #a855f7;
        }

        /* =====================================================
           SEARCH
        ===================================================== */

        .admin-search-wrapper {
          width: 100%;
          margin-bottom: 18px;
        }

        .admin-search {
          display: block;
          width: 100%;
          max-width: 360px;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid var(--app-border);
          border-radius: 9px;
          background: var(--app-card-2);
          color: var(--app-text);
          font-size: 13px;
          outline: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .admin-search::placeholder {
          color: var(--app-secondary-text);
        }

        .admin-search:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
        }

        /* =====================================================
           DESKTOP TABLE
        ===================================================== */

        .admin-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid var(--app-border);
          border-radius: 12px;
          background: var(--app-card);
          -webkit-overflow-scrolling: touch;
        }

        .admin-decisions-table {
          width: 100%;
          min-width: 720px;
          border-collapse: collapse;
        }

        .admin-decisions-table th,
        .admin-decisions-table td {
          text-align: left;
          padding: 13px 14px;
          font-size: 13px;
          border-bottom: 1px solid var(--app-border);
          color: var(--app-text);
        }

        .admin-decisions-table th {
          color: var(--app-secondary-text);
          font-weight: 700;
          background: var(--app-card-2);
          white-space: nowrap;
        }

        .admin-decisions-table tbody tr:last-child td {
          border-bottom: none;
        }

        .admin-decision-row {
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .admin-decision-row:hover {
          background: rgba(139, 92, 246, 0.04);
        }

        /* =====================================================
           BADGE
        ===================================================== */

        .admin-badge {
          display: inline-flex;
          align-items: center;
          max-width: 180px;
          padding: 4px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(139, 92, 246, 0.12);
          color: #8b5cf6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* =====================================================
           DELETE BUTTON
        ===================================================== */

        .admin-delete-btn {
          border: 0;
          border-radius: 7px;
          background: #b91c1c;
          color: #fff;
          padding: 7px 11px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition:
            background 0.2s ease,
            transform 0.1s ease;
        }

        .admin-delete-btn:hover {
          background: #dc2626;
        }

        .admin-delete-btn:active {
          transform: scale(0.97);
        }

        /* =====================================================
           EMPTY / LOADING
        ===================================================== */

        .admin-empty {
          color: var(--app-secondary-text);
          font-size: 13px;
          padding: 10px 0;
        }

        /* =====================================================
           DESKTOP EXPANDED PANEL
        ===================================================== */

        .admin-options-panel {
          background: var(--app-card-2);
        }

        .admin-options-panel td {
          padding: 16px 20px;
        }

        .admin-details-panel {
          width: 100%;
          box-sizing: border-box;
        }

        .admin-panel-section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--app-secondary-text);
          margin: 18px 0 8px;
        }

        .admin-panel-section-title:first-child {
          margin-top: 0;
        }

        /* =====================================================
           OPTIONS
        ===================================================== */

        .admin-options-list {
          width: 100%;
        }

        .admin-option-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 8px 0;
          font-size: 13px;
          color: var(--app-text);
          border-bottom: 1px dashed var(--app-border);
        }

        .admin-option-row:last-child {
          border-bottom: none;
        }

        .admin-option-text {
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-option-votes {
          flex-shrink: 0;
          color: var(--app-secondary-text);
          font-size: 12px;
          white-space: nowrap;
        }

        /* =====================================================
           COMMENTS
        ===================================================== */

        .admin-comments-list {
          width: 100%;
        }

        .admin-comment-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          padding: 10px 0;
          border-bottom: 1px dashed var(--app-border);
        }

        .admin-comment-row:last-child {
          border-bottom: none;
        }

        .admin-comment-content {
          min-width: 0;
          flex: 1;
        }

        .admin-comment-body {
          font-size: 13px;
          color: var(--app-text);
          line-height: 1.5;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-comment-meta {
          margin-top: 4px;
          font-size: 11px;
          color: var(--app-secondary-text);
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-comment-delete-btn {
          flex-shrink: 0;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #ef4444;
          padding: 5px 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .admin-comment-delete-btn:hover {
          background: rgba(239, 68, 68, 0.12);
        }

        /* =====================================================
           MOBILE CARDS
        ===================================================== */

        .admin-mobile-decisions {
          display: none;
        }

        .admin-decision-card {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid var(--app-border);
          border-radius: 12px;
          background: var(--app-card);
          margin-bottom: 12px;
          overflow: hidden;
        }

        .admin-decision-card:last-child {
          margin-bottom: 0;
        }

        .admin-decision-card-main {
          padding: 15px;
        }

        .admin-decision-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .admin-decision-title {
          flex: 1;
          min-width: 0;
          font-size: 15px;
          line-height: 1.4;
          font-weight: 700;
          color: var(--app-text);
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-expand-icon {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
          font-size: 14px;
          font-weight: 700;
        }

        .admin-decision-card-category {
          margin-top: 9px;
        }

        .admin-decision-card-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 15px;
          padding-top: 13px;
          border-top: 1px solid var(--app-border);
        }

        .admin-info-item {
          min-width: 0;
        }

        .admin-info-label {
          display: block;
          margin-bottom: 4px;
          font-size: 10px;
          font-weight: 700;
          color: var(--app-secondary-text);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .admin-info-value {
          display: block;
          font-size: 12px;
          color: var(--app-text);
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-mobile-delete {
          width: 100%;
          margin-top: 14px;
          min-height: 40px;
        }

        /* =====================================================
           MOBILE EXPANDED DETAILS
        ===================================================== */

        .admin-mobile-details {
          padding: 0 15px 15px;
          border-top: 1px solid var(--app-border);
          background: var(--app-card-2);
        }

        .admin-mobile-details .admin-details-panel {
          padding-top: 14px;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 768px) {
          .admin-decisions-page {
            max-width: 100%;
          }

          .admin-search {
            max-width: 100%;
          }

          .admin-table-wrapper {
            border-radius: 10px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {
          .admin-back-link {
            font-size: 12px;
            margin-bottom: 14px;
          }

          .admin-search-wrapper {
            margin-bottom: 14px;
          }

          .admin-search {
            max-width: 100%;
            padding: 12px 13px;
            font-size: 13px;
          }

          /* Hide desktop table */
          .admin-table-wrapper {
            display: none;
          }

          /* Show mobile cards */
          .admin-mobile-decisions {
            display: block;
          }

          .admin-decision-card-main {
            padding: 14px;
          }

          .admin-decision-card-info {
            grid-template-columns: 1fr 1fr;
          }

          .admin-option-row {
            align-items: flex-start;
            gap: 10px;
          }

          .admin-option-votes {
            font-size: 11px;
          }

          .admin-comment-row {
            flex-direction: column;
            gap: 8px;
          }

          .admin-comment-delete-btn {
            align-self: flex-end;
            min-height: 34px;
            padding: 7px 10px;
          }
        }

        /* =====================================================
           VERY SMALL PHONES
        ===================================================== */

        @media (max-width: 380px) {
          .admin-decision-card-main {
            padding: 12px;
          }

          .admin-mobile-details {
            padding-left: 12px;
            padding-right: 12px;
          }

          .admin-decision-card-info {
            grid-template-columns: 1fr;
            gap: 9px;
          }

          .admin-option-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .admin-option-votes {
            white-space: normal;
          }

          .admin-comment-meta {
            line-height: 1.4;
          }
        }
      `}</style>

      <div className="admin-decisions-page">
        <Link
          className="admin-back-link"
          to="/admin"
        >
          ← Back to Admin Dashboard
        </Link>

        {/* SEARCH */}
        <div className="admin-search-wrapper">
          <input
            className="admin-search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by title, category, or creator"
            aria-label="Search decisions"
          />
        </div>

        {/* LOADING */}
        {loading && (
          <div className="admin-empty">
            Loading decisions…
          </div>
        )}

        {/* NO RESULTS */}
        {!loading &&
          filteredDecisions.length === 0 && (
            <div className="admin-empty">
              No decisions found.
            </div>
          )}

        {/* =====================================================
            DESKTOP / TABLET TABLE
        ===================================================== */}

        {!loading &&
          filteredDecisions.length > 0 && (
            <div className="admin-table-wrapper">
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
                    const isExpanded =
                      expandedId === decision.id;

                    return (
                      <>
                        <tr
                          key={`row-${decision.id}`}
                          className="admin-decision-row"
                          onClick={() =>
                            toggleExpand(decision.id)
                          }
                        >
                          <td>
                            {decision.title}
                          </td>

                          <td>
                            <span className="admin-badge">
                              {decision.category ||
                                "Uncategorized"}
                            </span>
                          </td>

                          <td>
                            {decision.createdByName || "—"}
                          </td>

                          <td>
                            {decision.totalVotes}
                          </td>

                          <td>
                            <button
                              className="admin-delete-btn"
                              onClick={(event) => {
                                event.stopPropagation();

                                deleteDecision(
                                  decision.id,
                                  decision.title
                                );
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr
                            key={`details-${decision.id}`}
                            className="admin-options-panel"
                          >
                            <td colSpan={5}>
                              <DecisionDetails
                                decision={decision}
                              />
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        {/* =====================================================
            MOBILE CARDS
        ===================================================== */}

        {!loading &&
          filteredDecisions.length > 0 && (
            <div className="admin-mobile-decisions">
              {filteredDecisions.map((decision) => {
                const isExpanded =
                  expandedId === decision.id;

                return (
                  <div
                    className="admin-decision-card"
                    key={decision.id}
                  >
                    {/* CARD MAIN */}
                    <div
                      className="admin-decision-card-main"
                      onClick={() =>
                        toggleExpand(decision.id)
                      }
                    >
                      <div className="admin-decision-card-header">
                        <div className="admin-decision-title">
                          {decision.title}
                        </div>

                        <div className="admin-expand-icon">
                          {isExpanded ? "−" : "+"}
                        </div>
                      </div>

                      <div className="admin-decision-card-category">
                        <span className="admin-badge">
                          {decision.category ||
                            "Uncategorized"}
                        </span>
                      </div>

                      <div className="admin-decision-card-info">
                        <div className="admin-info-item">
                          <span className="admin-info-label">
                            Created By
                          </span>

                          <span className="admin-info-value">
                            {decision.createdByName ||
                              "—"}
                          </span>
                        </div>

                        <div className="admin-info-item">
                          <span className="admin-info-label">
                            Votes
                          </span>

                          <span className="admin-info-value">
                            {decision.totalVotes}
                          </span>
                        </div>
                      </div>

                      <button
                        className="admin-delete-btn admin-mobile-delete"
                        onClick={(event) => {
                          event.stopPropagation();

                          deleteDecision(
                            decision.id,
                            decision.title
                          );
                        }}
                      >
                        Delete Decision
                      </button>
                    </div>

                    {/* MOBILE EXPANDED DETAILS */}
                    {isExpanded && (
                      <div className="admin-mobile-details">
                        <DecisionDetails
                          decision={decision}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}

export default AdminDecisions;