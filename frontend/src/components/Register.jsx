import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();

    // Add your registration logic here
    console.log("Account created");
  };

  const handleGoogleLogin = () => {
    // Google authentication can be added later
    console.log("Continue with Google");
  };

  return (
    <div className="register-page">

      <div className="register-card">

        {/* Logo */}
        <h1 className="register-logo">
          Decision<span>Hub</span>
        </h1>

        {/* Heading */}
        <h2>Create Account</h2>

        <p className="register-subtitle">
          Join DecisionHub and start creating polls.
        </p>

        {/* Google Button */}
        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleLogin}
        >
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

          {/* Email */}
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email"
              className="email-input"
              required
            />
          </div>

          {/* Password */}
          <div className="input-group password-group">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              required
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁
            </button>

          </div>

          <p className="password-hint">
            Use at least 8 characters
          </p>

          {/* Confirm Password */}
          <div className="input-group password-group">

            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              required
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
             👁
            </button>

          </div>

          {/* Terms */}
          <p className="terms-text">
            By creating an account, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </p>

          {/* Register */}
          <button
            type="submit"
            className="register-btn"
          >
            Create Account
          </button>

        </form>

        {/* Login */}
        <p className="login-text">
          Already have an account?
          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </p>

      </div>

    </div>
  );
}

export default Register;