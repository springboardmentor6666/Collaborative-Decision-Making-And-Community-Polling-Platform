
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
    anonymous: false,
  });

  const [options, setOptions] = useState(["", ""]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  const [draftDeadline, setDraftDeadline] = useState("");

  /* =========================================================
     COMMUNITY FROM URL
  ========================================================= */

  useEffect(() => {
    const communityId =
      new URLSearchParams(location.search).get("communityId");

    if (communityId) {
      setDecision((current) => ({
        ...current,
        communityId,
      }));
    }
  }, [location.search]);

  /* =========================================================
     FETCH COMMUNITIES
  ========================================================= */

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) return;

    fetch("http://localhost:8080/api/communities", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
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

    const timer = setTimeout(() => {
      setMessage("");
    }, 3500);

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
      checked,
    } = e.target;

    setDecision({
      ...decision,
      [name]:
        type === "checkbox"
          ? checked
          : value,
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
      "",
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
     GET MIN DATE TIME
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
     DEADLINE PICKER
  ========================================================= */

  const openDeadlinePicker = () => {
    setDraftDeadline(
      decision.deadline ||
        `${new Date().toISOString().slice(0, 10)}T23:59`
    );
    setDeadlineOpen(true);
  };

  const closeDeadlinePicker = () => {
    setDeadlineOpen(false);
  };

  const applyDeadline = () => {
    if (!draftDeadline) {
      setIsError(true);
      setMessage("Please select a date and time.");
      return;
    }

    const selected = new Date(draftDeadline);

    if (isNaN(selected.getTime())) {
      setIsError(true);
      setMessage("Please select a valid deadline.");
      return;
    }

    if (selected <= new Date()) {
      setIsError(true);
      setMessage("Deadline must be in the future.");
      return;
    }

    setDecision((current) => ({
      ...current,
      deadline: draftDeadline,
    }));

    setDeadlineOpen(false);
    setIsError(false);
    setMessage("");
  };

  const setTodayDeadline = () => {
    const now = new Date();
    now.setHours(23, 59, 0, 0);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    setDraftDeadline(
      `${year}-${month}-${day}T${hours}:${minutes}`
    );
  };

  /* =========================================================
     HANDLE SUBMIT
  ========================================================= */

  const handleSubmit = async () => {
    const cleanOptions =
      options
        .map((option) => option.trim())
        .filter(Boolean);

    /* BASIC VALIDATION */

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

    /* DEADLINE VALIDATION */

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

    /* REQUEST DATA */

    const data = {
      ...decision,

      options: cleanOptions,

      communityId:
        decision.communityId
          ? Number(decision.communityId)
          : null,
    };

    try {
      const token =
        sessionStorage.getItem("token");

      if (!token) {
        setIsError(true);

        setMessage(
          "Please login first."
        );

        navigate("/login");

        return;
      }

      setSubmitting(true);

      const response = await fetch(
        "http://localhost:8080/api/decisions",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(data),
        }
      );

      const result =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        setIsError(true);

        setMessage(
          result.message ||
          "Unable to create decision."
        );

        return;
      }

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

  return (
    <DashboardLayout
      pageTitle="Create Decision"
      pageSubtitle="Build a decision board and let your community make the choice together."
    >

      <Toast
        message={message}
        isError={isError}
      />

      <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .create-page {
          width: 100%;
          min-width: 0;
          padding: 5px 0 35px;
          color: var(--app-text);
        }

        .create-wrapper {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* =====================================================
           FUTURISTIC HEADER
        ===================================================== */

        .create-hero {
          position: relative;
          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 22px;
          padding: 24px 26px;

          border:
            1px solid
            rgba(139,92,246,.24);

          border-radius: 20px;

          background:
            radial-gradient(
              circle at 90% 20%,
              rgba(139,92,246,.20),
              transparent 30%
            ),
            radial-gradient(
              circle at 5% 100%,
              rgba(168,85,247,.10),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              var(--app-card),
              var(--app-card-2)
            );

          box-shadow:
            0 18px 55px
            rgba(0,0,0,.06);
        }

        .create-hero::after {
          content: "";

          position: absolute;

          left: 0;
          right: 42%;

          bottom: 0;

          height: 2px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #8b5cf6,
              #c084fc,
              transparent
            );

          box-shadow:
            0 0 15px
            rgba(139,92,246,.65);
        }

        .create-hero-content {
          position: relative;
          z-index: 2;

          min-width: 0;
        }

        .create-eyebrow {
          display: flex;
          align-items: center;

          gap: 8px;

          margin-bottom: 8px;

          color: #a78bfa;

          font-size: 9px;
          font-weight: 850;

          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .create-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #8b5cf6;

          box-shadow:
            0 0 8px
            rgba(139,92,246,.9);
        }

        .create-hero-title {
          margin: 0;

          color: var(--app-text);

          font-size:
            clamp(22px, 4vw, 30px);

          line-height: 1.15;

          font-weight: 850;

          letter-spacing: -.035em;
        }

        .create-hero-description {
          max-width: 650px;

          margin: 8px 0 0;

          color:
            var(--app-secondary-text);

          font-size: 12px;

          line-height: 1.6;
        }

        .create-hero-icon {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;

          width: 68px;
          height: 68px;

          flex-shrink: 0;

          border:
            1px solid
            rgba(139,92,246,.28);

          border-radius: 18px;

          background:
            rgba(139,92,246,.08);

          color: #c4b5fd;

          font-size: 28px;

          box-shadow:
            0 0 30px
            rgba(139,92,246,.10);
        }

        /* =====================================================
           MAIN GRID
        ===================================================== */

        .create-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1.6fr)
            minmax(280px, .75fr);

          gap: 18px;

          align-items: start;
        }

        /* =====================================================
           FORM CARD
        ===================================================== */

        .form-card {
          width: 100%;
          min-width: 0;

          padding: 25px;

          border:
            1px solid
            var(--app-border);

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              var(--app-card),
              var(--app-card-2)
            );

          box-shadow:
            0 12px 38px
            rgba(0,0,0,.055);
        }

        .form-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          margin-bottom: 24px;

          padding-bottom: 17px;

          border-bottom:
            1px solid
            var(--app-border);
        }

        .form-card-title {
          margin: 0;

          color: var(--app-text);

          font-size: 17px;
          font-weight: 800;
        }

        .form-card-subtitle {
          margin: 4px 0 0;

          color:
            var(--app-secondary-text);

          font-size: 10px;
          line-height: 1.5;
        }

        .step-badge {
          flex-shrink: 0;

          padding: 6px 9px;

          border:
            1px solid
            rgba(139,92,246,.20);

          border-radius: 999px;

          background:
            rgba(139,92,246,.06);

          color: #a78bfa;

          font-size: 8px;
          font-weight: 850;

          letter-spacing: .1em;
        }

        /* =====================================================
           FORM FIELD
        ===================================================== */

        .field-group {
          margin-bottom: 18px;
        }

        .field-label {
          display: flex;
          align-items: center;

          gap: 6px;

          margin-bottom: 7px;

          color: var(--app-text);

          font-size: 11px;
          font-weight: 750;
        }

        .required {
          color: #a78bfa;
        }

        .field-hint {
          margin-top: 6px;

          color:
            var(--app-secondary-text);

          font-size: 9px;

          line-height: 1.5;
        }

        /* =====================================================
           INPUTS
        ===================================================== */

        .form-input,
        .form-textarea,
        .form-select {

          width: 100%;
          min-width: 0;

          box-sizing: border-box;

          padding:
            11px 13px;

          border:
            1px solid
            var(--app-border);

          border-radius: 10px;

          outline: none;

          color:
            var(--app-text);

          background:
            var(--app-card-2);

          font-family: inherit;

          font-size: 12px;

          transition:
            border-color .2s ease,
            box-shadow .2s ease,
            background .2s ease;
        }

        .form-input {
          height: 43px;
        }

        .form-textarea {
          min-height: 105px;

          resize: vertical;

          line-height: 1.6;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color:
            var(--app-secondary-text);

          opacity: .75;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {

          border-color:
            rgba(139,92,246,.65);

          background:
            var(--app-card-2);

          box-shadow:
            0 0 0 3px
            rgba(139,92,246,.09),
            0 0 20px
            rgba(139,92,246,.05);
        }

        .form-select {
          height: 43px;

          cursor: pointer;
        }

        .form-select option {
          background:
            var(--app-card);

          color:
            var(--app-text);
        }

        /* =====================================================
           TWO COLUMN FIELDS
        ===================================================== */

        .form-two-column {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0,1fr));

          gap: 14px;
        }

        /* =====================================================
           VISIBILITY
        ===================================================== */

        .visibility-box {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0,1fr));

          gap: 10px;

          margin-top: 7px;
        }

        .visibility-option {
          position: relative;

          display: flex;
          align-items: center;

          gap: 10px;

          min-width: 0;

          padding: 12px;

          border:
            1px solid
            var(--app-border);

          border-radius: 11px;

          background:
            var(--app-card-2);

          cursor: pointer;

          transition:
            border-color .2s ease,
            background .2s ease,
            transform .2s ease;
        }

        .visibility-option:hover {
          transform: translateY(-1px);

          border-color:
            rgba(139,92,246,.30);
        }

        .visibility-option.selected {
          border-color:
            rgba(139,92,246,.55);

          background:
            rgba(139,92,246,.08);

          box-shadow:
            inset 0 0 20px
            rgba(139,92,246,.035);
        }

        .visibility-option input {
          width: 15px;
          height: 15px;

          flex-shrink: 0;

          accent-color:
            #8b5cf6;

          cursor: pointer;
        }

        .visibility-content {
          min-width: 0;
        }

        .visibility-title {
          color: var(--app-text);

          font-size: 11px;
          font-weight: 750;
        }

        .visibility-description {
          margin-top: 2px;

          color:
            var(--app-secondary-text);

          font-size: 8px;

          line-height: 1.4;
        }

        /* =====================================================
           CHECKBOX
        ===================================================== */


        .deadline-control {
          position: relative;
          width: 100%;
        }

        .deadline-trigger {
          width: 100%;
          min-height: 43px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-sizing: border-box;
          padding: 7px 11px;
          border: 1px solid var(--app-border);
          border-radius: 10px;
          background: var(--app-card-2);
          color: var(--app-text);
          cursor: pointer;
          text-align: left;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
        }

        .deadline-trigger:hover,
        .deadline-trigger:focus {
          border-color: rgba(139,92,246,.60);
          box-shadow: 0 0 0 3px rgba(139,92,246,.08);
        }

        .deadline-trigger-left {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .deadline-calendar-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 29px;
          height: 29px;
          flex-shrink: 0;
          border: 1px solid rgba(139,92,246,.20);
          border-radius: 8px;
          background: rgba(139,92,246,.08);
          color: #ffffff;
          font-size: 14px;
          filter: grayscale(1) brightness(3);
        }

        .deadline-value {
          min-width: 0;
          color: var(--app-text);
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .deadline-placeholder {
          color: var(--app-secondary-text);
        }

        .deadline-arrow {
          flex-shrink: 0;
          color: #9e91b9;
          font-size: 14px;
        }

        .deadline-popover {
          position: absolute;
          z-index: 50;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          padding: 14px;
          border: 1px solid rgba(139,92,246,.22);
          border-radius: 14px;
          background: #171326;
          box-shadow: 0 20px 45px rgba(0,0,0,.30);
          animation: deadlineReveal .16s ease-out;
        }

        @keyframes deadlineReveal {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .deadline-popover-title {
          margin-bottom: 11px;
          color: var(--app-text);
          font-size: 11px;
          font-weight: 500;
        }

        .deadline-fields {
          display: grid;
          grid-template-columns: 1.15fr .85fr;
          gap: 9px;
        }

        .deadline-field span {
          display: block;
          margin-bottom: 5px;
          color: var(--app-secondary-text);
          font-size: 9px;
        }

        .deadline-picker-input {
          width: 100%;
          min-height: 39px;
          box-sizing: border-box;
          padding: 8px 9px;
          border: 1px solid rgba(139,92,246,.16);
          border-radius: 9px;
          background: #211a31;
          color: #ffffff;
          font-size: 11px;
          color-scheme: dark;
          outline: none;
        }

        .deadline-picker-input:focus {
          border-color: rgba(139,92,246,.60);
          box-shadow: 0 0 0 3px rgba(139,92,246,.08);
        }

        .deadline-picker-input::-webkit-calendar-picker-indicator {
          opacity: 1;
          filter: invert(1) brightness(2);
          cursor: pointer;
        }

        .deadline-popover-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
          margin-top: 13px;
          padding-top: 11px;
          border-top: 1px solid rgba(255,255,255,.06);
        }

        .deadline-today,
        .deadline-cancel,
        .deadline-done {
          min-height: 34px;
          padding: 7px 11px;
          border-radius: 9px;
          font-family: inherit;
          font-size: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all .18s ease;
        }

        .deadline-today {
          margin-right: auto;
          border: 0;
          background: transparent;
          color: #a78bfa;
        }

        .deadline-today:hover {
          background: rgba(139,92,246,.08);
        }

        .deadline-cancel {
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.025);
          color: #a9a2b3;
        }

        .deadline-cancel:hover {
          background: rgba(255,255,255,.05);
          color: #e6e0ed;
        }

        .deadline-done {
          border: 1px solid rgba(139,92,246,.25);
          background: linear-gradient(135deg, #6d3dcc, #8b5cf6);
          color: #ffffff;
          box-shadow: 0 6px 16px rgba(124,58,237,.18);
        }

        .deadline-done:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }

        .anonymous-box {
          display: flex;
          align-items: center;

          gap: 11px;

          margin-top: 4px;
          padding: 13px;

          border:
            1px solid
            var(--app-border);

          border-radius: 11px;

          background:
            rgba(139,92,246,.025);

          cursor: pointer;
        }

        .anonymous-box input {
          width: 16px;
          height: 16px;

          flex-shrink: 0;

          accent-color:
            #8b5cf6;

          cursor: pointer;
        }

        .anonymous-content {
          min-width: 0;
        }

        .anonymous-title {
          color: var(--app-text);

          font-size: 11px;
          font-weight: 700;
        }

        .anonymous-description {
          margin-top: 2px;

          color:
            var(--app-secondary-text);

          font-size: 8px;
        }

        /* =====================================================
           OPTIONS
        ===================================================== */

        .options-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;

          margin-top: 24px;
          margin-bottom: 11px;

          padding-bottom: 10px;

          border-bottom:
            1px solid
            var(--app-border);
        }

        .options-title {
          margin: 0;

          color: var(--app-text);

          font-size: 13px;
          font-weight: 800;
        }

        .options-count {
          color: #a78bfa;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .option-item {
          display: grid;

          grid-template-columns:
            30px minmax(0,1fr) auto;

          align-items: center;

          gap: 9px;

          margin-bottom: 9px;

          padding: 9px;

          border:
            1px solid
            var(--app-border);

          border-radius: 11px;

          background:
            var(--app-card-2);

          transition:
            border-color .2s ease,
            box-shadow .2s ease;
        }

        .option-item:focus-within {
          border-color:
            rgba(139,92,246,.40);

          box-shadow:
            0 0 18px
            rgba(139,92,246,.05);
        }

        .option-number {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 30px;
          height: 30px;

          border:
            1px solid
            rgba(139,92,246,.18);

          border-radius: 8px;

          background:
            rgba(139,92,246,.07);

          color: #a78bfa;

          font-size: 9px;
          font-weight: 850;
        }

        .option-input {
          width: 100%;
          min-width: 0;

          height: 38px;

          padding:
            0 10px;

          border:
            1px solid
            var(--app-border);

          border-radius: 8px;

          outline: none;

          color:
            var(--app-text);

          background:
            var(--app-card);

          font-family: inherit;

          font-size: 11px;
        }

        .option-input:focus {
          border-color:
            rgba(139,92,246,.55);

          box-shadow:
            0 0 0 2px
            rgba(139,92,246,.07);
        }

        .remove-option {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 31px;
          height: 31px;

          border:
            1px solid
            rgba(239,68,68,.20);

          border-radius: 8px;

          background:
            rgba(239,68,68,.06);

          color: #f87171;

          font-size: 15px;

          cursor: pointer;

          transition:
            background .2s ease,
            transform .2s ease;
        }

        .remove-option:hover {
          transform: scale(1.04);

          background:
            rgba(239,68,68,.12);
        }

        .add-option {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 100%;

          margin-top: 5px;

          padding: 10px;

          border:
            1px dashed
            rgba(139,92,246,.35);

          border-radius: 9px;

          background:
            rgba(139,92,246,.035);

          color: #a78bfa;

          font-size: 10px;
          font-weight: 750;

          cursor: pointer;

          transition:
            background .2s ease,
            border-color .2s ease;
        }

        .add-option:hover {
          background:
            rgba(139,92,246,.08);

          border-color:
            rgba(139,92,246,.60);
        }

        /* =====================================================
           SUBMIT
        ===================================================== */

        .submit-button {
          position: relative;
          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          width: 100%;

          min-height: 46px;

          margin-top: 22px;

          border: none;

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #7c3aed,
              #8b5cf6,
              #a855f7
            );

          color: white;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: .01em;

          cursor: pointer;

          box-shadow:
            0 10px 25px
            rgba(124,58,237,.20);

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            filter .2s ease;
        }

        .submit-button::before {
          content: "";

          position: absolute;

          top: 0;
          left: -100%;

          width: 70%;
          height: 100%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.18),
              transparent
            );

          transform: skewX(-20deg);

          transition:
            left .55s ease;
        }

        .submit-button:hover::before {
          left: 140%;
        }

        .submit-button:hover {
          transform:
            translateY(-2px);

          filter:
            brightness(1.05);

          box-shadow:
            0 15px 35px
            rgba(124,58,237,.28);
        }

        .submit-button:disabled {
          opacity: .55;

          cursor:
            not-allowed;

          transform: none;

          box-shadow: none;
        }

        /* =====================================================
           SIDE PANEL
        ===================================================== */

        .info-panel {
          position: sticky;
          top: 20px;

          overflow: hidden;

          padding: 20px;

          border:
            1px solid
            var(--app-border);

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              var(--app-card),
              var(--app-card-2)
            );

          box-shadow:
            0 12px 35px
            rgba(0,0,0,.045);
        }

        .info-panel::before {
          content: "";

          position: absolute;

          width: 150px;
          height: 150px;

          right: -80px;
          top: -80px;

          border-radius: 50%;

          background:
            rgba(139,92,246,.09);

          filter: blur(15px);

          pointer-events: none;
        }

        .info-title {
          position: relative;
          z-index: 2;

          margin: 0 0 4px;

          color: var(--app-text);

          font-size: 14px;
          font-weight: 800;
        }

        .info-subtitle {
          position: relative;
          z-index: 2;

          margin: 0 0 18px;

          color:
            var(--app-secondary-text);

          font-size: 9px;

          line-height: 1.55;
        }

        .info-step {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: flex-start;

          gap: 11px;

          margin-bottom: 15px;
        }

        .info-step-number {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 27px;
          height: 27px;

          flex-shrink: 0;

          border:
            1px solid
            rgba(139,92,246,.20);

          border-radius: 8px;

          background:
            rgba(139,92,246,.07);

          color: #a78bfa;

          font-size: 9px;
          font-weight: 850;
        }

        .info-step-content {
          min-width: 0;
        }

        .info-step-title {
          color: var(--app-text);

          font-size: 10px;
          font-weight: 750;
        }

        .info-step-text {
          margin-top: 3px;

          color:
            var(--app-secondary-text);

          font-size: 8px;

          line-height: 1.5;
        }

        .info-tip {
          position: relative;
          z-index: 2;

          margin-top: 18px;
          padding: 12px;

          border:
            1px solid
            rgba(139,92,246,.17);

          border-radius: 10px;

          background:
            rgba(139,92,246,.05);

          color:
            var(--app-secondary-text);

          font-size: 8px;

          line-height: 1.55;
        }

        .info-tip strong {
          color: #a78bfa;
        }

        /* =====================================================
           COPYRIGHT
        ===================================================== */

        .create-footer {
          display: flex;
          align-items: center;
          justify-content: center;

          flex-wrap: wrap;

          gap: 7px;

          margin-top: 35px;
          padding-top: 18px;

          border-top:
            1px solid
            var(--app-border);

          color:
            var(--app-secondary-text);

          font-size: 8px;

          text-align: center;
        }

        .footer-brand {
          color: #a78bfa;
          font-weight: 750;
        }

        .footer-dot {
          width: 4px;
          height: 4px;

          border-radius: 50%;

          background: #8b5cf6;

          box-shadow:
            0 0 7px
            rgba(139,92,246,.7);
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 900px) {

          .create-grid {
            grid-template-columns: 1fr;
          }

          .info-panel {
            position: relative;
            top: auto;
          }
        }

        @media (max-width: 650px) {

          .create-page {
            padding-bottom: 25px;
          }

          .create-hero {
            padding: 19px;
            border-radius: 17px;
          }

          .create-hero-icon {
            width: 52px;
            height: 52px;

            border-radius: 14px;

            font-size: 22px;
          }

          .create-hero-title {
            font-size: 23px;
          }

          .create-hero-description {
            font-size: 10px;
          }

          .form-card {
            padding: 19px;
            border-radius: 16px;
          }

          .form-two-column {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .visibility-box {
            grid-template-columns: 1fr;
          }

          .option-item {
            grid-template-columns:
              30px minmax(0,1fr) 31px;
          }

          .deadline-popover {
            padding: 12px;
          }

          .deadline-fields {
            grid-template-columns: 1fr;
          }

          .deadline-popover-footer {
            flex-wrap: wrap;
          }


          .info-panel {
            padding: 18px;
          }
        }

        @media (max-width: 450px) {

          .create-hero {
            padding: 16px;
          }

          .create-hero-icon {
            display: none;
          }

          .form-card {
            padding: 16px;
          }

          .form-card-header {
            align-items: flex-start;
          }

          .step-badge {
            display: none;
          }

          .form-input,
          .form-select {
            height: 42px;
          }

          .option-item {
            gap: 7px;
            padding: 7px;
          }

          .option-number {
            width: 28px;
            height: 28px;
          }

          .remove-option {
            width: 29px;
            height: 29px;
          }

          .create-footer {
            padding-left: 8px;
            padding-right: 8px;
          }
        }

      `}</style>

      <div className="create-page">

        <div className="create-wrapper">

          {/* =================================================
              HERO
          ================================================= */}

          <section className="create-hero">

            <div className="create-hero-content">

              <div className="create-eyebrow">
                <span className="create-dot" />
                Decision Builder
              </div>

              <h1 className="create-hero-title">
                Create a New Decision
              </h1>

              <p className="create-hero-description">
                Set up your question, provide clear options,
                and let your community make the decision
                together.
              </p>

            </div>

            <div className="create-hero-icon">
              ✦
            </div>

          </section>

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="create-grid">

            {/* =================================================
                FORM
            ================================================= */}

            <div className="form-card">

              <div className="form-card-header">

                <div>
                  <h2 className="form-card-title">
                    Decision Details
                  </h2>

                  <p className="form-card-subtitle">
                    Give voters everything they need to
                    understand your decision.
                  </p>
                </div>

                <span className="step-badge">
                  STEP 01
                </span>

              </div>

              {/* TITLE */}

              <div className="field-group">

                <label className="field-label">
                  Decision Title
                  <span className="required">*</span>
                </label>

                <input
                  className="form-input"
                  type="text"
                  name="title"
                  placeholder="e.g. Which framework should we use?"
                  value={decision.title}
                  onChange={handleChange}
                />

              </div>

              {/* COMMUNITY + CATEGORY */}

              <div className="form-two-column">

                <div className="field-group">

                  <label className="field-label">
                    Community
                  </label>

                  <select
                    className="form-select"
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
                      .filter(
                        (c) => c.joined
                      )
                      .map((c) => (

                        <option
                          key={c.id}
                          value={c.id}
                        >
                          {c.communityName}
                        </option>

                      ))}

                  </select>

                  <div className="field-hint">
                    Optional — connect this decision
                    to one of your communities.
                  </div>

                </div>

                <div className="field-group">

                  <label className="field-label">
                    Category
                  </label>

                  <select
                    className="form-select"
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

              </div>

              {/* DESCRIPTION */}

              <div className="field-group">

                <label className="field-label">
                  Description
                  <span className="required">*</span>
                </label>

                <textarea
                  className="form-textarea"
                  name="description"
                  placeholder="Add some context so people can make an informed decision..."
                  value={decision.description}
                  onChange={handleChange}
                />

              </div>

              {/* VISIBILITY */}

              <div className="field-group">

                <label className="field-label">
                  Visibility
                </label>

                <div className="visibility-box">

                  <label
                    className={`
                      visibility-option
                      ${
                        decision.visibility ===
                        "PUBLIC"
                          ? "selected"
                          : ""
                      }
                    `}
                  >

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

                    <div className="visibility-content">

                      <div className="visibility-title">
                        🌐 Public
                      </div>

                      <div className="visibility-description">
                        Anyone can discover and vote.
                      </div>

                    </div>

                  </label>

                  <label
                    className={`
                      visibility-option
                      ${
                        decision.visibility ===
                        "PRIVATE"
                          ? "selected"
                          : ""
                      }
                    `}
                  >

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

                    <div className="visibility-content">

                      <div className="visibility-title">
                        🔒 Private
                      </div>

                      <div className="visibility-description">
                        Keep the decision restricted.
                      </div>

                    </div>

                  </label>

                </div>

              </div>

              {/* DEADLINE */}

              <div className="field-group">
                <label className="field-label">
                  Voting Deadline
                </label>

                <div className="deadline-control">
                  <button
                    type="button"
                    className="deadline-trigger"
                    onClick={openDeadlinePicker}
                    aria-haspopup="dialog"
                    aria-expanded={deadlineOpen}
                  >
                    <span className="deadline-trigger-left">
                      <span
                        className="deadline-calendar-icon"
                        aria-hidden="true"
                      >
                        📅
                      </span>

                      <span
                        className={`deadline-value ${
                          decision.deadline
                            ? ""
                            : "deadline-placeholder"
                        }`}
                      >
                        {decision.deadline
                          ? new Date(
                              decision.deadline
                            ).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "dd-mm-yyyy --:--"}
                      </span>
                    </span>

                    <span className="deadline-arrow">
                      {deadlineOpen ? "⌃" : "⌄"}
                    </span>
                  </button>

                  {deadlineOpen && (
                    <div className="deadline-popover">
                      <div className="deadline-popover-title">
                        Select voting deadline
                      </div>

                      <div className="deadline-fields">
                        <div className="deadline-field">
                          <span>Date</span>
                          <input
                            className="deadline-picker-input"
                            type="date"
                            value={
                              draftDeadline
                                ? draftDeadline.slice(0, 10)
                                : ""
                            }
                            min={new Date()
                              .toISOString()
                              .slice(0, 10)}
                            onChange={(event) => {
                              const date =
                                event.target.value;

                              setDraftDeadline(
                                `${date}T${
                                  draftDeadline
                                    ? draftDeadline.slice(
                                        11,
                                        16
                                      )
                                    : "23:59"
                                }`
                              );
                            }}
                          />
                        </div>

                        <div className="deadline-field">
                          <span>Time</span>
                          <input
                            className="deadline-picker-input"
                            type="time"
                            value={
                              draftDeadline
                                ? draftDeadline.slice(11, 16)
                                : ""
                            }
                            onChange={(event) => {
                              const time =
                                event.target.value;

                              setDraftDeadline(
                                `${
                                  draftDeadline
                                    ? draftDeadline.slice(
                                        0,
                                        10
                                      )
                                    : new Date()
                                        .toISOString()
                                        .slice(0, 10)
                                }T${time}`
                              );
                            }}
                          />
                        </div>
                      </div>

                      <div className="deadline-popover-footer">
                        <button
                          type="button"
                          className="deadline-today"
                          onClick={setTodayDeadline}
                        >
                          Today
                        </button>

                        <button
                          type="button"
                          className="deadline-cancel"
                          onClick={closeDeadlinePicker}
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          className="deadline-done"
                          onClick={applyDeadline}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="field-hint">
                  Select when voting should close.
                  The deadline must be in the future.
                </div>
              </div>

              {/* ANONYMOUS */}

              <label className="anonymous-box">

                <input
                  type="checkbox"
                  name="anonymous"
                  checked={
                    decision.anonymous
                  }
                  onChange={handleChange}
                />

                <div className="anonymous-content">

                  <div className="anonymous-title">
                    Allow Anonymous Voting
                  </div>

                  <div className="anonymous-description">
                    Voters can participate without
                    displaying their identity.
                  </div>

                </div>

              </label>

              {/* OPTIONS */}

              <div className="options-header">

                <h3 className="options-title">
                  Voting Options
                </h3>

                <span className="options-count">
                  {options.length} OPTIONS
                </span>

              </div>

              {options.map(
                (option, index) => (

                  <div
                    className="option-item"
                    key={index}
                  >

                    <div className="option-number">
                      {index + 1}
                    </div>

                    <input
                      className="option-input"
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

                    {options.length > 2 ? (

                      <button
                        type="button"
                        className="remove-option"
                        onClick={() =>
                          removeOption(index)
                        }
                        title="Remove option"
                      >
                        ×
                      </button>

                    ) : (

                      <div
                        style={{
                          width: "31px",
                        }}
                      />

                    )}

                  </div>

                )
              )}

              {/* ADD OPTION */}

              <button
                type="button"
                className="add-option"
                onClick={addOption}
              >
                ＋ Add Another Option
              </button>

              {/* SUBMIT */}

              <button
                type="button"
                className="submit-button"
                onClick={handleSubmit}
                disabled={submitting}
              >

                {submitting ? (
                  <>
                    <span>◌</span>
                    Creating Decision...
                  </>
                ) : (
                  <>
                    <span>✦</span>
                    Create Decision
                  </>
                )}

              </button>

            </div>

            {/* =================================================
                INFORMATION PANEL
            ================================================= */}

            <aside className="info-panel">

              <h3 className="info-title">
                How it works
              </h3>

              <p className="info-subtitle">
                Create a clear decision and let people
                contribute their opinions.
              </p>

              <div className="info-step">

                <div className="info-step-number">
                  01
                </div>

                <div className="info-step-content">

                  <div className="info-step-title">
                    Ask a clear question
                  </div>

                  <div className="info-step-text">
                    Write a simple title and provide
                    enough context.
                  </div>

                </div>

              </div>

              <div className="info-step">

                <div className="info-step-number">
                  02
                </div>

                <div className="info-step-content">

                  <div className="info-step-title">
                    Add your options
                  </div>

                  <div className="info-step-text">
                    Give voters at least two meaningful
                    choices.
                  </div>

                </div>

              </div>

              <div className="info-step">

                <div className="info-step-number">
                  03
                </div>

                <div className="info-step-content">

                  <div className="info-step-title">
                    Set voting rules
                  </div>

                  <div className="info-step-text">
                    Choose visibility, deadline and
                    anonymous voting.
                  </div>

                </div>

              </div>

              <div className="info-step">

                <div className="info-step-number">
                  04
                </div>

                <div className="info-step-content">

                  <div className="info-step-title">
                    Publish & collaborate
                  </div>

                  <div className="info-step-text">
                    Share the decision and collect
                    community opinions.
                  </div>

                </div>

              </div>

              <div className="info-tip">
                <strong>Tip:</strong>{" "}
                Keep options short and distinct.
                Clear options make voting easier
                and produce better results.
              </div>

            </aside>

          </div>

          {/* =================================================
              COPYRIGHT
          ================================================= */}

          <footer className="create-footer">

            <span>
              © 2026
            </span>

            <span className="footer-brand">
              Collaborative Decision Making
            </span>

            <span className="footer-dot" />

            <span>
              Community Polling Platform
            </span>

            <span>
              • All Rights Reserved
            </span>

          </footer>

        </div>

      </div>

    </DashboardLayout>
  );
}

export default CreateDecision;

