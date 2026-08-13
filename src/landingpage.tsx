import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Navigation with Logo */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition">
            <img
              src="/networking.png"
              alt="DecisionHub Logo"
              className="w-8 h-8 object-contain filter brightness-200"
            />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">
              Decision<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Hub</span>
            </h1>

            <p className="text-[10px] font-extrabold uppercase text-indigo-300 tracking-widest mt-0.5">
              Collaborative Platform
            </p>
          </div>
        </div>

        <div className="space-x-3 flex items-center">
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition transform active:scale-95 border border-indigo-400/30"
          >
            Sign Up Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto z-10">

        {/* Left Side */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <span className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-300 text-xs font-extrabold rounded-full tracking-wide border border-indigo-500/20 backdrop-blur-md">
            ✨ AI-Driven Decision & Community Platform
          </span>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 leading-[1.15] tracking-tight">
            Collaborative decision-making for modern teams
          </h2>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
            Create decision boards, compare multiple options with pros & cons,
            invite your community to vote, and reach consensus faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/login"
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-center text-base rounded-xl shadow-xl shadow-indigo-500/30 transition transform active:scale-95 border border-indigo-400/30"
            >
              Get Started for Free
            </Link>
          </div>
        </div>

        {/* Right Preview Card */}
        <div className="lg:col-span-6 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-indigo-950/50 space-y-6">

          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white">
              Strategy Brief: Startup vs Corporate
            </h3>

            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3.5 py-1 rounded-full border border-emerald-500/20">
              Active Board
            </span>
          </div>

          <div className="space-y-4">

            {/* Option A */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex justify-between items-center shadow-lg shadow-indigo-500/5">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Option A
                </span>

                <p className="text-base font-bold text-white mt-0.5">
                  Tech Startup
                </p>
              </div>

              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                64% Votes
              </span>
            </div>

            {/* Option B */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Option B
                </span>

                <p className="text-base font-bold text-slate-200 mt-0.5">
                  Fortune 500 Corporate
                </p>
              </div>

              <span className="text-xl font-black text-slate-400">
                36% Votes
              </span>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-500 text-xs border-t border-slate-800/80 z-10">
        DecisionHub Platform © 2026 • Full-Stack React Solution
      </footer>

    </div>
  );
}