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
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xs">
      <h3 className="font-bold text-foreground text-lg mb-6">Poll Overview</h3>
      
      {/* Statistics Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Total Votes</span>
          <span className="text-xl font-bold text-foreground">{totalVotesCount.toLocaleString()}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Eligible Voters</span>
          <span className="text-xl font-bold text-foreground">{eligibleVoters !== null ? `${eligibleVoters} members` : "Public"}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Voting Status</span>
          <span className="text-xl font-bold text-foreground">
            {isClosed ? "Closed" : isDraft ? "Draft" : "Open"}
          </span>
        </div>
      </div>

      <div className="border-t border-border my-6" />

      {/* Decision Timeline */}
      <h4 className="font-bold text-foreground text-base mb-6">Decision Timeline</h4>
      <div className="relative border-l border-border ml-3 space-y-6">
        
        {/* Created */}
        <div className="relative pl-6">
          <div className="absolute -left-2.5 top-0 w-5 h-5 bg-card border-2 border-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-semibold text-foreground">Decision Created</h4>
            <span className="text-xs text-muted-foreground mt-1">{createdDate}</span>
          </div>
        </div>

        {/* Status */}
        {!isDraft && (
          <div className="relative pl-6">
            <div className="absolute -left-2.5 top-0 w-5 h-5 bg-card border-2 border-blue-500 rounded-full flex items-center justify-center">
              <PlayCircle className="w-3 h-3 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-foreground">Voting Started</h4>
              <span className="text-xs text-muted-foreground mt-1">Open for community votes</span>
            </div>
          </div>
        )}

        {/* Milestone - e.g. votes reached */}
        {totalVotesCount > 0 && !isDraft && (
          <div className="relative pl-6">
            <div className="absolute -left-2.5 top-0 w-5 h-5 bg-card border-2 border-amber-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-foreground">{totalVotesCount.toLocaleString()} Votes Reached</h4>
              <span className="text-xs text-muted-foreground mt-1">Community engagement active</span>
            </div>
          </div>
        )}

        {/* Deadline / Closed */}
        {deadlineDate && (
          <div className="relative pl-6">
            <div className={`absolute -left-2.5 top-0 w-5 h-5 bg-card border-2 rounded-full flex items-center justify-center ${isClosed ? "border-muted-foreground" : "border-border"}`}>
              {isClosed ? <Archive className="w-3 h-3 text-muted-foreground" /> : <Clock className="w-3 h-3 text-muted-foreground" />}
            </div>
            <div className="flex flex-col">
              <h4 className={`text-sm font-semibold ${isClosed ? "text-muted-foreground" : "text-foreground"}`}>
                {isClosed ? "Voting Closed" : "Deadline"}
              </h4>
              <span className="text-xs text-muted-foreground mt-1">{deadlineDate}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
