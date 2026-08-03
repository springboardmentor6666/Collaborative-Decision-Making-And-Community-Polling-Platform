import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function MyDecisions() {

    const [decisions, setDecisions] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

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

        } catch (error) {

            setMessage("Unable to load decisions");

        } finally {

            setLoading(false);

        }

    };

    const deleteDecision = async (id) => {

        if (!window.confirm("Delete this decision?")) {
            return;
        }

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:8080/decisions/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const result = await response.text();

            alert(result);

            fetchDecisions();

        } catch (error) {

            alert("Server Error");

        }

    };

    return (
        <DashboardLayout
            pageTitle="My Decisions"
            pageSubtitle="View, manage and share the decision boards you've created."
        >

            <style>{`

            .top-bar{

                display:flex;
                justify-content:flex-end;
                margin-bottom:24px;

            }

            .create-btn{

                background:#4f46e5;
                color:white;
                border:none;
                padding:11px 20px;
                border-radius:10px;
                font-weight:600;
                font-size:14px;
                cursor:pointer;
                transition:.15s;

            }

            .create-btn:hover{

                background:#4338ca;

            }

            .decisions-grid{

                display:grid;
                grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
                gap:22px;

            }

            .decision-card{

                background:white;
                border-radius:16px;
                padding:24px;
                box-shadow:0 1px 4px rgba(0,0,0,.06);
                transition:.2s;

            }

            .decision-card:hover{

                box-shadow:0 8px 20px rgba(0,0,0,.1);

            }

            .decision-card h2{

                font-size:18px;
                color:#111827;
                margin-bottom:14px;

            }

            .decision-card p{

                font-size:13px;
                color:#4b5563;
                margin-bottom:8px;
                line-height:1.5;

            }

            .decision-card p b{

                color:#111827;

            }

            .card-buttons{

                display:flex;
                gap:10px;
                margin-top:18px;

            }

            .card-buttons button{

                flex:1;
                border:none;
                padding:10px;
                border-radius:8px;
                cursor:pointer;
                font-weight:600;
                font-size:13px;
                transition:.15s;

            }

            .btn-view{

                background:#eef2ff;
                color:#4338ca;

            }

            .btn-view:hover{

                background:#e0e7ff;

            }

            .btn-delete{

                background:#fef2f2;
                color:#dc2626;

            }

            .btn-delete:hover{

                background:#fee2e2;

            }

            .empty-state{

                background:white;
                border-radius:16px;
                padding:50px;
                text-align:center;
                color:#6b7280;
                box-shadow:0 1px 4px rgba(0,0,0,.06);

            }

            .info-message{

                margin-top:20px;
                color:#6b7280;
                font-size:14px;

            }

            `}</style>

            <div className="top-bar">

                <button
                    className="create-btn"
                    onClick={() => navigate("/create-decision")}
                >
                    + Create Decision
                </button>

            </div>

            {loading && (
                <div className="empty-state">Loading your decisions...</div>
            )}

            {!loading && decisions.length === 0 && (
                <div className="empty-state">
                    You haven't created any decisions yet. Click "Create Decision" to get started.
                </div>
            )}

            {!loading && decisions.length > 0 && (

                <div className="decisions-grid">

                    {
                        decisions.map((decision) => (

                            <div className="decision-card" key={decision.id}>

                                <h2>{decision.title}</h2>

                                <p>
                                    <b>Category :</b> {decision.category || "Uncategorized"}
                                </p>

                                <p>
                                    <b>Visibility :</b> {decision.visibility}
                                </p>

                                <p>
                                    <b>Deadline :</b> {decision.deadline || "No deadline"}
                                </p>

                                <p>
                                    <b>Description :</b> {decision.description || "—"}
                                </p>

                                <div className="card-buttons">

                                    <button
                                        className="btn-view"
                                        onClick={() =>
                                            navigate(`/decision/${decision.id}`)
                                        }
                                    >
                                        View
                                    </button>

                                    <button
                                        className="btn-delete"
                                        onClick={() =>
                                            deleteDecision(decision.id)
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        ))
                    }

                </div>

            )}

            {message && (
                <div className="info-message">
                    {message}
                </div>
            )}

        </DashboardLayout>
    );
}

export default MyDecisions;