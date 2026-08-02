import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          roles: ["user"] // Default role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const detail = Object.entries(data.errors)
            .map(([field, msg]) => msg)
            .join(" | ");
          throw new Error(detail);
        }
        throw new Error(data.message || "Registration failed. Check if email is already in use.");
      }

      setSuccess("Account created successfully! Redirecting to sign in...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="login">
      <div className="login-box">
        <h1>DecisionHub</h1>
        <h2>Create Account</h2>

        {error && <div style={{ color: "#ff4d4d", fontSize: "14px", margin: "10px 0", fontWeight: "bold" }}>{error}</div>}
        {success && <div style={{ color: "#2ecc71", fontSize: "14px", margin: "10px 0", fontWeight: "bold" }}>{success}</div>}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />

          <button type="submit" style={{ width: "100%", padding: "10px", borderRadius: "5px", backgroundColor: "#3498db", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" }}>
            Create Account
          </button>
        </form>

        <p>Already have an account? <a href="/login">Sign In</a></p>
      </div>
    </section>
  );
}

export default Register;