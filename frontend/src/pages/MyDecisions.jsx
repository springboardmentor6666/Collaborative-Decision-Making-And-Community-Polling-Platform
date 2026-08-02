import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyDecisions() {

    const [decisions, setDecisions] = useState([]);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        fetchDecisions();
    }, []);

    const fetchDecisions = async () => {

        try {

            const response = await fetch("http://localhost:8080/decisions");

            const data = await response.json();

            setDecisions(data);

        } catch (error) {

            setMessage("Unable to load decisions");

        }

    };

    const deleteDecision = async (id) => {

        if (!window.confirm("Delete this decision?")) {
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:8080/decisions/${id}`,
                {
                    method: "DELETE"
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
        <>
            <style>{`

            *{
                margin:0;
                padding:0;
                box-sizing:border-box;
                font-family:Arial;
            }

            body{
                background:linear-gradient(135deg,#2563eb,#7c3aed);
            }

            .container{

                min-height:100vh;
                padding:40px;

            }

            .top{

                display:flex;
                justify-content:space-between;
                align-items:center;
                color:white;
                margin-bottom:30px;

            }

            .create{

                background:#10b981;
                color:white;
                border:none;
                padding:12px 18px;
                border-radius:8px;
                cursor:pointer;

            }

            .grid{

                display:grid;
                grid-template-columns:repeat(auto-fit,minmax(320px,1fr));
                gap:25px;

            }

            .card{

                background:rgba(255,255,255,.15);
                backdrop-filter:blur(12px);
                border-radius:18px;
                padding:25px;
                color:white;

            }

            .card h2{

                margin-bottom:15px;

            }

            .card p{

                margin-bottom:10px;

            }

            .buttons{

                display:flex;
                gap:10px;
                margin-top:20px;

            }

            .buttons button{

                flex:1;
                border:none;
                padding:10px;
                border-radius:8px;
                cursor:pointer;

            }

            .view{

                background:#2563eb;
                color:white;

            }

            .delete{

                background:#ef4444;
                color:white;

            }

            `}</style>

            <div className="container">

                <div className="top">

                    <h1 style={{color:"white"}}>My Decisions</h1>

                    <button
                        className="create"
                        onClick={() => navigate("/create-decision")}
                    >
                        + Create Decision
                    </button>

                </div>

                <div className="grid">

                    {
                        decisions.map((decision) => (

                            <div className="card" key={decision.id}>

                                <h2>{decision.title}</h2>

                                <p>
                                    <b>Category :</b> {decision.category}
                                </p>

                                <p>
                                    <b>Visibility :</b> {decision.visibility}
                                </p>

                                <p>
                                    <b>Deadline :</b> {decision.deadline}
                                </p>

                                <p>
                                    <b>Description :</b> {decision.description}
                                </p>

                                <div className="buttons">

                                    <button
                                        className="view"
                                        onClick={() =>
                                            navigate(`/decision/${decision.id}`)
                                        }
                                    >
                                        View
                                    </button>

                                    <button
                                        className="delete"
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

                <h3 style={{color:"white",marginTop:"20px"}}>
                    {message}
                </h3>

            </div>

        </>
    );
}

export default MyDecisions;