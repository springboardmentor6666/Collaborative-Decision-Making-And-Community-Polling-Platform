import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

function CreateDecision() {
    const navigate = useNavigate();
    const location = useLocation();

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
    const [isError, setIsError] = useState(false);
    const [communities, setCommunities] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    /* =========================================================
       COMMUNITY FROM URL
    ========================================================= */

    useEffect(() => {
        const communityId =
            new URLSearchParams(location.search).get("communityId");

        if (communityId) {
            setDecision((current) => ({
                ...current,
                communityId
            }));
        }
    }, [location.search]);

    /* =========================================================
       FETCH COMMUNITIES
    ========================================================= */

    useEffect(() => {
        const token = sessionStorage.getItem("token");

        if (!token) return;

        fetch(
            "http://localhost:8080/api/communities",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
            .then(async (response) =>
                response.ok ? response.json() : []
            )
            .then(setCommunities)
            .catch(() => setCommunities([]));
    }, []);

    /* =========================================================
       CLEAR MESSAGE
    ========================================================= */

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(
            () => setMessage(""),
            3500
        );

        return () => clearTimeout(timer);
    }, [message]);

    /* =========================================================
       HANDLE INPUT CHANGE
    ========================================================= */

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setDecision({
            ...decision,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        });
    };

    /* =========================================================
       HANDLE OPTION CHANGE
    ========================================================= */

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...options];

        updatedOptions[index] = value;

        setOptions(updatedOptions);
    };

    /* =========================================================
       ADD OPTION
    ========================================================= */

    const addOption = () => {
        setOptions([
            ...options,
            ""
        ]);
    };

    /* =========================================================
       REMOVE OPTION
    ========================================================= */

    const removeOption = (index) => {
        if (options.length > 2) {
            setOptions(
                options.filter(
                    (_, i) => i !== index
                )
            );
        }
    };

    /* =========================================================
       GET CURRENT LOCAL DATE + TIME
       Used as minimum for datetime-local
    ========================================================= */

    const getMinDateTime = () => {
        const now = new Date();

        const year = now.getFullYear();

        const month = String(
            now.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            now.getDate()
        ).padStart(2, "0");

        const hours = String(
            now.getHours()
        ).padStart(2, "0");

        const minutes = String(
            now.getMinutes()
        ).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    /* =========================================================
       HANDLE SUBMIT
    ========================================================= */

    const handleSubmit = async () => {

        const cleanOptions =
            options
                .map(option => option.trim())
                .filter(Boolean);

        /* =====================================================
           BASIC VALIDATION
        ===================================================== */

        if (
            !decision.title.trim() ||
            !decision.description.trim() ||
            cleanOptions.length < 2
        ) {
            setIsError(true);

            setMessage(
                "Enter a title, description, and at least two options."
            );

            return;
        }

        /* =====================================================
           DEADLINE VALIDATION
        ===================================================== */

        if (decision.deadline) {

            const selectedDeadline =
                new Date(decision.deadline);

            const currentTime =
                new Date();

            if (
                isNaN(
                    selectedDeadline.getTime()
                )
            ) {
                setIsError(true);

                setMessage(
                    "Please select a valid deadline."
                );

                return;
            }

            if (
                selectedDeadline <= currentTime
            ) {
                setIsError(true);

                setMessage(
                    "Deadline must be in the future."
                );

                return;
            }
        }

        /* =====================================================
           REQUEST DATA
        ===================================================== */

        const data = {
            ...decision,

            options: cleanOptions,

            communityId:
                decision.communityId
                    ? Number(decision.communityId)
                    : null
        };

        try {

            const token =
                sessionStorage.getItem("token");

            console.log(
                "TOKEN:",
                token
            );

            console.log(
                "DATA:",
                data
            );

            /* =================================================
               LOGIN CHECK
            ================================================= */

            if (!token) {

                setIsError(true);

                setMessage(
                    "Please login first."
                );

                navigate("/login");

                return;
            }

            setSubmitting(true);

            /* =================================================
               CREATE DECISION
            ================================================= */

            const response = await fetch(
                "http://localhost:8080/api/decisions",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(data)
                }
            );

            const result =
                await response
                    .json()
                    .catch(() => ({}));

            console.log(
                "STATUS:",
                response.status
            );

            console.log(
                "RESPONSE:",
                result
            );

            /* =================================================
               ERROR RESPONSE
            ================================================= */

            if (!response.ok) {

                setIsError(true);

                setMessage(
                    result.message ||
                    "Unable to create decision."
                );

                return;
            }

            /* =================================================
               SUCCESS
            ================================================= */

            setIsError(false);

            setMessage(
                "Decision created successfully!"
            );

            setTimeout(() => {

                navigate(
                    decision.communityId
                        ? `/communities/${decision.communityId}`
                        : "/decisions"
                );

            }, 1000);

        } catch (error) {

            console.error(
                "Create decision error:",
                error
            );

            setIsError(true);

            setMessage(
                "Server error. Could not create decision."
            );

        } finally {

            setSubmitting(false);
        }
    };

    /* =========================================================
       MINIMUM DATE + TIME
    ========================================================= */

    const minDateTime =
        getMinDateTime();

    return (
        <DashboardLayout
            pageTitle="Create Decision"
            pageSubtitle="Set up a new decision board for people to vote on."
        >

            <Toast
                message={message}
                isError={isError}
            />

            <style>{`

                /* =========================
                   PAGE
                ========================= */

                .create-page {
                    width: 100%;
                    min-height:
                        calc(100vh - 100px);

                    padding:
                        5px 0 40px;

                    color:
                        var(--app-text);
                }


                /* =========================
                   FORM CARD
                ========================= */

                .form-card {
                    width: 100%;
                    max-width: 850px;

                    background:
                        var(--app-card);

                    border:
                        1px solid
                        var(--app-border);

                    border-radius: 16px;

                    padding: 30px;

                    box-shadow:
                        0 8px 30px
                        rgba(0, 0, 0, 0.12);
                }


                /* =========================
                   FORM INTRO
                ========================= */

                .form-intro {
                    margin-bottom: 28px;

                    padding-bottom: 20px;

                    border-bottom:
                        1px solid
                        var(--app-border);
                }

                .form-intro h2 {
                    color:
                        var(--app-text);

                    font-size: 20px;

                    font-weight: 600;

                    margin-bottom: 6px;
                }

                .form-intro p {
                    color:
                        var(--app-secondary-text);

                    font-size: 13px;

                    line-height: 1.5;
                }


                /* =========================
                   FIELD GROUP
                ========================= */

                .field-group {
                    margin-bottom: 20px;
                }

                .field-label {
                    display: block;

                    font-size: 13px;

                    font-weight: 600;

                    color:
                        #a78bfa;

                    margin-bottom: 7px;
                }


                /* =========================
                   INPUTS
                ========================= */

                .form-card input[type="text"],
                .form-card input:not([type]),
                .form-card input[type="date"],
                .form-card input[type="datetime-local"],
                .form-card textarea,
                .form-card select {

                    width: 100%;

                    padding: 12px 14px;

                    border:
                        1px solid
                        var(--app-border);

                    border-radius: 9px;

                    font-size: 14px;

                    color:
                        var(--app-text);

                    background:
                        var(--app-card-2);

                    outline: none;

                    transition:
                        border-color 0.2s ease,
                        background 0.2s ease;
                }


                .form-card input::placeholder,
                .form-card textarea::placeholder {
                    color:
                        var(--app-secondary-text);
                }


                .form-card input:focus,
                .form-card textarea:focus,
                .form-card select:focus {

                    border-color:
                        #6d4bc3;

                    background:
                        var(--app-card-2);

                    box-shadow:
                        0 0 0 2px
                        rgba(
                            109,
                            75,
                            195,
                            0.12
                        );
                }


                /* =========================
                   DATETIME INPUT
                ========================= */

                .form-card input[type="datetime-local"] {
                    cursor: pointer;
                }

                .deadline-hint {
                    margin-top: 7px;

                    color:
                        var(--app-secondary-text);

                    font-size: 11px;

                    line-height: 1.5;
                }


                /* =========================
                   TEXTAREA
                ========================= */

                .form-card textarea {

                    resize: vertical;

                    min-height: 100px;

                    line-height: 1.5;
                }


                /* =========================
                   SELECT
                ========================= */

                .form-card select {
                    cursor: pointer;
                }

                .form-card select option {
                    background:
                        var(--app-card);

                    color:
                        var(--app-text);
                }


                /* =========================
                   VISIBILITY
                ========================= */

                .visibility-section {
                    margin-bottom: 22px;
                }

                .radio-row {

                    display: flex;

                    align-items: center;

                    gap: 25px;

                    margin-top: 10px;
                }

                .radio-option {

                    display: flex;

                    align-items: center;

                    gap: 8px;

                    font-size: 14px;

                    color:
                        var(--app-secondary-text);

                    cursor: pointer;
                }

                .radio-option input {

                    width: 16px;
                    height: 16px;

                    accent-color:
                        #6d4bc3;

                    cursor: pointer;
                }

                .radio-option:hover {
                    color:
                        var(--app-text);
                }


                /* =========================
                   CHECKBOX
                ========================= */

                .checkbox-row {

                    display: flex;

                    align-items: center;

                    gap: 10px;

                    margin-bottom: 26px;

                    font-size: 14px;

                    color:
                        var(--app-secondary-text);

                    cursor: pointer;
                }

                .checkbox-row input {

                    width: 16px;
                    height: 16px;

                    accent-color:
                        #6d4bc3;

                    cursor: pointer;
                }


                /* =========================
                   OPTIONS SECTION
                ========================= */

                .section-heading {

                    font-size: 16px;

                    font-weight: 600;

                    color:
                        var(--app-text);

                    margin:
                        26px 0 12px;

                    padding-bottom: 10px;

                    border-bottom:
                        1px solid
                        var(--app-border);
                }


                .option-input {
                    margin-bottom: 10px;
                }

                .option-number {

                    display: block;

                    color:
                        var(--app-secondary-text);

                    font-size: 11px;

                    margin-bottom: 5px;
                }


                /* =========================
                   BUTTON ROW
                ========================= */

                .btn-row {

                    display: flex;

                    gap: 12px;

                    margin-top: 14px;
                }


                /* =========================
                   ADD OPTION
                ========================= */

                .btn-add {

                    background:
                        var(--app-card-2);

                    color:
                        #c4b5fd;

                    border:
                        1px solid
                        #493773;

                    padding:
                        10px 17px;

                    border-radius: 8px;

                    font-weight: 600;

                    font-size: 13px;

                    cursor: pointer;

                    transition:
                        0.2s ease;
                }

                .btn-add:hover {

                    background:
                        var(--app-card);

                    border-color:
                        #6548a0;
                }


                /* =========================
                   SUBMIT
                ========================= */

                .btn-submit {

                    width: 100%;

                    background:
                        #6d3dcc;

                    color: white;

                    border: none;

                    padding:
                        13px 18px;

                    border-radius: 9px;

                    font-weight: 600;

                    font-size: 14px;

                    cursor: pointer;

                    margin-top: 24px;

                    transition:
                        0.2s ease;
                }

                .btn-submit:hover {

                    background:
                        #7848d8;

                    box-shadow:
                        0 5px 15px
                        rgba(
                            109,
                            61,
                            204,
                            0.20
                        );
                }

                .btn-submit:disabled {

                    opacity: 0.6;

                    cursor:
                        not-allowed;
                }


                /* =========================
                   MESSAGE
                ========================= */

                .form-message {

                    margin-top: 16px;

                    padding:
                        11px 14px;

                    border-radius: 8px;

                    text-align: center;

                    font-weight: 500;

                    color:
                        #c4b5fd;

                    background:
                        var(--app-card-2);

                    border:
                        1px solid
                        #493773;

                    font-size: 13px;
                }


                /* =========================
                   SUCCESS MESSAGE
                ========================= */

                .form-message.success {

                    color:
                        #86efac;

                    background:
                        rgba(
                            16,
                            37,
                            29,
                            0.75
                        );

                    border-color:
                        #23734f;
                }


                /* =========================
                   RESPONSIVE
                ========================= */

                @media (max-width: 700px) {

                    .create-page {

                        padding:
                            5px 0 30px;
                    }

                    .form-card {

                        padding: 22px;

                        border-radius: 12px;
                    }

                    .radio-row {

                        gap: 18px;
                    }
                }


                @media (max-width: 450px) {

                    .form-card {

                        padding: 18px;
                    }

                    .radio-row {

                        flex-direction:
                            column;

                        align-items:
                            flex-start;

                        gap: 12px;
                    }
                }

            `}</style>


            <div className="create-page">

                <div className="form-card">

                    {/* =========================
                        FORM INTRO
                    ========================= */}

                    <div className="form-intro">

                        <h2>
                            Create a New Decision
                        </h2>

                        <p>
                            Add the details below and give people
                            clear options to vote on.
                        </p>

                    </div>


                    {/* =========================
                        TITLE
                    ========================= */}

                    <div className="field-group">

                        <span className="field-label">
                            Decision Title
                        </span>

                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. Which framework should we use?"
                            value={decision.title}
                            onChange={handleChange}
                        />

                    </div>


                    {/* =========================
                        COMMUNITY
                    ========================= */}

                    <div className="field-group">

                        <span className="field-label">
                            Community (optional)
                        </span>

                        <select
                            name="communityId"
                            value={
                                decision.communityId || ""
                            }
                            onChange={handleChange}
                        >

                            <option value="">
                                No community
                            </option>

                            {communities
                                .filter(c => c.joined)
                                .map(c => (

                                    <option
                                        key={c.id}
                                        value={c.id}
                                    >
                                        {c.communityName}
                                    </option>

                                ))}

                        </select>

                    </div>


                    {/* =========================
                        DESCRIPTION
                    ========================= */}

                    <div className="field-group">

                        <span className="field-label">
                            Description
                        </span>

                        <textarea
                            name="description"
                            placeholder="Add some context for people voting..."
                            value={decision.description}
                            onChange={handleChange}
                        />

                    </div>


                    {/* =========================
                        CATEGORY
                    ========================= */}

                    <div className="field-group">

                        <span className="field-label">
                            Category
                        </span>

                        <select
                            name="category"
                            value={decision.category}
                            onChange={handleChange}
                        >

                            <option value="">
                                Select Category
                            </option>

                            <option value="Career">
                                Career
                            </option>

                            <option value="Technology">
                                Technology
                            </option>

                            <option value="Education">
                                Education
                            </option>

                            <option value="Travel">
                                Travel
                            </option>

                            <option value="Finance">
                                Finance
                            </option>

                        </select>

                    </div>


                    {/* =========================
                        VISIBILITY
                    ========================= */}

                    <div className="visibility-section">

                        <span className="field-label">
                            Visibility
                        </span>

                        <div className="radio-row">

                            <label className="radio-option">

                                <input
                                    type="radio"
                                    name="visibility"
                                    value="PUBLIC"
                                    checked={
                                        decision.visibility ===
                                        "PUBLIC"
                                    }
                                    onChange={handleChange}
                                />

                                Public

                            </label>


                            <label className="radio-option">

                                <input
                                    type="radio"
                                    name="visibility"
                                    value="PRIVATE"
                                    checked={
                                        decision.visibility ===
                                        "PRIVATE"
                                    }
                                    onChange={handleChange}
                                />

                                Private

                            </label>

                        </div>

                    </div>


                    {/* =========================
                        DEADLINE
                    ========================= */}

                    <div className="field-group">

                        <span className="field-label">
                            Deadline
                        </span>

                        <input
                            type="datetime-local"
                            name="deadline"
                            value={decision.deadline}
                            onChange={handleChange}
                            min={minDateTime}
                        />

                        <div className="deadline-hint">
                            Select the exact date and time when
                            voting should end.
                        </div>

                    </div>


                    {/* =========================
                        ANONYMOUS VOTING
                    ========================= */}

                    <label className="checkbox-row">

                        <input
                            type="checkbox"
                            name="anonymous"
                            checked={
                                decision.anonymous
                            }
                            onChange={handleChange}
                        />

                        Allow Anonymous Voting

                    </label>


                    {/* =========================
                        OPTIONS
                    ========================= */}

                    <div className="section-heading">
                        Voting Options
                    </div>


                    {options.map(
                        (option, index) => (

                            <div
                                className="option-input"
                                key={index}
                            >

                                <span className="option-number">
                                    Option {index + 1}
                                </span>

                                <input
                                    type="text"
                                    placeholder={
                                        `Enter option ${index + 1}`
                                    }
                                    value={option}
                                    onChange={(e) =>
                                        handleOptionChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                />


                                {options.length > 2 && (

                                    <button
                                        type="button"
                                        className="btn-add"
                                        onClick={() =>
                                            removeOption(index)
                                        }
                                        style={{
                                            marginTop: "8px"
                                        }}
                                    >
                                        Remove
                                    </button>

                                )}

                            </div>

                        )
                    )}


                    {/* =========================
                        ADD OPTION
                    ========================= */}

                    <div className="btn-row">

                        <button
                            type="button"
                            className="btn-add"
                            onClick={addOption}
                        >
                            + Add Option
                        </button>

                    </div>


                    {/* =========================
                        SUBMIT
                    ========================= */}

                    <button
                        type="button"
                        className="btn-submit"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >

                        {
                            submitting
                                ? "Creating..."
                                : "Create Decision"
                        }

                    </button>


                    {/* =========================
                        MESSAGE
                    ========================= */}

                    {message && (

                        <div
                            className={
                                message.includes(
                                    "successfully"
                                )
                                    ? "form-message success"
                                    : "form-message"
                            }
                        >

                            {message}

                        </div>

                    )}

                </div>

            </div>

        </DashboardLayout>
    );
}

export default CreateDecision;