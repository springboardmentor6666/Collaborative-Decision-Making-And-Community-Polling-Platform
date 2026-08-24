import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

function MyDecisions() {
    const [decisions, setDecisions] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [isError, setIsError] = useState(false);

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

        </DashboardLayout>

    );

}

export default MyDecisions;