import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

// ==========================================
// WINNER / RESULT CALCULATION
// Finds the option(s) with max(voteCount).
// Handles ties: multiple options sharing the
// top vote count are all marked as winners.
// ==========================================
function getWinnerInfo(options) {
  const list = options || [];
  const totalVotes = list.reduce((sum, o) => sum + (o.voteCount || 0), 0);

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
      percent: totalVotes > 0 ? Math.round(((o.voteCount || 0) / totalVotes) * 100) : 0,
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
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
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

function MyDecisions() {
        const [decisions, setDecisions] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [reportDecision, setReportDecision] = useState(null);
    const [revealedResults, setRevealedResults] = useState({});

    const toggleReveal = (decisionId) => {
        setRevealedResults((current) => ({
            ...current,
            [decisionId]: !current[decisionId],
        }));
    };

    const navigate = useNavigate();


    /* =========================
       FETCH DECISIONS
    ========================= */

    useEffect(() => {
        fetchDecisions();
    }, []);


    /* =========================
       CLEAR MESSAGE
    ========================= */

    useEffect(() => {

        if (!message) return;

        const timer = setTimeout(
            () => setMessage(""),
            3500
        );

        return () => clearTimeout(timer);

    }, [message]);


    /* =========================
       FETCH
    ========================= */

    const fetchDecisions = async () => {

        try {

            const token =
                sessionStorage.getItem("token");

            const response = await fetch(
                "http://localhost:8080/api/decisions/my",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load decisions"
                );

            }


            const data =
                await response.json();

            setDecisions(data);

        } catch (error) {

            console.error(error);

            setIsError(true);

            setMessage(
                "Unable to load decisions"
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================
       DELETE DECISION
    ========================= */

    const deleteDecision = async (id) => {

        if (
            !window.confirm(
                "Delete this decision?"
            )
        ) {
            return;
        }


        try {

            const token =
                sessionStorage.getItem("token");


            if (!token) {

                setIsError(true);

                setMessage(
                    "Please login first"
                );

                navigate("/login");

                return;

            }


            const response = await fetch(
                `http://localhost:8080/api/decisions/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${sessionStorage.getItem("token")}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


            const result =
                await response.text();


            console.log(
                "Delete status:",
                response.status
            );


            console.log(
                "Delete response:",
                result
            );


            if (!response.ok) {

                setIsError(true);

                setMessage(
                    `Failed to delete: ${result}`
                );

                return;

            }


            setIsError(false);

            setMessage(
                "Decision deleted successfully!"
            );


            setDecisions((prev) =>
                prev.filter(
                    (decision) =>
                        decision.id !== id
                )
            );


        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            setIsError(true);

            setMessage(
                "Server error while deleting decision."
            );

        }

    };


    return (

        <DashboardLayout
            pageTitle="My Decisions"
            pageSubtitle="View, manage and share the decision boards you've created."
        >

            <Toast
                message={message}
                isError={isError}
            />


            <style>{`

                /* =========================
                   PAGE
                ========================= */

                .my-decisions-page {

                    width: 100%;

                    min-height:
                        calc(100vh - 100px);

                    padding:
                        5px 0 40px;

                    color:
                        var(--app-text);

                    transition:
                        color 0.25s ease;

                }


                /* =========================
                   TOP BAR
                ========================= */

                .decisions-top-bar {

                    display: flex;

                    justify-content:
                        space-between;

                    align-items:
                        center;

                    margin-bottom:
                        24px;

                    gap:
                        15px;

                }


                .decision-count {

                    color:
                        var(--app-secondary-text);

                    font-size:
                        13px;

                }


                .decision-count strong {

                    color:
                        #8b5cf6;

                    font-weight:
                        700;

                }


                /* =========================
                   CREATE BUTTON
                ========================= */

                .create-btn {

                    background:
                        linear-gradient(
                            135deg,
                            #6d3dcc,
                            #7c3aed
                        );

                    color:
                        white;

                    border:
                        none;

                    padding:
                        11px 18px;

                    border-radius:
                        8px;

                    font-weight:
                        600;

                    font-size:
                        13px;

                    cursor:
                        pointer;

                    transition:
                        background 0.2s ease,
                        transform 0.2s ease,
                        box-shadow 0.2s ease;

                    box-shadow:
                        0 5px 16px
                        rgba(109, 61, 204, .18);

                }


                .create-btn:hover {

                    background:
                        linear-gradient(
                            135deg,
                            #7848d8,
                            #8b5cf6
                        );

                    transform:
                        translateY(-1px);

                    box-shadow:
                        0 8px 22px
                        rgba(109, 61, 204, .25);

                }


                /* =========================
                   DECISION GRID
                ========================= */

                .decisions-grid {

                    width:
                        100%;

                    display:
                        grid;

                    grid-template-columns:
                        repeat(
                            3,
                            minmax(0, 1fr)
                        );

                    gap:
                        20px;

                }


                /* =========================
                   DECISION CARD
                ========================= */

                .decision-card {

                    position:
                        relative;

                    min-width:
                        0;

                    background:
                        var(--app-card);

                    border:
                        1px solid
                        var(--app-border);

                    border-radius:
                        14px;

                    padding:
                        22px;

                    overflow:
                        hidden;

                    transition:
                        transform 0.2s ease,
                        border-color 0.2s ease,
                        box-shadow 0.2s ease,
                        background 0.25s ease;

                }


                .decision-card::before {

                    content:
                        "";

                    position:
                        absolute;

                    top:
                        0;

                    left:
                        0;

                    width:
                        100%;

                    height:
                        3px;

                    background:
                        linear-gradient(
                            90deg,
                            #6d3dcc,
                            #8b5cf6
                        );

                }


                .decision-card:hover {

                    transform:
                        translateY(-4px);

                    border-color:
                        #8b5cf6;

                    box-shadow:
                        0 12px 30px
                        rgba(0, 0, 0, 0.10);

                }


                /* =========================
                   CARD HEADER
                ========================= */

                .decision-card-header {

                    display:
                        flex;

                    align-items:
                        flex-start;

                    justify-content:
                        space-between;

                    gap:
                        12px;

                    margin-bottom:
                        18px;

                }


                .decision-card h2 {

                    color:
                        var(--app-text);

                    font-size:
                        18px;

                    font-weight:
                        600;

                    line-height:
                        1.35;

                    margin:
                        0;

                    word-break:
                        break-word;

                }


                /* =========================
                   VISIBILITY BADGES
                ========================= */

                .visibility-badge {

                    flex-shrink:
                        0;

                    padding:
                        5px 9px;

                    border-radius:
                        6px;

                    font-size:
                        10px;

                    font-weight:
                        600;

                    letter-spacing:
                        0.2px;

                }


                .visibility-public {

                    color:
                        #15803d;

                    background:
                        rgba(
                            34,
                            197,
                            94,
                            0.10
                        );

                    border:
                        1px solid
                        rgba(
                            34,
                            197,
                            94,
                            0.25
                        );

                }


                .visibility-private {

                    color:
                        #dc2626;

                    background:
                        rgba(
                            239,
                            68,
                            68,
                            0.08
                        );

                    border:
                        1px solid
                        rgba(
                            239,
                            68,
                            68,
                            0.22
                        );

                }


                /* =========================
                   DARK THEME BADGES
                ========================= */

                [data-theme="dark"]
                .visibility-public {

                    color:
                        #86efac;

                    background:
                        rgba(
                            16,
                            37,
                            29,
                            0.85
                        );

                    border:
                        1px solid
                        #235c43;

                }


                [data-theme="dark"]
                .visibility-private {

                    color:
                        #fca5a5;

                    background:
                        rgba(
                            40,
                            25,
                            29,
                            0.85
                        );

                    border:
                        1px solid
                        #66333a;

                }


                /* =========================
                   DETAILS
                ========================= */

                .decision-details {

                    display:
                        flex;

                    flex-direction:
                        column;

                    gap:
                        10px;

                    margin-bottom:
                        20px;

                }


                .detail-row {

                    display:
                        flex;

                    align-items:
                        flex-start;

                    gap:
                        8px;

                    font-size:
                        13px;

                    line-height:
                        1.5;

                }


                .detail-label {

                    color:
                        var(--app-secondary-text);

                    min-width:
                        80px;

                    flex-shrink:
                        0;

                }


                .detail-value {

                    color:
                        var(--app-text);

                    word-break:
                        break-word;

                }


                .detail-description {

                    display:
                        -webkit-box;

                    -webkit-line-clamp:
                        2;

                    -webkit-box-orient:
                        vertical;

                    overflow:
                        hidden;

                    color:
                        var(--app-secondary-text);

                }


                /* =========================
                   CARD FOOTER
                ========================= */

                .card-footer {

                    padding-top:
                        16px;

                    border-top:
                        1px solid
                        var(--app-border);

                }


                .card-buttons {

                    display:
                        flex;

                    gap:
                        10px;

                }


                .card-buttons button {

                    flex:
                        1;

                    border:
                        1px solid
                        transparent;

                    padding:
                        10px;

                    border-radius:
                        8px;

                    cursor:
                        pointer;

                    font-weight:
                        600;

                    font-size:
                        12px;

                    transition:
                        background 0.2s ease,
                        border-color 0.2s ease,
                        color 0.2s ease,
                        transform 0.2s ease;

                }


                /* =========================
                   VIEW BUTTON
                ========================= */

                .btn-view {

                    background:
                        var(--app-card-2);

                    color:
                        #7c3aed;

                    border:
                        1px solid
                        var(--app-border) !important;

                }


                .btn-view:hover {

                    background:
                        rgba(
                            124,
                            58,
                            237,
                            0.10
                        );

                    color:
                        #6d28d9;

                    border-color:
                        #8b5cf6 !important;

                    transform:
                        translateY(-1px);

                }


                /* =========================
                   DELETE BUTTON
                ========================= */

                .btn-delete {

                    background:
                        rgba(
                            239,
                            68,
                            68,
                            0.08
                        );

                    color:
                        #dc2626;

                    border:
                        1px solid
                        rgba(
                            239,
                            68,
                            68,
                            0.22
                        ) !important;

                }


                .btn-delete:hover {

                    background:
                        rgba(
                            239,
                            68,
                            68,
                            0.14
                        );

                    border-color:
                        #ef4444 !important;

                    transform:
                        translateY(-1px);

                }


                /* =========================
                   DARK THEME BUTTONS
                ========================= */

                [data-theme="dark"]
                .btn-view {

                    color:
                        #c4b5fd;

                    background:
                        var(--app-card-2);

                    border:
                        1px solid
                        #493773 !important;

                }


                [data-theme="dark"]
                .btn-view:hover {

                    background:
                        #2a2140;

                    border-color:
                        #6749a1 !important;

                }


                [data-theme="dark"]
                .btn-delete {

                    background:
                        #28191d;

                    color:
                        #fca5a5;

                    border:
                        1px solid
                        #66333a !important;

                }


                [data-theme="dark"]
                .btn-delete:hover {

                    background:
                        #382025;

                    border-color:
                        #87404a !important;

                }


                /* =========================
                   EMPTY STATE
                ========================= */

                .empty-state {

                    width:
                        100%;

                    box-sizing:
                        border-box;

                    background:
                        var(--app-card);

                    border:
                        1px solid
                        var(--app-border);

                    border-radius:
                        14px;

                    padding:
                        55px 30px;

                    text-align:
                        center;

                    color:
                        var(--app-secondary-text);

                    font-size:
                        14px;

                    transition:
                        background 0.25s ease,
                        border-color 0.25s ease;

                }


                /* =========================
                   MESSAGE
                ========================= */

                .info-message {

                    margin-top:
                        20px;

                    padding:
                        12px 15px;

                    color:
                        #dc2626;

                    background:
                        rgba(
                            239,
                            68,
                            68,
                            0.08
                        );

                    border:
                        1px solid
                        rgba(
                            239,
                            68,
                            68,
                            0.22
                        );

                    border-radius:
                        8px;

                    font-size:
                        13px;

                }


                /* =========================
                   DARK MESSAGE
                ========================= */

                [data-theme="dark"]
                .info-message {

                    color:
                        #fca5a5;

                    background:
                        #28191d;

                    border:
                        1px solid
                        #66333a;

                }


                /* =========================
                   TABLET
                ========================= */

                @media (max-width: 1100px) {

                    .decisions-grid {

                        grid-template-columns:
                            repeat(
                                2,
                                minmax(0, 1fr)
                            );

                    }

                }


                /* =========================
                   MOBILE
                ========================= */

                @media (max-width: 700px) {

                    .decisions-top-bar {

                        align-items:
                            flex-start;

                        flex-direction:
                            column-reverse;

                    }


                    .create-btn {

                        width:
                            100%;

                    }


                    .decisions-grid {

                        grid-template-columns:
                            1fr;

                    }

                }


                @media (max-width: 450px) {

                    .decision-card {

                        padding:
                            18px;

                    }


                    .decision-card-header {

                        flex-direction:
                            column;

                    }


                    .visibility-badge {

                        align-self:
                            flex-start;

                    }


                    .detail-row {

                        flex-direction:
                            column;

                        gap:
                            2px;

                    }


                    .detail-label {

                        min-width:
                            auto;

                    }


                                        .card-buttons {

                        flex-direction:
                            column;

                    }

                }

                /* =========================
                   RESULTS SECTION
                ========================= */

                .decision-results {
                    margin: 10px 20px 0;
                    padding-top: 14px;
                    border-top: 1px solid var(--app-border);
                }

                .reveal-result-btn {
                    width: 100%;
                    padding: 10px;
                    border: 1px dashed rgba(139, 92, 246, .4);
                    border-radius: 10px;
                    background: rgba(139, 92, 246, .08);
                    color: #8b5cf6;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .reveal-result-btn:hover {
                    background: rgba(139, 92, 246, .16);
                }

                .hide-result-btn {
                    display: block;
                    margin: 6px 0 0 auto;
                    border: 0;
                    background: transparent;
                    color: var(--app-secondary-text);
                    font-size: 10px;
                    text-decoration: underline;
                    cursor: pointer;
                }

                .result-banner {
                    margin-bottom: 10px;
                    padding: 10px 12px;
                    border-radius: 10px;
                    font-size: 12px;
                    font-weight: 700;
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

                .decision-options-mini {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .mini-option {
                    padding: 8px 10px;
                    border: 1px solid var(--app-border);
                    border-radius: 8px;
                    background: var(--app-card-2);
                }

                .mini-option.is-leading {
                    border-color: #22c55e;
                    background: rgba(34, 197, 94, .10);
                }

                .mini-option-top {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    color: var(--app-text);
                    margin-bottom: 5px;
                }

                .leading-badge {
                    margin-left: 5px;
                    font-size: 10px;
                }

                .option-bar-track {
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

                /* =========================
                   REPORT BUTTON
                ========================= */

                .report-action {
                    padding: 9px 12px;
                    border: 1px solid rgba(34, 197, 94, .3);
                    border-radius: 7px;
                    background: rgba(34, 197, 94, .08);
                    color: #15803d;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .report-action:hover {
                    background: rgba(34, 197, 94, .16);
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

                @media print {
                    body > *:not(#report-print-root) { display: none !important; }
                    #report-print-root { display: block !important; position: static !important; background: #fff !important; padding: 0 !important; }
                    .report-modal { max-width: 100% !important; max-height: none !important; overflow: visible !important; box-shadow: none !important; border: none !important; background: #fff !important; }
                    .report-modal-head, .report-actions { display: none !important; }

                    .report-body h2 { color: #111 !important; }
                    .report-desc { color: #444 !important; }
                    .report-meta-grid { background: #f7f7f7 !important; border-color: #ddd !important; }
                    .report-meta-grid span { color: #777 !important; }
                    .report-meta-grid strong { color: #111 !important; }
                    .report-table th { color: #666 !important; }
                    .report-table td { color: #111 !important; }
                    .report-table th, .report-table td { border-color: #ddd !important; }
                    .report-winner-line.win { background: #eafaf0 !important; color: #15803d !important; border-color: #86efac !important; }
                    .report-winner-line.tie { background: #fff7e6 !important; color: #b45309 !important; border-color: #fcd34d !important; }
                    .report-winner-line.empty { background: #f5f5f5 !important; color: #666 !important; border-color: #ddd !important; }
                }

            `}</style>


            <div className="my-decisions-page">


                {/* =========================
                    TOP BAR
                ========================= */}

                <div className="decisions-top-bar">

                    <div className="decision-count">

                        You have{" "}

                        <strong>
                            {decisions.length}
                        </strong>{" "}

                        decision
                        {decisions.length !== 1
                            ? "s"
                            : ""}

                    </div>


                    <button
                        className="create-btn"
                        onClick={() =>
                            navigate(
                                "/create-decision"
                            )
                        }
                    >

                        + Create Decision

                    </button>

                </div>


                {/* =========================
                    LOADING
                ========================= */}

                {loading && (

                    <div className="empty-state">

                        Loading your decisions...

                    </div>

                )}


                {/* =========================
                    EMPTY
                ========================= */}

                {!loading &&
                    decisions.length === 0 && (

                        <div className="empty-state">

                            You haven't created any
                            decisions yet.

                            <br />

                            Click "Create Decision"
                            to get started.

                        </div>

                    )}


                {/* =========================
                    DECISION CARDS
                ========================= */}

                {!loading &&
                    decisions.length > 0 && (

                        <div className="decisions-grid">

                            {decisions.map(
                                (decision) => (

                                    <div
                                        className="decision-card"
                                        key={decision.id}
                                    >


                                        {/* CARD HEADER */}

                                        <div className="decision-card-header">

                                            <h2>
                                                {decision.title}
                                            </h2>


                                            <span
                                                className={
                                                    "visibility-badge " +
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

                                            </span>

                                        </div>


                                        {/* DETAILS */}

                                        <div className="decision-details">


                                            <div className="detail-row">

                                                <span className="detail-label">
                                                    Category
                                                </span>

                                                <span className="detail-value">
                                                    {decision.category ||
                                                        "Uncategorized"}
                                                </span>

                                            </div>


                                            <div className="detail-row">

                                                <span className="detail-label">
                                                    Community
                                                </span>

                                                <span className="detail-value">
                                                    {decision.communityName ||
                                                        "Personal / public"}
                                                </span>

                                            </div>


                                            <div className="detail-row">

                                                <span className="detail-label">
                                                    Options & votes
                                                </span>

                                                <span className="detail-value">

                                                    {decision.options?.length ||
                                                        0}{" "}

                                                    options ·{" "}

                                                    {decision.totalVotes ||
                                                        0}{" "}

                                                    votes

                                                </span>

                                            </div>


                                            <div className="detail-row">

                                                <span className="detail-label">
                                                    Created
                                                </span>

                                                <span className="detail-value">

                                                    {decision.createdAt
                                                        ? new Date(
                                                            decision.createdAt
                                                        ).toLocaleDateString()
                                                        : "Not available"}

                                                </span>

                                            </div>


                                            <div className="detail-row">

                                                <span className="detail-label">
                                                    Deadline
                                                </span>

                                                <span className="detail-value">

                                                    {decision.deadline ||
                                                        "No deadline"}

                                                </span>

                                            </div>


                                            <div className="detail-row">

                                                <span className="detail-label">
                                                    Description
                                                </span>

                                                <span
                                                    className={
                                                        "detail-value " +
                                                        "detail-description"
                                                    }
                                                >

                                                                                                        {decision.description ||
                                                        "No description provided."}

                                                </span>

                                            </div>


                                        </div>


                                        {/* RESULTS */}

                                        {(() => {
                                            const { winnerIds, winners, isTie, totalVotes } = getWinnerInfo(decision.options);
                                            const isRevealed = !!revealedResults[decision.id];

                                            return (
                                                <div className="decision-results">

                                                    {!isRevealed ? (
                                                        <button className="reveal-result-btn" onClick={() => toggleReveal(decision.id)}>
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
                                                                {totalVotes === 0 && "🗳️ No votes yet"}
                                                                {totalVotes > 0 && isTie && (
                                                                    <>🤝 Tie between <strong>{winners.map((w) => w.optionText).join(" & ")}</strong></>
                                                                )}
                                                                {totalVotes > 0 && !isTie && (
                                                                    <>
                                                                        {decision.status === "COMPLETED" ? "✅ Final Result: " : "🏆 Currently Leading: "}
                                                                        <strong>{winners[0].optionText}</strong>
                                                                        {" — "}
                                                                        {winners[0].voteCount} votes ({Math.round((winners[0].voteCount / totalVotes) * 100)}%)
                                                                    </>
                                                                )}
                                                            </div>

                                                            <div className="decision-options-mini">
                                                                {decision.options?.map((option) => {
                                                                    const isLeading = !isTie && winnerIds.has(option.id) && totalVotes > 0;
                                                                    const isTiedLeader = isTie && winnerIds.has(option.id);
                                                                    const percent = totalVotes > 0 ? Math.round(((option.voteCount || 0) / totalVotes) * 100) : 0;

                                                                    return (
                                                                        <div className={`mini-option ${isLeading || isTiedLeader ? "is-leading" : ""}`} key={option.id}>
                                                                            <div className="mini-option-top">
                                                                                <span>
                                                                                    {option.optionText}
                                                                                    {isLeading && <span className="leading-badge">🏆</span>}
                                                                                </span>
                                                                                <span>{option.voteCount || 0} · {percent}%</span>
                                                                            </div>
                                                                            <div className="option-bar-track">
                                                                                <div
                                                                                    className={`option-bar-fill ${isLeading || isTiedLeader ? "is-leading" : ""}`}
                                                                                    style={{ width: `${percent}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            <button className="hide-result-btn" onClick={() => toggleReveal(decision.id)}>
                                                                Hide result
                                                            </button>
                                                        </>
                                                    )}

                                                </div>
                                            );
                                        })()}


                                        {/* FOOTER */}

                                        <div className="card-footer">

                                            <div className="card-buttons">


                                                                                                <button
                                                    className="btn-view"
                                                    onClick={() =>
                                                        navigate(
                                                            `/polls`
                                                        )
                                                    }
                                                >

                                                    View Details

                                                </button>


                                                <button
                                                    className="report-action"
                                                    onClick={() => setReportDecision(decision)}
                                                >

                                                    📊 Report

                                                </button>


                                                <button
                                                    className="btn-delete"
                                                    onClick={() =>
                                                        deleteDecision(
                                                            decision.id
                                                        )
                                                    }
                                                >

                                                    Delete

                                                </button>


                                            </div>

                                        </div>


                                    </div>

                                )
                            )}

                        </div>

                    )}


                {/* MESSAGE */}

                                {message && (

                    <div className="info-message">

                        {message}

                    </div>

                )}


            </div>

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
                                    <thead><tr><th>Option</th><th>Votes</th><th>Share</th></tr></thead>
                                    <tbody>
                                        {report.options.map((o) => (
                                            <tr key={o.text}><td>{o.text}</td><td>{o.votes}</td><td>{o.percent}%</td></tr>
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

export default MyDecisions;