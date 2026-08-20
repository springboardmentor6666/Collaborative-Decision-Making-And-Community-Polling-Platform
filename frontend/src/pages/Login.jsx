import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Toast from "../components/Toast";

function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [typedText, setTypedText] = useState("");
  const fullText =
    "Centralize your intelligence. Connect the data points to make the right choices faster.";

  const [isMounted, setIsMounted] = useState(false);

  // Trigger animations on load
  useEffect(() => {
    setIsMounted(true);

    let i = 0;

    const typingInterval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;

      if (i > fullText.length) {
        clearInterval(typingInterval);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, []);

  // Auto-dismiss Toast after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {
    setMessage("");

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(loginData.email)) {
        setIsError(true);
        setMessage("Enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(loginData)
        }
      );

      const result = await response.json();

      console.log("Login response:", result);

      if (response.ok && result.token) {
        // Success
        setIsError(false);
        setMessage(result.message || "Login successful!");

        // Store authentication information
        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("role", result.role);
        sessionStorage.setItem("userEmail", loginData.email);

        // Give toast time to be visible
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        // Backend error
        setIsError(true);
        setMessage(result.message || "Login failed");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);

      setIsError(true);
      setMessage("Server Error");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-950 font-sans text-white overflow-hidden relative">

      {/* ================= REUSABLE TOAST ================= */}
      <Toast
        message={message}
        isError={isError}
      />

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-purple-900/40 z-0"></div>

      {/* ================= LEFT SIDE ================= */}
      <div
        className={`hidden lg:flex relative w-1/2 flex-col justify-center items-center p-12 z-10 transition-all duration-1000 ease-out transform
          ${
            isMounted
              ? "translate-x-0 opacity-100"
              : "-translate-x-12 opacity-0"
          }`}
      >

        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] animate-[spin_20s_linear_infinite]">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
        </div>

        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] animate-[spin_25s_linear_infinite_reverse]">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
        </div>

        <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-[ping_3s_ease-in-out_infinite] opacity-50"></div>

        <div
          className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-purple-400 rounded-full animate-[ping_4s_ease-in-out_infinite] opacity-50"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full animate-[ping_2.5s_ease-in-out_infinite] opacity-30"></div>

        <div className="relative z-10 flex flex-col items-center">

          <div className="mb-12 animate-[bounce_4s_ease-in-out_infinite]">
            <svg
              className="w-56 h-56 text-blue-400 drop-shadow-[0_0_25px_rgba(96,165,250,0.4)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v4m0 10v4m8-9h-4M7 12H3m14.485-6.485l-2.828 2.828M6.343 17.657l-2.828 2.828m14.142 0l-2.828-2.828M6.343 6.343l-2.828-2.828"
                opacity="0.5"
              />

              <circle
                cx="12"
                cy="12"
                r="4"
                className="text-purple-400"
                fill="currentColor"
              />

              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
              <circle cx="19" cy="12" r="1.5" fill="currentColor" />
              <circle cx="5" cy="12" r="1.5" fill="currentColor" />
              <circle cx="16.95" cy="7.05" r="1.5" fill="currentColor" />
              <circle cx="7.05" cy="16.95" r="1.5" fill="currentColor" />
              <circle cx="16.95" cy="16.95" r="1.5" fill="currentColor" />
              <circle cx="7.05" cy="7.05" r="1.5" fill="currentColor" />
            </svg>
          </div>

          <h1 className="text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 drop-shadow-sm hover:scale-105 transition-transform duration-500 cursor-default">
            DecisionHub
          </h1>

          <p className="text-xl text-blue-100/70 max-w-md text-center font-light leading-relaxed h-16">
            {typedText}
            <span className="animate-pulse font-bold text-blue-400">
              |
            </span>
          </p>

        </div>
      </div>

      {/* ================= RIGHT SIDE: LOGIN FORM ================= */}
      <div
        className={`w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 transition-all duration-1000 delay-300 ease-out transform
          ${
            isMounted
              ? "translate-y-0 opacity-100"
              : "translate-y-12 opacity-0"
          }`}
      >

        <div className="relative w-full max-w-[440px] group">

          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.2rem] blur opacity-20 group-hover:opacity-40 group-hover:-inset-2 transition-all duration-700"></div>

          <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-2xl">

            <div className="text-center mb-8">

              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20 border border-white/20 mb-4 rotate-3 hover:rotate-12 hover:scale-110 transition-all duration-300">
                🗳️
              </div>

              <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">
                Welcome Back
              </h2>

              <p className="text-gray-400 font-medium text-sm">
                Sign in to access your dashboard
              </p>

            </div>

            <div className="space-y-5">

              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 px-4 rounded-xl text-sm transition-all duration-300 active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">

                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.22 24 12 24z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.13 0 9.87 0 12s.43 3.87 1.18 5.4l4.09-3.16z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                  />

                </svg>

                <span>Sign in with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center my-3">

                <div className="flex-grow border-t border-white/10"></div>

                <span className="px-3 text-gray-400 text-[11px] uppercase tracking-wider">
                  Or with email
                </span>

                <div className="flex-grow border-t border-white/10"></div>

              </div>

              {/* Email */}
              <div className="relative pt-2">

                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder=" "
                  value={loginData.email}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                />

                <label
                  htmlFor="email"
                  className="absolute left-4 top-5 text-gray-400 text-base cursor-text transition-all duration-300 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-400 peer-focus:bg-slate-900 px-1 rounded-md"
                  style={{
                    top: loginData.email ? "-1rem" : "",
                    fontSize: loginData.email ? "0.75rem" : "",
                    backgroundColor: loginData.email ? "#0f172a" : ""
                  }}
                >
                  Email Address
                </label>

              </div>

              {/* Password */}
              <div className="relative pt-2">

                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder=" "
                  value={loginData.password}
                  onChange={handleChange}
                  className="peer w-full pl-4 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                />

                <label
                  htmlFor="password"
                  className="absolute left-4 top-5 text-gray-400 text-base cursor-text transition-all duration-300 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-purple-400 peer-focus:bg-slate-900 px-1 rounded-md"
                  style={{
                    top: loginData.password ? "-1rem" : "",
                    fontSize: loginData.password ? "0.75rem" : "",
                    backgroundColor: loginData.password ? "#0f172a" : ""
                  }}
                >
                  Password
                </label>

                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 mt-1 cursor-pointer text-xl text-gray-400 hover:text-white transition-colors select-none hover:scale-125 duration-300"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>

                <div className="flex justify-end mt-2">
                  <a
                    href="#"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className={`w-full mt-2 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 overflow-hidden relative
                  ${
                    isLoading
                      ? "opacity-75 cursor-not-allowed"
                      : "hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] active:scale-[0.98] hover:-translate-y-1"
                  }`}
              >

                <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full hover:animate-[shimmer_1.5s_infinite] transition-transform"></span>

                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white z-10"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>

                    <span className="z-10">
                      Authenticating...
                    </span>
                  </>
                ) : (
                  <span className="z-10">
                    Sign In
                  </span>
                )}

              </button>

              {/* Signup Link */}
              <div className="text-center mt-6 pt-5 border-t border-white/10">

                <span className="text-gray-400">
                  Don't have an account?{" "}
                </span>

                <Link
                  to="/signup"
                  className="text-blue-400 font-semibold hover:text-purple-400 hover:underline transition-colors duration-300"
                >
                  Create Account
                </Link>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
