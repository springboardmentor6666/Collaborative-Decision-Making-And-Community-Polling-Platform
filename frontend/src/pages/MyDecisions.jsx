import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function MyDecisions() {

    const [decisions, setDecisions] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();


    /* =========================
       FETCH DECISIONS
    ========================= */

    useEffect(() => {
        fetchDecisions();
    }, []);


    const fetchDecisions = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:8080/api/decisions",
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {
                throw new Error("Failed to load decisions");
            }


            const data = await response.json();

            setDecisions(data);


        } catch (error) {

            console.error(error);

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

        if (!window.confirm("Delete this decision?")) {
            return;
        }


        try {

            const token = localStorage.getItem("token");


            if (!token) {

                alert("Please login first");

                navigate("/login");

                return;
            }


            const response = await fetch(
                `http://localhost:8080/api/decisions/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization": `Bearer ${token}`
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

                alert(
                    `Failed to delete: ${result}`
                );

                return;
            }


            alert(
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

            alert("Server Error");

        }

    };


    return (

        <DashboardLayout
            pageTitle="My Decisions"
            pageSubtitle="View, manage and share the decision boards you've created."
        >

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

                    color: #f8fafc;
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

                    margin-bottom: 24px;

                    gap: 15px;
                }


                .decision-count {

                    color: #918a9f;

                    font-size: 13px;
                }


                .decision-count strong {

                    color: #d8b4fe;

                    font-weight: 600;
                }


                /* =========================
                   CREATE BUTTON
                ========================= */

                .create-btn {

                    background:
                        #6d3dcc;

                    color: white;

                    border: none;

                    padding:
                        11px 18px;

                    border-radius: 8px;

                    font-weight: 600;

                    font-size: 13px;

                    cursor: pointer;

                    transition:
                        background 0.2s ease,
                        transform 0.2s ease;
                }


                .create-btn:hover {

                    background:
                        #7848d8;

                    transform:
                        translateY(-1px);
                }


                /* =========================
                   DECISION GRID
                ========================= */

                .decisions-grid {

                    width: 100%;

                    display: grid;

                    grid-template-columns:
                        repeat(
                            3,
                            minmax(0, 1fr)
                        );

                    gap: 20px;
                }


                /* =========================
                   DECISION CARD
                ========================= */

                .decision-card {

                    position: relative;

                    min-width: 0;

                    background:
                        #15121f;

                    border:
                        1px solid #2d2840;

                    border-radius:
                        14px;

                    padding:
                        22px;

                    overflow: hidden;

                    transition:
                        transform 0.2s ease,
                        border-color 0.2s ease,
                        box-shadow 0.2s ease;
                }


                .decision-card::before {

                    content: "";

                    position: absolute;

                    top: 0;
                    left: 0;

                    width: 100%;

                    height: 3px;

                    background:
                        #6d3dcc;
                }


                .decision-card:hover {

                    transform:
                        translateY(-4px);

                    border-color:
                        #4b3970;

                    box-shadow:
                        0 12px 30px
                        rgba(0, 0, 0, 0.25);
                }


                /* =========================
                   CARD HEADER
                ========================= */

                .decision-card-header {

                    display: flex;

                    align-items:
                        flex-start;

                    justify-content:
                        space-between;

                    gap: 12px;

                    margin-bottom:
                        18px;
                }


                .decision-card h2 {

                    color:
                        #f5f2f9;

                    font-size:
                        18px;

                    font-weight:
                        600;

                    line-height:
                        1.35;

                    margin: 0;

                    word-break:
                        break-word;
                }


                /* =========================
                   VISIBILITY BADGE
                ========================= */

                .visibility-badge {

                    flex-shrink: 0;

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
                        #86efac;

                    background:
                        #10251d;

                    border:
                        1px solid #235c43;
                }


                .visibility-private {

                    color:
                        #fca5a5;

                    background:
                        #28191d;

                    border:
                        1px solid #66333a;
                }


                /* =========================
                   DETAILS
                ========================= */

                .decision-details {

                    display:
                        flex;

                    flex-direction:
                        column;

                    gap: 10px;

                    margin-bottom:
                        20px;
                }


                .detail-row {

                    display:
                        flex;

                    align-items:
                        flex-start;

                    gap: 8px;

                    font-size:
                        13px;

                    line-height:
                        1.5;
                }


                .detail-label {

                    color:
                        #81798e;

                    min-width:
                        80px;

                    flex-shrink: 0;
                }


                .detail-value {

                    color:
                        #c8c2d2;

                    word-break:
                        break-word;
                }


                .detail-description {

                    display:
                        -webkit-box;

                    -webkit-line-clamp: 2;

                    -webkit-box-orient:
                        vertical;

                    overflow:
                        hidden;
                }


                /* =========================
                   CARD FOOTER
                ========================= */

                .card-footer {

                    padding-top:
                        16px;

                    border-top:
                        1px solid #292433;
                }


                .card-buttons {

                    display:
                        flex;

                    gap: 10px;
                }


                .card-buttons button {

                    flex: 1;

                    border: none;

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
                        border-color 0.2s ease;
                }


                /* =========================
                   VIEW
                ========================= */

                .btn-view {

                    background:
                        #211a32;

                    color:
                        #c4b5fd;

                    border:
                        1px solid #493773 !important;
                }


                .btn-view:hover {

                    background:
                        #2a2140;

                    border-color:
                        #6749a1 !important;
                }


                /* =========================
                   DELETE
                ========================= */

                .btn-delete {

                    background:
                        #28191d;

                    color:
                        #fca5a5;

                    border:
                        1px solid #66333a !important;
                }


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

                    width: 100%;

                    background:
                        #15121f;

                    border:
                        1px solid #2d2840;

                    border-radius:
                        14px;

                    padding:
                        55px 30px;

                    text-align:
                        center;

                    color:
                        #918a9f;

                    font-size:
                        14px;
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
                        #fca5a5;

                    background:
                        #28191d;

                    border:
                        1px solid #66333a;

                    border-radius:
                        8px;

                    font-size:
                        13px;
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

                        width: 100%;
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

                        gap: 2px;
                    }


                    .detail-label {

                        min-width:
                            auto;
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
                                                            `/decision/${decision.id}`
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