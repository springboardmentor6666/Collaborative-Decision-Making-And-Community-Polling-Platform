import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* Logo */}
        <h1 className="login-logo">
          Decision<span>Hub</span>
        </h1>

        {/* Heading */}
        <h2>Welcome Back</h2>

        <p className="login-subtitle">
          Sign in to continue to DecisionHub.
        </p>

        {/* Google Login */}
        <button type="button" className="google-login-btn">
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
              required
            />
          </div>

          {/* Password */}
          <div className="login-input-group password-input">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
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
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password"
            >
              Forgot Password?
            </button>

          </div>

          {/* Login Button */}
          <button type="submit" className="login-submit">
            Login
          </button>

        </form>

        {/* Register */}
        <p className="register-text">
          Don't have an account?
          <button
            type="button"
            className="register-link"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>

      </div>

    </div>
  );
}

export default Login;