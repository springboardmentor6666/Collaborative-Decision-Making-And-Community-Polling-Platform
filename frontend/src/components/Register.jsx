import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("USER");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim() || email.split("@")[0],
          fullName: fullName.trim() || username.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    const mockEmail = email.trim() ? email : "google_user@decisionhub.com";
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mockEmail, name: fullName.trim() || "Google Verified User" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google authentication failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      setSuccess("Signed up with Google successfully! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Logo */}
        <h1 className="register-logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          Decision<span>Hub</span>
        </h1>

        {/* Heading */}
        <h2>Create Account</h2>
        <p className="register-subtitle">Join DecisionHub and start creating polls.</p>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#f87171", padding: "10px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "12px" }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e", color: "#4ade80", padding: "10px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "12px" }}>
            {success}
          </div>
        )}

        {/* Google Button */}
        <button type="button" className="google-btn" onClick={handleGoogleLogin}>
          <span className="google-icon">G</span>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="divider">
          <span></span>
          <p>OR</p>
          <span></span>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister}>
          {/* Full Name */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Username */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email"
              className="email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Role Selection */}
          <div className="input-group" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <label style={{ fontSize: "0.85rem", color: "#94a3b8", whiteSpace: "nowrap" }}>Account Role:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                background: "#0f172a",
                border: "1px solid #334155",
                color: "#fff",
                fontSize: "0.85rem"
              }}
            >
              <option value="USER">User (Standard)</option>
              <option value="MODERATOR">Community Moderator</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          {/* Password */}
          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁
            </button>
          </div>

          <p className="password-hint">Use at least 6 characters</p>

          {/* Confirm Password */}
          <div className="input-group password-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              👁
            </button>
          </div>

          {/* Terms */}
          <p className="terms-text">
            By creating an account, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>

          {/* Register */}
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login */}
        <p className="login-text">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/login")}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
