import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-blue-50/60 text-slate-900 flex flex-col justify-between font-sans">
      {/* Header Navigation with Logo */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer">
          <img 
            src="/networking.png" 
            alt="DecisionHub Logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
              Decision<span className="text-blue-600">Hub</span>
            </h1>
            <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest mt-0.5">
              Collaborative Platform
            </p>
          </div>
        </div>

        <div className="space-x-3">
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-blue-600 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition transform active:scale-95"
          >
            Sign Up Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">
        <div className="lg:col-span-6 space-y-6 text-left">
          <span className="inline-block px-3.5 py-1.5 bg-blue-100 text-blue-700 text-xs font-extrabold rounded-full tracking-wide">
            ✨ AI-Driven Decision & Community Platform
          </span>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight">
            Collaborative decision-making for modern teams
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
            Create decision boards, compare multiple options with pros & cons, invite your community to vote, and reach consensus faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/login"
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-center text-base rounded-xl shadow-xl shadow-blue-500/25 transition transform active:scale-95"
            >
              Get Started for Free
            </Link>
          </div>
        </div>

        {/* Preview Card */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-blue-900/10 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900">Strategy Brief: Startup vs Corporate</h3>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              Active Board
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">Option A</span>
                <p className="text-base font-bold text-slate-800">Tech Startup</p>
              </div>
              <span className="text-xl font-black text-blue-600">64% Votes</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Option B</span>
                <p className="text-base font-bold text-slate-800">Fortune 500 Corporate</p>
              </div>
              <span className="text-xl font-black text-slate-500">36% Votes</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-slate-500 text-xs border-t border-slate-200/60">
        DecisionHub Platform © 2026 • Full-Stack React Solution
      </footer>
    </div>
  );
}