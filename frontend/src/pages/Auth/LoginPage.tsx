import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  
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
    <div className="min-h-screen relative bg-slate-950 flex items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* Background Image with Dark Gradient Vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80')`
        }}
      ></div>

      {/* Ambient Lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Crisp Glass Card */}
      <div className="relative z-10 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md space-y-6 text-white">
        
        {/* Brand Header Inside Card using networking.png Logo */}
        <div className="text-center space-y-2">
          <img 
            src="/networking.png" 
            alt="DecisionHub Logo" 
            className="w-12 h-12 object-contain mx-auto"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <h1 className="text-2xl font-black text-white tracking-tight">Log in to DecisionHub</h1>
          <p className="text-slate-400 text-xs">Collaborate, analyze options, and vote on decision boards</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center font-semibold">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Username or Email <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="username or you@company.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white font-semibold placeholder-slate-500 text-sm outline-none transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password <span className="text-red-400">*</span>
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-blue-400 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white font-semibold placeholder-slate-500 text-sm outline-none transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all text-sm mt-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 font-bold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
