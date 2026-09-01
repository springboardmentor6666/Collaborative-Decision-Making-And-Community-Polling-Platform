import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  CheckCircle2, 
  Vote, 
  Users, 
  BarChart3, 
  Sparkles, 
  ShieldCheck,
  MessageSquare
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 via-white to-blue-50/30 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-200/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
            <img 
              src="/networking.png" 
              alt="DecisionHub Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain transition-transform group-hover:scale-105"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                Decision<span className="text-blue-600">Hub</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-slate-400 tracking-wider sm:tracking-widest mt-0.5 hidden xs:block">
                Collaborative Platform
              </p>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              to="/login"
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all transform active:scale-95 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100/80 text-blue-700 text-xs sm:text-sm font-bold rounded-full border border-blue-200/60 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>AI-Driven Decision & Community Platform</span>
              </div>

              <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] sm:leading-[1.12] tracking-tight">
                Collaborative decision-making for <span className="text-blue-600 bg-clip-text">modern teams</span>
              </h2>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Create structured decision boards, compare multiple options with pros & cons, invite your community to vote, and reach consensus faster.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4 max-w-md mx-auto lg:mx-0">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-center text-sm sm:text-base rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Get Started for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-center text-sm sm:text-base rounded-xl border border-slate-200 shadow-xs transition-colors"
                >
                  Browse Decisions
                </Link>
              </div>

              {/* Trust badges / checklist */}
              <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free to use</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time voting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Community governance</span>
                </div>
              </div>
            </div>

            {/* Right Column - Interactive Preview Card */}
            <div className="lg:col-span-6 w-full max-w-xl mx-auto lg:max-w-none">
              <div className="bg-white p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-blue-900/5 space-y-5 sm:space-y-6 relative overflow-hidden">
                {/* Card Glow Element */}
                <div className="absolute -right-16 -top-16 w-36 h-36 bg-blue-100/50 rounded-full blur-2xl pointer-events-none"></div>

                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Poll Overview</span>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-snug">
                      Strategy Brief: Startup vs Corporate
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Active Board</span>
                  </div>
                </div>

                {/* Card Poll Options */}
                <div className="space-y-3.5 sm:space-y-4">
                  {/* Option A */}
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-50/70 border border-blue-200/70 relative overflow-hidden transition-all hover:border-blue-300">
                    {/* Background Progress bar */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-blue-500/10 transition-all duration-1000 ease-out rounded-xl sm:rounded-2xl"
                      style={{ width: "64%" }}
                    ></div>
                    
                    <div className="relative z-10 flex justify-between items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">Option A</span>
                        <p className="text-sm sm:text-base font-bold text-slate-900 truncate">Tech Startup</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base sm:text-xl font-black text-blue-600">64%</span>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium">800 votes</p>
                      </div>
                    </div>
                  </div>

                  {/* Option B */}
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden transition-all hover:border-slate-300">
                    {/* Background Progress bar */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-slate-400/10 transition-all duration-1000 ease-out rounded-xl sm:rounded-2xl"
                      style={{ width: "36%" }}
                    ></div>

                    <div className="relative z-10 flex justify-between items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Option B</span>
                        <p className="text-sm sm:text-base font-bold text-slate-900 truncate">Fortune 500 Corporate</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base sm:text-xl font-black text-slate-600">36%</span>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium">448 votes</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Meta Info Footer */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-medium border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Vote className="w-3.5 h-3.5 text-blue-500" />
                      1,248 votes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      42 discussions
                    </span>
                  </div>
                  <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                    Ends in 3 days
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Feature Pillars on Mobile & Desktop */}
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-slate-200/70 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Vote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900">Structured Voting</h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
                  Single, multiple, or rated choice voting with deadline enforcement and privacy options.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900">Community Spaces</h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
                  Organize by community, delegate decision roles, and manage private or public memberships.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900">Real-Time Insights</h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
                  Instant visual breakdown of consensus metrics and participation stats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 px-4 text-slate-500 text-xs border-t border-slate-200/70 bg-white/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>DecisionHub Platform © 2026 • Full-Stack React Solution</p>
          <div className="flex items-center space-x-4 text-slate-600 font-medium">
            <Link to="/login" className="hover:text-blue-600 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-blue-600 transition-colors">Sign Up</Link>
            <Link to="/decisions" className="hover:text-blue-600 transition-colors">Explore</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}