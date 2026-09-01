import React from "react";
import { DecisionResponse } from "../types/decision";
import { Clock, CheckCircle2, PlayCircle, Archive } from "lucide-react";
import { useVoteResults } from "@/modules/voting/hooks/useVoteResults";

interface PollOverviewProps {
  decision: DecisionResponse;
}

export function PollOverview({ decision }: PollOverviewProps) {
  const { data: results } = useVoteResults(decision.decisionId);
  const totalVotesCount = results?.totalVotesCount ?? decision.totalVotes ?? 0;

  const eligibleVoters = decision.community ? decision.community.memberCount : null;
  const isClosed = decision.status === "CLOSED" || decision.status === "ARCHIVED";
  const isDraft = decision.status === "DRAFT";
  
  const createdDate = new Date(decision.createdAt).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric"
  });
  
  const deadlineDate = decision.deadline ? new Date(decision.deadline).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
  }) : null;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
      <h3 className="font-bold text-[#0F172A] text-lg mb-6">Poll Overview</h3>
      
      {/* Statistics Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
        <div className="flex flex-col">
          <span className="text-sm text-[#64748B] uppercase tracking-wider mb-1 font-semibold">Total Votes</span>
          <span className="text-xl font-bold text-[#0F172A]">{totalVotesCount.toLocaleString()}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm text-[#64748B] uppercase tracking-wider mb-1 font-semibold">Eligible Voters</span>
          <span className="text-xl font-bold text-[#0F172A]">{eligibleVoters !== null ? `${eligibleVoters} members` : "Public"}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm text-[#64748B] uppercase tracking-wider mb-1 font-semibold">Voting Status</span>
          <span className="text-xl font-bold text-[#0F172A]">
            {isClosed ? "Closed" : isDraft ? "Draft" : "Open"}
          </span>
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] my-6" />

      {/* Decision Timeline */}
      <h4 className="font-bold text-[#0F172A] text-md mb-6">Decision Timeline</h4>
      <div className="relative border-l border-[#E2E8F0] ml-3 space-y-6">
        
        {/* Created */}
        <div className="relative pl-6">
          <div className="absolute -left-2.5 top-0 w-5 h-5 bg-white border-2 border-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-semibold text-[#0F172A]">Decision Created</h4>
            <span className="text-xs text-[#64748B] mt-1">{createdDate}</span>
          </div>
        </div>

        {/* Status */}
        {!isDraft && (
          <div className="relative pl-6">
            <div className="absolute -left-2.5 top-0 w-5 h-5 bg-white border-2 border-[#2563EB] rounded-full flex items-center justify-center">
              <PlayCircle className="w-3 h-3 text-[#2563EB]" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-[#0F172A]">Voting Started</h4>
              <span className="text-xs text-[#64748B] mt-1">Open for community votes</span>
            </div>
          </div>
        )}

        {/* Milestone - e.g. votes reached */}
        {totalVotesCount > 0 && !isDraft && (
          <div className="relative pl-6">
            <div className="absolute -left-2.5 top-0 w-5 h-5 bg-white border-2 border-amber-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-[#0F172A]">{totalVotesCount.toLocaleString()} Votes Reached</h4>
              <span className="text-xs text-[#64748B] mt-1">Community engagement active</span>
            </div>
          </div>
        )}

        {/* Deadline / Closed */}
        {deadlineDate && (
          <div className="relative pl-6">
            <div className={`absolute -left-2.5 top-0 w-5 h-5 bg-white border-2 rounded-full flex items-center justify-center ${isClosed ? "border-slate-400" : "border-[#CBD5E1]"}`}>
              {isClosed ? <Archive className="w-3 h-3 text-[#64748B]" /> : <Clock className="w-3 h-3 text-[#94A3B8]" />}
            </div>
            <div className="flex flex-col">
              <h4 className={`text-sm font-semibold ${isClosed ? "text-[#64748B]" : "text-[#0F172A]"}`}>
                {isClosed ? "Voting Closed" : "Deadline"}
              </h4>
              <span className="text-xs text-[#64748B] mt-1">{deadlineDate}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
