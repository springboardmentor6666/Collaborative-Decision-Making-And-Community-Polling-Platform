import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(identifier, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(authService.getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* Left Section - Branding & Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/20"></div>
        
        <div className="relative z-10 p-12 max-w-xl text-center flex flex-col items-center">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 mb-8 shadow-2xl">
            <img 
              src="/networking.png" 
              alt="DecisionHub Logo" 
              className="w-16 h-16 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Make Better Decisions, Together.</h2>
          <p className="text-slate-300 text-lg leading-relaxed font-light">
            Collaborate with your team, analyze options systematically, and reach consensus faster with DecisionHub.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 xl:p-24 bg-white">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                required
                placeholder="you@company.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:bg-slate-50 sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:bg-slate-50 sm:text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all text-sm active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="pt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 font-medium hover:text-blue-500 hover:underline transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

