import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

const API = "http://localhost:8080";

// ==========================================
// WINNER / RESULT CALCULATION
// Finds the option(s) with max(voteCount).
// Handles ties: if 2+ options share the top
// vote count, all of them are marked winners
// and isTie becomes true.
// ==========================================
function getWinnerInfo(options) {
  const list = options || [];
  const totalVotes = list.reduce(
    (sum, o) => sum + (o.voteCount || 0),
    0
  );

  if (list.length === 0 || totalVotes === 0) {
    return { winnerIds: new Set(), winners: [], isTie: false, maxVotes: 0, totalVotes: 0 };
  }

  const maxVotes = Math.max(...list.map((o) => o.voteCount || 0));
  const winners = list.filter((o) => (o.voteCount || 0) === maxVotes);

  return {
    winnerIds: new Set(winners.map((o) => o.id)),
    winners,
    isTie: winners.length > 1,
    maxVotes,
    totalVotes,
  };
}
// ==========================================
// RESULTS REPORT
// Builds a structured summary of a decision's
// results, used for both CSV export and the
// printable report view.
// ==========================================
function buildReportData(decision) {
  const { winners, isTie, totalVotes } = getWinnerInfo(decision.options);

  return {
    title: decision.title,
    description: decision.description,
    category: decision.category || "Uncategorized",
    community: decision.communityName || "N/A",
    status: decision.status === "COMPLETED" ? "Closed" : "Open",
    deadline: decision.deadline || "No deadline set",
    generatedAt: new Date().toLocaleString(),
    totalVotes,
    isTie,
    options: (decision.options || []).map((o) => ({
      text: o.optionText,
      votes: o.voteCount || 0,
      percent:
        totalVotes > 0
          ? Math.round(((o.voteCount || 0) / totalVotes) * 100)
          : 0,
    })),
    winnerText:
      totalVotes === 0
        ? "No votes yet"
        : isTie
        ? `Tie between: ${winners.map((w) => w.optionText).join(" & ")}`
        : `${winners[0].optionText} — ${winners[0].voteCount} votes (${Math.round(
            (winners[0].voteCount / totalVotes) * 100
          )}%)`,
  };
}

function downloadCSV(decision) {
  const report = buildReportData(decision);

  const rows = [
    ["Decision Results Report"],
    ["Title", report.title],
    ["Description", report.description],
    ["Category", report.category],
    ["Community", report.community],
    ["Status", report.status],
    ["Deadline", report.deadline],
    ["Generated At", report.generatedAt],
    ["Total Votes", report.totalVotes],
    ["Result", report.winnerText],
    [],
    ["Option", "Votes", "Percentage"],
    ...report.options.map((o) => [o.text, o.votes, `${o.percent}%`]),
  ];

  const csvContent = rows
    .map((row) =>
      row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${report.title.replace(/[^a-z0-9]/gi, "_")}_report.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function Polls() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);
  const [openDiscussion, setOpenDiscussion] = useState(null);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [message, setMessage] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [voteFilter, setVoteFilter] = useState("ALL");
  const [isError, setIsError] = useState(false);
    const [reportDecision, setReportDecision] = useState(null);
  const [revealedResults, setRevealedResults] = useState({});

  const toggleReveal = (decisionId) => {
    setRevealedResults((current) => ({
      ...current,
      [decisionId]: !current[decisionId],
    }));
  };

  const authHeaders = () => ({
    Authorization:
      `Bearer ${sessionStorage.getItem("token")}`,
  });

  const notify = (text, error = false) => {
    setIsError(error);
    setMessage(text);
  };


  /* =========================
     LOAD POLLS
  ========================= */

  const loadPolls = async () => {
    try {
      const response = await fetch(
        `${API}/api/decisions/active`,
        {
          headers: authHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load active polls."
        );
      }

      setDecisions(
        Array.isArray(data) ? data : []
      );

    } catch (error) {
      setDecisions([]);

      notify(
        error.message ||
          "Unable to load active polls.",
        true
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadPolls();
  }, []);


  /* =========================
     CLEAR TOAST
  ========================= */

  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(
      () => setMessage(""),
      3500
    );

    return () => clearTimeout(timer);
  }, [message]);


  /* =========================
     VOTE
  ========================= */

  const vote = async (
    decisionId,
    optionId
  ) => {
    setVotingId(optionId);

    try {
      const response = await fetch(
        `${API}/api/decisions/${decisionId}/vote/${optionId}`,
        {
          method: "POST",
          headers: authHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit your vote."
        );
      }

      notify(
        "Your vote has been recorded."
      );

      await loadPolls();

    } catch (error) {
      notify(
        error.message ||
          "Unable to submit your vote.",
        true
      );

    } finally {
      setVotingId(null);
    }
  };


  /* =========================
     LOAD COMMENTS
  ========================= */

  const loadComments = async (
    decisionId
  ) => {
    try {
      const response = await fetch(
        `${API}/api/decisions/${decisionId}/comments`,
        {
          headers: authHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load the discussion."
        );
      }

      setComments((previous) => ({
        ...previous,
        [decisionId]: data,
      }));

    } catch (error) {
      notify(
        error.message ||
          "Unable to load the discussion.",
        true
      );
    }
  };


  /* =========================
     TOGGLE DISCUSSION
  ========================= */

  const toggleDiscussion = (
    decisionId
  ) => {
    const next =
      openDiscussion === decisionId
        ? null
        : decisionId;

    setOpenDiscussion(next);

    if (next) {
      setCommentText("");
      loadComments(decisionId);
    }
  };


  /* =========================
     ADD COMMENT
  ========================= */

  const addComment = async (
    decisionId
  ) => {
    const content =
      commentText.trim();

    if (!content) {
      return notify(
        "Write a comment before posting.",
        true
      );
    }

    try {
      const response = await fetch(
        `${API}/api/decisions/${decisionId}/comments`,
        {
          method: "POST",
          headers: {
            ...authHeaders(),
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to add your comment."
        );
      }

      setComments((previous) => ({
        ...previous,
        [decisionId]: [
          ...(previous[decisionId] || []),
          data,
        ],
      }));

      setCommentText("");

      notify("Comment posted.");

    } catch (error) {
      notify(
        error.message ||
          "Unable to add your comment.",
        true
      );
    }
  };


  /* =========================
     DELETE COMMENT
  ========================= */

  const deleteComment = async (
    decisionId,
    commentId
  ) => {
    try {
      const response = await fetch(
        `${API}/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.message ||
            "Unable to delete comment."
        );
      }

      setComments((previous) => ({
        ...previous,
        [decisionId]:
          previous[decisionId].filter(
            (comment) =>
              comment.id !== commentId
          ),
      }));

      notify("Comment deleted.");

    } catch (error) {
      notify(
        error.message ||
          "Unable to delete comment.",
        true
      );
    }
  };


  const categories = [
    "ALL",
    ...Array.from(
      new Set(
        decisions
          .map((decision) => decision.category)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b)),
  ];

  const filteredDecisions = decisions.filter((decision) => {
    const matchesCategory =
      categoryFilter === "ALL" ||
      decision.category === categoryFilter;

    const matchesVote =
      voteFilter === "ALL" ||
      (voteFilter === "VOTED" && decision.alreadyVoted) ||
      (voteFilter === "NOT_VOTED" && !decision.alreadyVoted);

    return matchesCategory && matchesVote;
  });

  const filtersActive =
    categoryFilter !== "ALL" ||
    voteFilter !== "ALL";

  const clearFilters = () => {
    setCategoryFilter("ALL");
    setVoteFilter("ALL");
  };

  return (
    <DashboardLayout
      pageTitle="Active Polls"
      pageSubtitle="Vote, compare viewpoints, and discuss each decision with the community."
    >

      <Toast
        message={message}
        isError={isError}
      />


      <style>{`

        /* =========================
           MAIN PAGE
        ========================= */

        .polls-page {
          max-width: 1400px;

          margin: 0 auto;

          color:
            var(--app-text);

          padding:
            4px 0 42px;
        }


        /* =========================
           HERO
        ========================= */

        .polls-hero {
          position: relative;

          overflow: hidden;

          margin-bottom: 22px;

          padding:
            27px 30px;

          border:
            1px solid
            var(--app-border);

          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              var(--app-card),
              var(--app-card-2)
            );

          box-shadow:
            0 18px 45px
            rgba(0, 0, 0, .12);

          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }


        .polls-hero::after {
          content: "";

          position: absolute;

          right: -42px;
          bottom: -70px;

          width: 210px;
          height: 210px;

          border:
            1px solid
            rgba(167, 139, 250, .18);

          border-radius: 50%;

          pointer-events: none;
        }


        .polls-eyebrow {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          color:
            #8b5cf6;

          font-size: 10px;

          font-weight: 700;

          letter-spacing: 1.5px;

          text-transform: uppercase;
        }


        .polls-live-dot {
          width: 7px;
          height: 7px;

          border-radius: 100%;

          background:
            #34d399;

          box-shadow:
            0 0 10px
            #34d399;
        }


        .polls-hero h2 {
          margin:
            10px 0 6px;

          color:
            var(--app-text);

          font-size:
            clamp(24px, 3vw, 32px);

          letter-spacing:
            -.7px;
        }


        .polls-hero p {
          max-width: 580px;

          margin: 0;

          color:
            var(--app-secondary-text);

          font-size: 13px;

          line-height: 1.6;
        }


        /* =========================
           POLL COUNT
        ========================= */

        .poll-count {
          position: absolute;

          right: 30px;
          top: 29px;

          display: flex;

          flex-direction: column;

          align-items: end;

          z-index: 1;
        }


        .poll-count strong {
          color:
            var(--app-text);

          font-size: 30px;

          line-height: 1;
        }


        .poll-count span {
          margin-top: 5px;

          color:
            var(--app-secondary-text);

          font-size: 11px;
        }



        /* =========================
           FILTER BAR
        ========================= */

        .poll-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 18px;
          padding: 13px 14px;
          border: 1px solid var(--app-border);
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              rgba(139, 92, 246, .055),
              rgba(255, 255, 255, .02)
            );
          box-shadow: 0 10px 28px rgba(0, 0, 0, .08);
        }

        .poll-filter-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-right: 2px;
          color: var(--app-secondary-text);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .poll-filter-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #8b5cf6;
          box-shadow: 0 0 10px rgba(139, 92, 246, .55);
        }

        .poll-filter-select {
          min-width: 145px;
          padding: 9px 32px 9px 11px;
          border: 1px solid var(--app-border);
          border-radius: 10px;
          background: var(--app-card-2);
          color: var(--app-text);
          font-size: 11px;
          font-weight: 400;
          outline: none;
          cursor: pointer;
          transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
        }

        .poll-filter-select:hover {
          border-color: rgba(139, 92, 246, .32);
          background: rgba(139, 92, 246, .06);
        }

        .poll-filter-select:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, .10);
        }


        .poll-filter-select {
          color-scheme: dark;
        }

        .poll-filter-select option,
        .poll-filter-select optgroup {
          background: #171425;
          color: #f3effb;
          font-weight: 400;
        }

        .poll-filter-select option:checked,
        .poll-filter-select option:hover {
          background: #3b2a68;
          color: #ffffff;
        }

        .poll-filter-reset {
          margin-left: auto;
          padding: 9px 11px;
          border: 1px solid rgba(248, 113, 113, .14);
          border-radius: 10px;
          background: rgba(239, 68, 68, .055);
          color: #f28b8b;
          font-size: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all .2s ease;
        }

        .poll-filter-reset:hover {
          border-color: rgba(248, 113, 113, .30);
          background: rgba(239, 68, 68, .10);
          color: #f5a2a2;
        }

        .poll-filter-result {
          width: 100%;
          margin-top: 1px;
          padding: 2px 1px 0;
          color: var(--app-secondary-text);
          font-size: 10px;
        }

        .poll-filter-result strong {
          color: var(--app-text);
          font-weight: 500;
        }

        /* =========================
           POLL GRID
        ========================= */

        .polls-grid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 18px;
        }


        /* =========================
           POLL CARD
        ========================= */

        .poll-card {
          min-width: 0;

          padding: 23px;

          border:
            1px solid
            var(--app-border);

          border-radius: 16px;

          background:
            var(--app-card);

          transition:
            transform .22s ease,
            border-color .22s ease,
            box-shadow .22s ease,
            background .25s ease;
        }


        .poll-card:hover {
          transform:
            translateY(-3px);

          border-color:
            #574174;

          box-shadow:
            0 16px 35px
            rgba(0, 0, 0, .12);
        }


        /* =========================
           META
        ========================= */

        .poll-meta {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 10px;

          margin-bottom: 16px;
        }


        .poll-tag,
        .poll-community {
          padding:
            5px 9px;

          border-radius: 7px;

          font-size: 10px;

          font-weight: 700;
        }


        .poll-tag {
          border:
            1px solid
            rgba(167, 139, 250, .28);

          background:
            rgba(124, 58, 237, .14);

          color:
            #8b5cf6;
        }


        .poll-community {
          color:
            #3b82f6;

          background:
            rgba(37, 99, 235, .10);

          border:
            1px solid
            rgba(96, 165, 250, .17);
        }


        /* =========================
           TITLE
        ========================= */

        .poll-card h3 {
          margin: 0;

          color:
            var(--app-text);

          font-size: 20px;

          line-height: 1.35;
        }


        .poll-description {
          min-height: 43px;

          margin:
            9px 0 17px;

          color:
            var(--app-secondary-text);

          font-size: 13px;

          line-height: 1.6;
        }


        /* =========================
           DETAILS
        ========================= */

        .poll-details {
          display: flex;

          gap: 14px;

          flex-wrap: wrap;

          padding:
            12px 0;

          border-top:
            1px solid
            var(--app-border);

          border-bottom:
            1px solid
            var(--app-border);

          color:
            var(--app-secondary-text);

          font-size: 11px;
        }


        /* =========================
           OPTIONS
        ========================= */

        .option-list {
          display: grid;

          gap: 9px;

          margin-top: 17px;
        }


        .poll-option {
          display: flex;

          align-items: center;

          gap: 11px;

          padding: 11px;

          border:
            1px solid
            var(--app-border);

          border-radius: 10px;

          background:
            var(--app-card-2);

          transition:
            background .25s ease,
            border-color .25s ease;
        }


                .poll-option.is-voted {
          border-color:
            rgba(22, 163, 74, .38);

          background:
            rgba(22, 163, 74, .10);
        }

                .poll-option.is-leading {
          border-color: #22c55e;
          background: rgba(34, 197, 94, .10);
          box-shadow: 0 0 0 1px rgba(34, 197, 94, .25);
        }

        .leading-badge,
        .tie-badge {
          display: inline-block;
          margin-left: 8px;
          padding: 2px 7px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .02em;
          vertical-align: middle;
        }

        .leading-badge {
          color: #15803d;
          background: rgba(34, 197, 94, .16);
          border: 1px solid rgba(34, 197, 94, .35);
        }

        .tie-badge {
          color: #b45309;
          background: rgba(245, 158, 11, .16);
          border: 1px solid rgba(245, 158, 11, .35);
        }

                .result-banner {
          margin-bottom: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          line-height: 1.5;
        }

        .result-banner-empty {
          border: 1px dashed var(--app-border);
          background: var(--app-card-2);
          color: var(--app-secondary-text);
        }

                .result-banner-leading {
          border: 1px solid rgba(34, 197, 94, .4);
          background: rgba(34, 197, 94, .12);
          color: #15803d;
        }

        .result-banner-final {
          border: 1px solid rgba(22, 163, 74, .4);
          background: rgba(22, 163, 74, .12);
          color: #15803d;
        }

        .result-banner-tie {
          border: 1px dashed rgba(245, 158, 11, .4);
          background: rgba(245, 158, 11, .10);
          color: #b45309;
        }

        .option-bar-track {
          margin-top: 6px;
          width: 100%;
          height: 5px;
          border-radius: 4px;
          background: var(--app-border);
          overflow: hidden;
        }

        .option-bar-fill {
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          transition: width .4s ease;
        }

          .option-bar-fill.is-leading {
          background: linear-gradient(135deg, #22c55e, #16a34a);
        }


        .option-copy {
          min-width: 0;

          flex: 1;
        }


        .option-copy strong {
          display: block;

          color:
            var(--app-text);

          font-size: 13px;

          font-weight: 600;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }


        .option-copy span {
          color:
            var(--app-secondary-text);

          font-size: 10px;
        }


        /* =========================
           VOTE BUTTON
        ========================= */

        .vote-action,
        .discussion-action,
        .post-action {
          border: 0;

          border-radius: 8px;

          cursor: pointer;

          font-size: 11px;

          font-weight: 700;

          transition:
            .18s ease;
        }


        .vote-action {
          padding:
            8px 11px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #4f46e5,
              #7c3aed
            );
        }


        .vote-action:hover:not(:disabled) {
          filter:
            brightness(1.12);

          transform:
            translateY(-1px);
        }


        .vote-action:disabled {
          cursor: default;

          opacity: .55;
        }


        /* =========================
           POLL FOOTER
        ========================= */

        .poll-footer {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          margin-top: 17px;
        }


        .poll-footer span {
          color:
            var(--app-secondary-text);

          font-size: 11px;
        }


        .discussion-action {
          padding:
            8px 10px;

          color:
            var(--app-text);

          background:
            var(--app-card-2);

          border:
            1px solid
            var(--app-border);
        }


        .discussion-action:hover {
          border-color:
            #7656ba;
        }


        /* =========================
           DISCUSSION
        ========================= */

        .discussion {
          margin-top: 18px;

          padding-top: 18px;

          border-top:
            1px solid
            var(--app-border);

          animation:
            reveal .2s ease-out;
        }


        .discussion-title {
          display: flex;

          justify-content:
            space-between;

          margin-bottom: 13px;

          color:
            var(--app-text);

          font-size: 13px;

          font-weight: 700;
        }


        .discussion-title span {
          color:
            var(--app-secondary-text);

          font-size: 10px;

          font-weight: 500;
        }


        /* =========================
           COMMENTS
        ========================= */

        .comment-list {
          display: grid;

          gap: 9px;

          max-height: 240px;

          overflow-y: auto;

          padding-right: 3px;
        }


        .comment {
          padding:
            11px 12px;

          border-radius: 10px;

          background:
            var(--app-card-2);

          border:
            1px solid
            var(--app-border);

          transition:
            background .25s ease,
            border-color .25s ease;
        }


        .comment-head {
          display: flex;

          align-items: center;

          gap: 8px;
        }


        .comment-avatar {
          display: flex;

          align-items: center;
          justify-content: center;

          width: 23px;
          height: 23px;

          border-radius: 50%;

          color: white;

          background:
            #4f46e5;

          font-size: 10px;

          font-weight: 800;
        }


        .comment-name {
          flex: 1;

          color:
            var(--app-text);

          font-size: 11px;

          font-weight: 700;
        }


        .comment-time {
          color:
            var(--app-secondary-text);

          font-size: 9px;
        }


        .delete-comment {
          border: 0;

          background:
            transparent;

          color:
            #ef4444;

          cursor: pointer;

          font-size: 10px;
        }


        .comment p {
          margin:
            7px 0 0 31px;

          color:
            var(--app-secondary-text);

          font-size: 12px;

          line-height: 1.5;
        }


        .comment-empty {
          padding: 13px;

          border:
            1px dashed
            var(--app-border);

          border-radius: 10px;

          color:
            var(--app-secondary-text);

          font-size: 11px;

          text-align: center;
        }


        /* =========================
           COMMENT COMPOSE
        ========================= */

        .comment-compose {
          display: flex;

          gap: 9px;

          margin-top: 12px;
        }


        .comment-compose input {
          min-width: 0;

          flex: 1;

          border:
            1px solid
            var(--app-border);

          border-radius: 9px;

          outline: none;

          background:
            var(--app-bg);

          color:
            var(--app-text);

          padding:
            10px 11px;

          font-size: 12px;

          transition:
            background .25s ease,
            color .25s ease,
            border-color .2s ease;
        }


        .comment-compose input::placeholder {
          color:
            var(--app-secondary-text);
        }


        .comment-compose input:focus {
          border-color:
            #7656ba;
        }


        .post-action {
          padding:
            0 13px;

          background:
            #6d3dcc;

          color: white;
        }


        .post-action:hover {
          background:
            #7b49d9;
        }


        /* =========================
           EMPTY STATE
        ========================= */

        .poll-empty {
          padding:
            55px 20px;

          border:
            1px dashed
            var(--app-border);

          border-radius: 16px;

          color:
            var(--app-secondary-text);

          text-align: center;

          background:
            var(--app-card);

          transition:
            background .25s ease,
            border-color .25s ease;
        }


        .poll-empty strong {
          display: block;

          margin-bottom: 7px;

          color:
            var(--app-text);

          font-size: 15px;
        }


        /* =========================
           ANIMATION
        ========================= */

        @keyframes reveal {

          from {
            opacity: 0;

            transform:
              translateY(-5px);
          }

          to {
            opacity: 1;

            transform:
              translateY(0);
          }

        }


        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 900px) {

          .polls-grid {
            grid-template-columns:
              1fr;
          }

        }


        @media (max-width: 560px) {

          .polls-hero {
            padding:
              23px 20px;
          }


          .poll-count {
            right: 20px;
          }


          .polls-hero p {
            max-width: 300px;
          }


          .poll-card {
            padding: 18px;
          }


          .poll-footer {
            align-items:
              flex-start;

            gap: 10px;

            flex-direction:
              column;
          }


          .poll-option {
            align-items:
              flex-start;
          }


          .comment-compose {
            flex-direction:
              column;
          }


          .post-action {
            min-height: 38px;
          }


          .poll-filters {
            align-items: stretch;
            flex-direction: column;
            gap: 8px;
          }

          .poll-filter-label {
            margin-right: 0;
          }

          .poll-filter-select,
          .poll-filter-reset {
            width: 100%;
            box-sizing: border-box;
          }

                    .poll-filter-reset {
            margin-left: 0;
          }

        }

        /* =========================
           REPORT BUTTON / FOOTER LAYOUT
        ========================= */

        .poll-footer-actions {
          display: flex;
          gap: 8px;
        }

        .report-action {
          padding: 8px 10px;
          border: 1px solid rgba(34, 197, 94, .3);
          border-radius: 8px;
          background: rgba(34, 197, 94, .08);
          color: #15803d;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: .18s ease;
        }

                .report-action:hover {
          background: rgba(34, 197, 94, .16);
        }

        .reveal-result-btn {
          width: 100%;
          margin-bottom: 4px;
          padding: 10px;
          border: 1px dashed rgba(139, 92, 246, .4);
          border-radius: 10px;
          background: rgba(139, 92, 246, .08);
          color: #8b5cf6;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: .18s ease;
        }

        .reveal-result-btn:hover {
          background: rgba(139, 92, 246, .16);
        }

        .hide-result-btn {
          display: block;
          margin: -4px 0 4px auto;
          border: 0;
          background: transparent;
          color: var(--app-secondary-text);
          font-size: 10px;
          text-decoration: underline;
          cursor: pointer;
        }

        /* =========================
           REPORT MODAL
        ========================= */

        .report-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, .55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .report-modal {
          width: 100%;
          max-width: 560px;
          max-height: 86vh;
          overflow-y: auto;
          background: var(--app-card);
          border: 1px solid var(--app-border);
          border-radius: 16px;
          box-shadow: 0 25px 60px rgba(0,0,0,.35);
        }

        .report-modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--app-border);
        }

        .report-modal-head h3 {
          margin: 0;
          font-size: 14px;
          color: var(--app-secondary-text);
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .report-close {
          border: 0;
          background: transparent;
          color: var(--app-secondary-text);
          font-size: 16px;
          cursor: pointer;
        }

        .report-body {
          padding: 20px;
        }

        .report-body h2 {
          margin: 0 0 6px;
          color: var(--app-text);
          font-size: 20px;
        }

        .report-desc {
          margin: 0 0 16px;
          color: var(--app-secondary-text);
          font-size: 12px;
          line-height: 1.6;
        }

        .report-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 16px;
          padding: 12px;
          border: 1px solid var(--app-border);
          border-radius: 10px;
          background: var(--app-card-2);
        }

        .report-meta-grid div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .report-meta-grid span {
          color: var(--app-secondary-text);
          font-size: 10px;
          text-transform: uppercase;
        }

        .report-meta-grid strong {
          color: var(--app-text);
          font-size: 12px;
        }

        .report-winner-line {
          margin-bottom: 16px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          text-align: center;
        }

        .report-winner-line.win {
          background: rgba(34, 197, 94, .12);
          color: #15803d;
          border: 1px solid rgba(34, 197, 94, .35);
        }

        .report-winner-line.tie {
          background: rgba(245, 158, 11, .12);
          color: #b45309;
          border: 1px dashed rgba(245, 158, 11, .4);
        }

        .report-winner-line.empty {
          background: var(--app-card-2);
          color: var(--app-secondary-text);
          border: 1px dashed var(--app-border);
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .report-table th, .report-table td {
          text-align: left;
          padding: 8px 10px;
          border-bottom: 1px solid var(--app-border);
          color: var(--app-text);
        }

        .report-table th {
          color: var(--app-secondary-text);
          font-size: 10px;
          text-transform: uppercase;
        }

        .report-actions {
          display: flex;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid var(--app-border);
        }

        .report-btn-primary, .report-btn-secondary {
          flex: 1;
          padding: 10px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid var(--app-border);
        }

        .report-btn-primary {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff;
          border: none;
        }

        .report-btn-secondary {
          background: var(--app-card-2);
          color: var(--app-text);
        }

                /* The modal renders via a portal directly under <body>,
           so we just hide every OTHER direct child of body and
           keep our report visible — no nested-visibility guesswork. */
                @media print {
          body > *:not(#report-print-root) {
            display: none !important;
          }

          #report-print-root {
            display: block !important;
            position: static !important;
            background: #fff !important;
            padding: 0 !important;
          }

          .report-modal {
            max-width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            background: #fff !important;
          }

          .report-modal-head, .report-actions {
            display: none !important;
          }

          /* Force readable dark text on white paper — the theme
             variables are made for dark mode and look washed out
             when printed on a white page. */
          .report-body h2 { color: #111 !important; }
          .report-desc { color: #444 !important; }

          .report-meta-grid {
            background: #f7f7f7 !important;
            border-color: #ddd !important;
          }
          .report-meta-grid span { color: #777 !important; }
          .report-meta-grid strong { color: #111 !important; }

          .report-table th { color: #666 !important; }
          .report-table td { color: #111 !important; }
          .report-table th, .report-table td { border-color: #ddd !important; }

          .report-winner-line.win {
            background: #eafaf0 !important;
            color: #15803d !important;
            border-color: #86efac !important;
          }
          .report-winner-line.tie {
            background: #fff7e6 !important;
            color: #b45309 !important;
            border-color: #fcd34d !important;
          }
          .report-winner-line.empty {
            background: #f5f5f5 !important;
            color: #666 !important;
            border-color: #ddd !important;
          }
        }

      `}</style>


      <div className="polls-page">

        {/* =========================
            HERO
        ========================= */}

        <section className="polls-hero">

          <div className="polls-eyebrow">

            <span className="polls-live-dot" />

            Live community decisions

          </div>


          <h2>
            Have your say.
          </h2>


          <p>
            Make a choice, see how the vote
            is shaping up, then add your
            perspective to the conversation.
          </p>


          <div className="poll-count">

            <strong>
              {loading
                ? "—"
                : decisions.length}
            </strong>

            <span>
              open polls
            </span>

          </div>

        </section>



        {/* FILTERS */}
        {!loading && decisions.length > 0 && (
          <div className="poll-filters">
            <span className="poll-filter-label">
              <span className="poll-filter-dot" />
              Filter polls
            </span>

            <select
              className="poll-filter-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "ALL" ? "All categories" : category}
                </option>
              ))}
            </select>

            <select
              className="poll-filter-select"
              value={voteFilter}
              onChange={(event) => setVoteFilter(event.target.value)}
              aria-label="Filter by voting status"
            >
              <option value="ALL">All voting status</option>
              <option value="NOT_VOTED">Not voted</option>
              <option value="VOTED">Already voted</option>
            </select>

            {filtersActive && (
              <button
                type="button"
                className="poll-filter-reset"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}

            <div className="poll-filter-result">
              Showing <strong>{filteredDecisions.length}</strong> of{" "}
              <strong>{decisions.length}</strong> polls
            </div>
          </div>
        )}

        {/* =========================
            LOADING
        ========================= */}

        {loading && (

          <div className="poll-empty">

            <strong>
              Loading active polls…
            </strong>

            Please wait a moment.

          </div>

        )}


        {/* =========================
            EMPTY
        ========================= */}

        {!loading &&
          decisions.length === 0 && (

            <div className="poll-empty">

              <strong>
                No active polls right now.
              </strong>

              Check back soon, or create
              a decision for your community.

            </div>

          )}



        {!loading &&
          decisions.length > 0 &&
          filteredDecisions.length === 0 && (
            <div className="poll-empty">
              <strong>No polls match these filters.</strong>
              Try another category or voting status.
              <div style={{ marginTop: "14px" }}>
                <button
                  type="button"
                  className="poll-filter-reset"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}

        {/* =========================
            POLLS
        ========================= */}

        {!loading &&
          filteredDecisions.length > 0 && (

            <div className="polls-grid">

              {filteredDecisions.map(
                (decision) => {

                                    const discussionOpen =
                    openDiscussion ===
                    decision.id;

                  const pollComments =
                    comments[
                      decision.id
                    ] || [];

                    const { winnerIds, winners, isTie, totalVotes } =
                    getWinnerInfo(decision.options);

                  const isRevealed = !!revealedResults[decision.id];


                  return (

                    <article
                      className="poll-card"
                      key={decision.id}
                    >

                      {/* META */}

                      <div className="poll-meta">

                        <span className="poll-tag">
                          {decision.category ||
                            "General"}
                        </span>


                        {decision.communityName ? (

                          <span className="poll-community">
                            {decision.communityName}
                          </span>

                        ) : null}

                      </div>


                      {/* TITLE */}

                      <h3>
                        {decision.title}
                      </h3>


                      {/* DESCRIPTION */}

                      <p className="poll-description">
                        {decision.description}
                      </p>


                      {/* DETAILS */}

                      <div className="poll-details">

                        <span>
                          {decision.deadline
                            ? `Ends ${decision.deadline}`
                            : "No closing date"}
                        </span>

                        <span>
                          {decision.totalVotes ||
                            0}{" "}
                          total votes
                        </span>

                        <span>
                          {decision.alreadyVoted
                            ? "Vote submitted"
                            : "Awaiting your vote"}
                        </span>

                      </div>


                                            {/* OPTIONS */}

                      <div className="option-list">

                        {!isRevealed ? (
                          <button
                            className="reveal-result-btn"
                            onClick={() => toggleReveal(decision.id)}
                          >
                            🏁 Show Final Result
                          </button>
                        ) : (
                          <>
                            <div
                              className={`result-banner ${
                                totalVotes === 0
                                  ? "result-banner-empty"
                                  : isTie
                                  ? "result-banner-tie"
                                  : decision.status === "COMPLETED"
                                  ? "result-banner-final"
                                  : "result-banner-leading"
                              }`}
                            >
                              {totalVotes === 0 && "🗳️ No votes yet — be the first to vote!"}

                              {totalVotes > 0 && isTie && (
                                <>
                                  🤝 It's a tie between{" "}
                                  <strong>
                                    {winners.map((w) => w.optionText).join(" & ")}
                                  </strong>
                                </>
                              )}

                              {totalVotes > 0 && !isTie && (
                                <>
                                  {decision.status === "COMPLETED" ? "✅ Final Result: " : "🏆 Currently Leading: "}
                                  <strong>{winners[0].optionText}</strong>
                                  {" — "}
                                  {winners[0].voteCount} votes (
                                  {Math.round((winners[0].voteCount / totalVotes) * 100)}%)
                                </>
                              )}
                            </div>

                            <button
                              className="hide-result-btn"
                              onClick={() => toggleReveal(decision.id)}
                            >
                              Hide result
                            </button>
                          </>
                        )}

                        {(decision.options ||
                          []).map(
                            (option) => {

                              const isLeading =
                                isRevealed &&
                                !isTie &&
                                winnerIds.has(option.id) &&
                                totalVotes > 0;

                              const isTiedLeader =
                                isRevealed &&
                                isTie &&
                                winnerIds.has(option.id);

                              const percent =
                                totalVotes > 0
                                  ? Math.round(
                                      ((option.voteCount || 0) / totalVotes) * 100
                                    )
                                  : 0;

                              return (

                              <div
                                className={
                                  `poll-option ${
                                    option.selected
                                      ? "is-voted"
                                      : ""
                                  } ${
                                    isLeading || isTiedLeader
                                      ? "is-leading"
                                      : ""
                                  }`
                                }
                                key={option.id}
                              >

                                <div className="option-copy">

                                  <strong>
                                    {option.optionText}
                                    {isLeading && (
                                      <span className="leading-badge">🏆 Leading</span>
                                    )}
                                  </strong>

                                  <span>
                                    {option.voteCount}{" "}
                                    {option.voteCount ===
                                    1
                                      ? "vote"
                                      : "votes"}
                                    {isRevealed && totalVotes > 0 ? ` · ${percent}%` : ""}
                                  </span>

                                  {isRevealed && (
                                    <div className="option-bar-track">
                                      <div
                                        className={`option-bar-fill ${
                                          isLeading || isTiedLeader ? "is-leading" : ""
                                        }`}
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  )}

                                </div>


                                <button
                                  className="vote-action"
                                  disabled={
                                    decision.alreadyVoted ||
                                    votingId ===
                                      option.id
                                  }
                                  onClick={() =>
                                    vote(
                                      decision.id,
                                      option.id
                                    )
                                  }
                                >
                                  {option.selected
                                    ? "Voted"
                                    : votingId ===
                                      option.id
                                    ? "Voting…"
                                    : "Vote"}
                                </button>

                              </div>

                              );
                            }
                          )}

                      </div>

                      {/* FOOTER */}

                                            <div className="poll-footer">

                        <span>
                          {decision.alreadyVoted
                            ? "Thanks for participating."
                            : "Choose one option to participate."}
                        </span>

                        <div className="poll-footer-actions">

                          <button
                            className="report-action"
                            onClick={() => setReportDecision(decision)}
                          >
                            📊 Report
                          </button>

                          <button
                            className="discussion-action"
                            onClick={() =>
                              toggleDiscussion(
                                decision.id
                              )
                            }
                          >
                            {discussionOpen
                              ? "Close discussion"
                              : "Open discussion"}
                          </button>

                        </div>

                      </div>


                      {/* =========================
                          DISCUSSION
                      ========================= */}

                      {discussionOpen && (

                        <section className="discussion">

                          <div className="discussion-title">

                            Discussion

                            <span>
                              {pollComments.length}{" "}
                              {pollComments.length ===
                              1
                                ? "comment"
                                : "comments"}
                            </span>

                          </div>


                          {/* COMMENTS */}

                          {pollComments.length ===
                          0 ? (

                            <div className="comment-empty">
                              No comments yet — start
                              the conversation.
                            </div>

                          ) : (

                            <div className="comment-list">

                              {pollComments.map(
                                (comment) => (

                                  <div
                                    className="comment"
                                    key={comment.id}
                                  >

                                    <div className="comment-head">

                                      <span className="comment-avatar">
                                        {comment.userName
                                          ?.charAt(0)
                                          ?.toUpperCase() ||
                                          "U"}
                                      </span>


                                      <span className="comment-name">
                                        {comment.userName}
                                      </span>


                                      <span className="comment-time">
                                        {comment.createdAt
                                          ? new Date(
                                              comment.createdAt
                                            ).toLocaleString()
                                          : ""}
                                      </span>


                                      {comment.canDelete ? (

                                        <button
                                          className="delete-comment"
                                          onClick={() =>
                                            deleteComment(
                                              decision.id,
                                              comment.id
                                            )
                                          }
                                        >
                                          Delete
                                        </button>

                                      ) : null}

                                    </div>


                                    <p>
                                      {comment.content}
                                    </p>

                                  </div>

                                )
                              )}

                            </div>

                          )}


                          {/* COMMENT INPUT */}

                          <div className="comment-compose">

                            <input
                              value={commentText}
                              onChange={(event) =>
                                setCommentText(
                                  event.target.value
                                )
                              }
                              onKeyDown={(event) => {
                                if (
                                  event.key ===
                                  "Enter"
                                ) {
                                  addComment(
                                    decision.id
                                  );
                                }
                              }}
                              placeholder="Share your point of view…"
                              maxLength="1000"
                            />


                            <button
                              className="post-action"
                              onClick={() =>
                                addComment(
                                  decision.id
                                )
                              }
                            >
                              Post
                            </button>

                          </div>

                        </section>

                      )}

                    </article>

                  );
                }
              )}

            </div>

          )}

           </div>

      {/* =========================
          RESULTS REPORT MODAL
      ========================= */}

            {reportDecision && (() => {
        const report = buildReportData(reportDecision);
        return createPortal(
          <div id="report-print-root" className="report-overlay" onClick={() => setReportDecision(null)}>
            <div className="report-modal" onClick={(e) => e.stopPropagation()}>

              <div className="report-modal-head">
                <h3>Results Report</h3>
                <button className="report-close" onClick={() => setReportDecision(null)}>✕</button>
              </div>

              <div className="report-body">
                <h2>{report.title}</h2>
                <p className="report-desc">{report.description}</p>

                <div className="report-meta-grid">
                  <div><span>Category</span><strong>{report.category}</strong></div>
                  <div><span>Community</span><strong>{report.community}</strong></div>
                  <div><span>Status</span><strong>{report.status}</strong></div>
                  <div><span>Deadline</span><strong>{report.deadline}</strong></div>
                  <div><span>Total Votes</span><strong>{report.totalVotes}</strong></div>
                  <div><span>Generated</span><strong>{report.generatedAt}</strong></div>
                </div>

                <div className={`report-winner-line ${report.totalVotes === 0 ? "empty" : report.isTie ? "tie" : "win"}`}>
                  {report.totalVotes === 0 ? "🗳️ " : report.isTie ? "🤝 " : "🏆 "}
                  {report.winnerText}
                </div>

                <table className="report-table">
                  <thead>
                    <tr><th>Option</th><th>Votes</th><th>Share</th></tr>
                  </thead>
                  <tbody>
                    {report.options.map((o) => (
                      <tr key={o.text}>
                        <td>{o.text}</td>
                        <td>{o.votes}</td>
                        <td>{o.percent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

                            <div className="report-actions">
                <button className="report-btn-secondary" onClick={() => downloadCSV(reportDecision)}>⬇ Download CSV</button>
                <button className="report-btn-primary" onClick={() => window.print()}>🖨 Print / Save as PDF</button>
              </div>

            </div>
          </div>,
          document.body
        );
      })()}

    </DashboardLayout>
  );
}

export default Polls;