import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function CreateDecision() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("CAREER");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [options, setOptions] = useState([
    { optionTitle: "Option 1", description: "", pros: "", cons: "" },
    { optionTitle: "Option 2", description: "", pros: "", cons: "" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleOptionChange = (index, field, value) => {
    const updated = [...options];
    updated[index][field] = value;
    setOptions(updated);
  };

  const addOptionField = () => {
    setOptions([
      ...options,
      { optionTitle: `Option ${options.length + 1}`, description: "", pros: "", cons: "" },
    ]);
  };

  const removeOptionField = (index) => {
    if (options.length <= 2) {
      alert("A decision board requires at least 2 comparison options.");
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a title for your decision board.");
      return;
    }

    setSubmitting(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/decisions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          visibility,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create decision board. Please log in first.");
      }

      const data = await response.json();
      navigate(`/decisions/${data.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <main className="page-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Decision Board</h1>
          <p className="page-subtitle">Set up options, list pros and cons, and gather community votes.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="content-section">
        {error && <div style={{ color: "#ef4444", marginBottom: "16px", fontWeight: "600" }}>{error}</div>}

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "700" }}>Board Title *</label>
          <input
            type="text"
            placeholder="e.g. MBA vs Corporate Job OR iPhone 16 vs Galaxy S24"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-subtle)", color: "var(--text-main)" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "700" }}>Description / Context</label>
          <textarea
            placeholder="Provide background context to help voters make an informed choice..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-subtle)", color: "var(--text-main)" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "700" }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-subtle)", color: "var(--text-main)" }}
            >
              <option value="CAREER">Career</option>
              <option value="TECHNOLOGY">Technology</option>
              <option value="EDUCATION">Education</option>
              <option value="FINANCE">Finance</option>
              <option value="TRAVEL">Travel</option>
              <option value="LIFESTYLE">Lifestyle</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "700" }}>Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-subtle)", color: "var(--text-main)" }}
            >
              <option value="PUBLIC">Public (Community Polling)</option>
              <option value="PRIVATE">Private (Invite Only)</option>
            </select>
          </div>
        </div>

        <h3 className="section-title">Comparison Options</h3>

        {options.map((opt, idx) => (
          <div key={idx} className="option-card" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h4 style={{ margin: 0 }}>Option #{idx + 1}</h4>
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOptionField(idx)}
                  style={{ background: "#ef4444", color: "white", padding: "4px 10px", fontSize: "12px" }}
                >
                  Remove
                </button>
              )}
            </div>

            <div style={{ marginBottom: "12px" }}>
              <input
                type="text"
                placeholder={`Option Title (e.g. ${idx === 0 ? "MBA Degree" : "Tech Startup Job"})`}
                value={opt.optionTitle}
                onChange={(e) => handleOptionChange(idx, "optionTitle", e.target.value)}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)", color: "var(--text-main)" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Pros (Advantages)</label>
                <textarea
                  placeholder="e.g. Higher long-term leadership potential"
                  value={opt.pros}
                  onChange={(e) => handleOptionChange(idx, "pros", e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)", color: "var(--text-main)", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Cons (Risks/Costs)</label>
                <textarea
                  placeholder="e.g. High tuition fees and 2 years lost income"
                  value={opt.cons}
                  onChange={(e) => handleOptionChange(idx, "cons", e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)", color: "var(--text-main)", fontSize: "13px" }}
                />
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button type="button" onClick={addOptionField} className="secondary-btn">
            ➕ Add Another Option
          </button>
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Publishing Board..." : "Publish Decision Board"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default CreateDecision;
