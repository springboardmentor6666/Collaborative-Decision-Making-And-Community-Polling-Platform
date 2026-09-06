import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetErr, setResetErr] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      setSuccess("Logged in successfully! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1000);
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
        body: JSON.stringify({ email: mockEmail, name: "Google Verified User" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google authentication failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      setSuccess("Google Sign-In successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMsg("");
    setResetErr("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password reset failed");
      setResetMsg("Password reset successful! You can now log in.");
      setTimeout(() => setShowForgotModal(false), 2000);
    } catch (err) {
      setResetErr(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <h1 className="login-logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          Decision<span>Hub</span>
        </h1>

        {/* Heading */}
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Sign in to continue to DecisionHub.</p>

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

        {/* Quick Demo Credentials */}
        <div style={{ background: "rgba(56,189,248,0.08)", border: "1px dashed #38bdf8", borderRadius: "8px", padding: "8px 12px", marginBottom: "16px", fontSize: "0.78rem", color: "#94a3b8" }}>
          <strong style={{ color: "#38bdf8" }}>Demo Accounts:</strong><br />
          Admin: <code>admin@decisionhub.com</code> / <code>admin123</code><br />
          User: <code>user@decisionhub.com</code> / <code>user123</code>
        </div>

        {/* Google Login */}
        <button type="button" className="google-login-btn" onClick={handleGoogleLogin}>
          <span className="google-g">G</span>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="login-divider">
          <span></span>
          <p>OR</p>
          <span></span>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="login-input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="login-input-group password-input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁
            </button>
          </div>

          {/* Options */}
          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password"
              onClick={() => {
                setResetEmail(email);
                setShowForgotModal(true);
              }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Register */}
        <p className="register-text">
          Don't have an account?{" "}
          <button
            type="button"
            className="register-link"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
              color: "#f8fafc"
            }}
          >
            <h3 style={{ marginTop: 0, color: "#38bdf8" }}>Reset Password</h3>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Enter your registered email and choose a new password.
            </p>

            {resetErr && (
              <div style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: "10px" }}>{resetErr}</div>
            )}
            {resetMsg && (
              <div style={{ color: "#4ade80", fontSize: "0.8rem", marginBottom: "10px" }}>{resetMsg}</div>
            )}

            <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="email"
                placeholder="Your email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  color: "#fff"
                }}
              />
              <input
                type="password"
                placeholder="Enter new password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  color: "#fff"
                }}
              />
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#334155",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#0ea5e9",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
