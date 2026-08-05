import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const detail = Object.entries(data.errors)
            .map(([field, msg]) => msg)
            .join(" | ");
          throw new Error(detail);
        }
        throw new Error(data.message || "Invalid email or password");
      }

      // Store JWT token and details
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      setSuccess("Logged in successfully! Redirecting...");
      
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="login">
      <div className="login-box">
        <h1>DecisionHub</h1>
        <p className="subtitle">Welcome back! Sign in to continue.</p>

        {error && <div style={{ color: "#ff4d4d", fontSize: "14px", margin: "10px 0", fontWeight: "bold" }}>{error}</div>}
        {success && <div style={{ color: "#2ecc71", fontSize: "14px", margin: "10px 0", fontWeight: "bold" }}>{success}</div>}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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

          <div className="remember">
            <div className="remember-left">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember Me</label>
            </div>
            <a href="#" className="forgot-link">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

        <p className="register-link">
          Don't have an account? <a href="/register">Create Account</a>
        </p>
      </div>
    </section>
  );
}

export default Login;
