import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function Register() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          fullName,
          email,
          password,
          role: "USER" // Default role
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
        throw new Error(data.message || "Registration failed. Check if username or email is already in use.");
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
        <p className="subtitle">
          Create your account and start making smarter decisions.
        </p>

        {error && <div style={{ color: "#ff4d4d", fontSize: "14px", margin: "10px 0", fontWeight: "bold" }}>{error}</div>}
        {success && <div style={{ color: "#2ecc71", fontSize: "14px", margin: "10px 0", fontWeight: "bold" }}>{success}</div>}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
              style={{ userSelect: "none" }}
            >
              👁️
            </span>
          </div>

          <div className="password-box">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ userSelect: "none" }}
            >
              👁️
            </span>
          </div>

          <div className="remember">
            <div className="remember-left">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the Terms & Conditions
              </label>
            </div>
          </div>

          <button type="submit" className="login-btn">
            Create Account
          </button>
        </form>

        <p className="register-link">
          Already have an account? <a href="/login">Sign In</a>
        </p>
      </div>
    </section>
  );
}

export default Register;
