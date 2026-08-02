import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateDecision() {

    const navigate = useNavigate();

    const [decision, setDecision] = useState({
        title: "",
        description: "",
        category: "",
        visibility: "PUBLIC",
        deadline: "",
        anonymous: false
    });

    const [options, setOptions] = useState(["", ""]);

    const [message, setMessage] = useState("");

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setDecision({
            ...decision,
            [name]: type === "checkbox" ? checked : value
        });

    };

    const handleOptionChange = (index, value) => {

        const updatedOptions = [...options];
        updatedOptions[index] = value;
        setOptions(updatedOptions);

    };

    const addOption = () => {

        setOptions([...options, ""]);

    };

    const handleSubmit = async () => {

        const data = {
            ...decision,
            options: options.filter(option => option.trim() !== "")
        };

        try {

            const response = await fetch("http://localhost:8080/decisions", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)

            });

            const result = await response.text();

            setMessage(result);

            setTimeout(() => {

                navigate("/home");

            }, 1500);

        }
        catch (error) {

            setMessage("Server Error");

        }

    };

    return (

        <>
            <style>{`

            body{
                background:linear-gradient(135deg,#2563eb,#7c3aed);
                font-family:Arial;
            }

            .container{

                display:flex;
                justify-content:center;
                padding:40px;

            }

            .card{

                width:700px;
                background:rgba(255,255,255,.15);
                backdrop-filter:blur(10px);
                padding:35px;
                border-radius:20px;
                color:white;

            }

            h1{

                text-align:center;
                margin-bottom:25px;

            }

            input,textarea,select{

                width:100%;
                padding:12px;
                margin-top:10px;
                margin-bottom:18px;
                border:none;
                border-radius:8px;

            }

            textarea{

                resize:none;
                height:90px;

            }

            .radio{

                margin:15px 0;

            }

            .radio label{

                margin-right:25px;

            }

            button{

                padding:12px 18px;
                border:none;
                border-radius:8px;
                cursor:pointer;
                margin-top:15px;

            }

            .add{

                background:#10b981;
                color:white;

            }

            .submit{

                width:100%;
                background:#2563eb;
                color:white;

            }

            .msg{

                margin-top:20px;
                text-align:center;
                font-weight:bold;

            }

            `}</style>

            <div className="container">

                <div className="card">

                    <h1>Create Decision</h1>

                    <input
                        name="title"
                        placeholder="Decision Title"
                        onChange={handleChange}
                    />

                    <textarea
                        name="description"
                        placeholder="Description"
                        onChange={handleChange}
                    />

                    <select
                        name="category"
                        onChange={handleChange}
                    >

                        <option value="">Select Category</option>
                        <option>Career</option>
                        <option>Technology</option>
                        <option>Education</option>
                        <option>Travel</option>
                        <option>Finance</option>

                    </select>

                    <div className="radio">

                        <label>

                            <input
                                type="radio"
                                name="visibility"
                                value="PUBLIC"
                                checked={decision.visibility === "PUBLIC"}
                                onChange={handleChange}
                            />

                            Public

                        </label>

                        <label>

                            <input
                                type="radio"
                                name="visibility"
                                value="PRIVATE"
                                checked={decision.visibility === "PRIVATE"}
                                onChange={handleChange}
                            />

                            Private

                        </label>

                    </div>

                    <input
                        type="date"
                        name="deadline"
                        onChange={handleChange}
                    />

                    <label>

                        <input
                            type="checkbox"
                            name="anonymous"
                            onChange={handleChange}
                        />

                        Allow Anonymous Voting

                    </label>

                    <h3 style={{marginTop:"20px"}}>Options</h3>

                    {

                        options.map((option,index)=>(

                            <input

                                key={index}

                                placeholder={`Option ${index+1}`}

                                value={option}

                                onChange={(e)=>handleOptionChange(index,e.target.value)}

                            />

                        ))

                    }

                    <button
                        className="add"
                        onClick={addOption}
                    >

                        + Add Option

                    </button>

                    <button
                        className="submit"
                        onClick={handleSubmit}
                    >

                        Create Decision

                    </button>

                    <div className="msg">

                        {message}

                    </div>

                </div>

            </div>

        </>

    );

}

export default CreateDecision;