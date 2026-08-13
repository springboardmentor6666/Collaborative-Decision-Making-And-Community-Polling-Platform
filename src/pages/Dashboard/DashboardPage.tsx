import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analyticsApi";
import { decisionApi } from "@/api/decisionApi";
import { useAuth } from "@/context/AuthContext";
import { DashboardStats } from "./components/DashboardStats";
import { RecentDecisions } from "./components/RecentDecisions";
import { TrendingPolls } from "./components/TrendingPolls";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquarePlus, Send, Star, CheckCircle } from "lucide-react";

export function DashboardPage() {
  const { user } = useAuth();

  // User Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats", user?.userId],
    queryFn: () =>
      analyticsApi
        .getUserAnalytics(user?.userId)
        .then((res) => res.data),
    enabled: !!user?.userId,
  });

  const { data: recentDecisionsData, isLoading: recentLoading } = useQuery({
    queryKey: ["recentDecisions"],
    queryFn: () =>
      decisionApi.getLatestDecisions(0, 5).then((res) => res.data),
  });

  const { data: trendingDecisionsData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trendingDecisions"],
    queryFn: () =>
      decisionApi.getTrendingDecisions(0, 5).then((res) => res.data),
  });

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      setFeedbackText("");
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 px-4 py-6 md:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">

      {/* ================= HEADER BANNER ================= */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-8 shadow-xl shadow-indigo-200 dark:shadow-indigo-950/50 border border-indigo-400/20">

        {/* Decorative Glow Accents */}
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-indigo-400/20 blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-white/20 dark:bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-white border border-white/10 backdrop-blur-md">
                DECISION HUB
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Welcome back, {user?.fullName || "User"} 👋
            </h1>

            <p className="mt-2 max-w-xl text-sm text-indigo-100 md:text-base leading-relaxed">
              Track your decisions, discover trending polls, and make smarter
              choices with your community.
            </p>
          </div>

          <div className="hidden h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-4xl border border-white/10 backdrop-blur-md md:flex shadow-inner">
            📊
          </div>
        </div>
      </div>

      {/* ================= SECTION TITLE ================= */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Your Overview
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Here's a quick look at your decision activity.
        </p>
      </div>

      {/* ================= STATS OVERVIEW ================= */}
      {statsLoading ? (
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-900" />
          <Skeleton className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-900" />
          <Skeleton className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-900" />
          <Skeleton className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-900" />
        </div>
      ) : (
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-1 shadow-lg shadow-slate-200/40 dark:shadow-xl backdrop-blur-md">
          <DashboardStats stats={statsData?.data} />
        </div>
      )}

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* ================= RECENT DECISIONS ================= */}
        <div className="lg:col-span-8 group overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-lg shadow-slate-200/40 dark:shadow-xl backdrop-blur-md transition-all duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 text-lg">
                📝
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Recent Decisions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your latest activity
                </p>
              </div>
            </div>

            <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20">
              Latest
            </span>
          </div>

          <div className="p-4 md:p-6">
            {recentLoading ? (
              <Skeleton className="h-[280px] w-full rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
            ) : (
              <RecentDecisions
                decisions={recentDecisionsData?.data?.content || []}
              />
            )}
          </div>
        </div>

        {/* ================= TRENDING POLLS ================= */}
        <div className="lg:col-span-4 group overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-lg shadow-slate-200/40 dark:shadow-xl backdrop-blur-md transition-all duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 text-lg">
                🔥
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Trending Polls
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Popular right now
                </p>
              </div>
            </div>

            <span className="rounded-full bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-500/20">
              Trending
            </span>
          </div>

          <div className="p-4 md:p-6">
            {trendingLoading ? (
              <Skeleton className="h-[280px] w-full rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
            ) : (
              <TrendingPolls
                decisions={trendingDecisionsData?.data?.content || []}
              />
            )}
          </div>
        </div>

        {/* ================= USER FEEDBACK SECTION ================= */}
        <div className="lg:col-span-12 overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors">
          <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <MessageSquarePlus size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Share Your Feedback</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Help us make DecisionHub better for everyone.</p>
            </div>
          </div>

          {submitted ? (
            <div className="py-6 text-center space-y-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl">
              <div className="flex justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={32} />
              </div>
              <p className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">Thank you for your feedback!</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your input has been recorded.</p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              
              {/* Star Rating Selection */}
              <div className="md:col-span-4 space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Rate your experience</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 border ${
                        rating >= star
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                          : "bg-slate-100 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <Star size={13} className={rating >= star ? "fill-white text-white" : "text-slate-400"} />
                      <span>{star}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Input Field */}
              <div className="md:col-span-6 space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Your comments or suggestions</label>
                <input
                  type="text"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="What should we add or fix next?"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center justify-center space-x-2 border border-indigo-400/30"
                >
                  <Send size={14} />
                  <span>Submit</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>

      {/* ================= FOOTER MESSAGE ================= */}
      <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 p-4 text-center">
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          💡 Make better decisions • Share your thoughts • Learn from your community
        </p>
      </div>

    </div>
  );
}