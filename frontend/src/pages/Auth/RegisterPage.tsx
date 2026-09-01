import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "@/services/authService";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.register(fullName, username, email, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
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
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1920&q=80')` }}
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
          <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Join DecisionHub Today</h2>
          <p className="text-slate-300 text-lg leading-relaxed font-light">
            Empower your community with structured discussions and transparent voting. Setup your account in seconds.
          </p>
        </div>
      </div>

      {/* Right Section - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 xl:p-24 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out my-auto">
          
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create Account</h1>
            <p className="text-slate-500 text-sm">Please fill in the details below to get started.</p>
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

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 font-medium">Registration successful! Redirecting to login...</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting || success}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:bg-slate-50 sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="johndoe123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting || success}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:bg-slate-50 sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || success}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:bg-slate-50 sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting || success}
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

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting || success}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:bg-slate-50 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full flex justify-center items-center bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all text-sm active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="pt-4 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-500 hover:underline transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
