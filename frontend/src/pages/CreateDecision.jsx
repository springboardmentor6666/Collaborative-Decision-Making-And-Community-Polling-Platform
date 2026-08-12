import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

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

            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:8080/api/decisions",/*just changed the /api in the url*/ {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
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

        <DashboardLayout
            pageTitle="Create Decision"
            pageSubtitle="Set up a new decision board for people to vote on."
        >

            <style>{`

            .form-card{
                background:white;
                border-radius:16px;
                padding:32px;
                box-shadow:0 1px 4px rgba(0,0,0,.06);
                max-width:760px;
            }

            .field-label{
                font-size:13px;
                font-weight:600;
                color:#374151;
                margin-bottom:6px;
                display:block;
            }

            .field-group{
                margin-bottom:20px;
            }

            .form-card input[type="text"],
            .form-card input:not([type]),
            .form-card input[type="date"],
            .form-card textarea,
            .form-card select{

                width:100%;
                padding:12px 14px;
                border:1px solid #e5e7eb;
                border-radius:10px;
                font-size:14px;
                color:#111827;
                background:#f9fafb;
                outline:none;
                transition:.15s;

            }

            .form-card input:focus,
            .form-card textarea:focus,
            .form-card select:focus{

                border-color:#4f46e5;
                background:white;
                box-shadow:0 0 0 3px rgba(79,70,229,.12);

            }

            .form-card textarea{

                resize:none;
                height:90px;

            }

            .radio-row{

                display:flex;
                gap:28px;
                margin-bottom:20px;

            }

            .radio-option{

                display:flex;
                align-items:center;
                gap:8px;
                font-size:14px;
                color:#374151;
                cursor:pointer;

            }

            .radio-option input{

                width:16px;
                height:16px;
                accent-color:#4f46e5;

            }

            .checkbox-row{

                display:flex;
                align-items:center;
                gap:10px;
                margin-bottom:24px;
                font-size:14px;
                color:#374151;

            }

            .checkbox-row input{

                width:16px;
                height:16px;
                accent-color:#4f46e5;

            }

            .section-heading{

                font-size:15px;
                font-weight:700;
                color:#111827;
                margin:24px 0 12px;

            }

            .option-input{

                margin-bottom:10px;

            }

            .btn-row{

                display:flex;
                gap:12px;
                margin-top:10px;

            }

            .btn-add{

                background:#ecfdf5;
                color:#059669;
                border:1px solid #a7f3d0;
                padding:11px 18px;
                border-radius:10px;
                font-weight:600;
                font-size:14px;
                cursor:pointer;

            }

            .btn-add:hover{

                background:#d1fae5;

            }

            .btn-submit{

                width:100%;
                background:#4f46e5;
                color:white;
                border:none;
                padding:13px 18px;
                border-radius:10px;
                font-weight:700;
                font-size:14px;
                cursor:pointer;
                margin-top:22px;
                transition:.15s;

            }

            .btn-submit:hover{

                background:#4338ca;

            }

            .form-message{

                margin-top:16px;
                text-align:center;
                font-weight:600;
                color:#4f46e5;
                font-size:14px;

            }

            `}</style>

            <div className="form-card">

                <div className="field-group">
                    <span className="field-label">Decision Title</span>
                    <input
                        name="title"
                        placeholder="e.g. Which framework should we use?"
                        onChange={handleChange}
                    />
                </div>

                <div className="field-group">
                    <span className="field-label">Description</span>
                    <textarea
                        name="description"
                        placeholder="Add some context for people voting..."
                        onChange={handleChange}
                    />
                </div>

                <div className="field-group">
                    <span className="field-label">Category</span>
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
                </div>

                <span className="field-label">Visibility</span>
                <div className="radio-row">

                    <label className="radio-option">

                        <input
                            type="radio"
                            name="visibility"
                            value="PUBLIC"
                            checked={decision.visibility === "PUBLIC"}
                            onChange={handleChange}
                        />

                        Public

                    </label>

                    <label className="radio-option">

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

                <div className="field-group">
                    <span className="field-label">Deadline</span>
                    <input
                        type="date"
                        name="deadline"
                        onChange={handleChange}
                    />
                </div>

                <label className="checkbox-row">

                    <input
                        type="checkbox"
                        name="anonymous"
                        onChange={handleChange}
                    />

                    Allow Anonymous Voting

                </label>

                <div className="section-heading">Options</div>

                {

                    options.map((option, index) => (

                        <div className="option-input" key={index}>
                            <input

                                placeholder={`Option ${index + 1}`}

                                value={option}

                                onChange={(e) => handleOptionChange(index, e.target.value)}

                            />
                        </div>

                    ))

                }

                <div className="btn-row">

                    <button
                        className="btn-add"
                        onClick={addOption}
                    >

                        + Add Option

                    </button>

                </div>

                <button
                    className="btn-submit"
                    onClick={handleSubmit}
                >

                    Create Decision

                </button>

                {message && (
                    <div className="form-message">
                        {message}
                    </div>
                )}

            </div>

        </DashboardLayout>

    );

}

export default CreateDecision;