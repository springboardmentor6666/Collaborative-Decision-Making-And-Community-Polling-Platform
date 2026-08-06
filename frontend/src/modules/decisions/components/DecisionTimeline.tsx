import React from "react";
import { DecisionResponse } from "../types/decision";
import { Clock, CheckCircle2, PlayCircle, Archive } from "lucide-react";

interface DecisionTimelineProps {
  decision: DecisionResponse;
}

export function DecisionTimeline({ decision }: DecisionTimelineProps) {
  const isClosed = decision.status === "CLOSED" || decision.status === "ARCHIVED";
  const isDraft = decision.status === "DRAFT";
  
  const createdDate = new Date(decision.createdAt).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric"
  });
  
  const deadlineDate = decision.deadline ? new Date(decision.deadline).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
  }) : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h3 className="font-bold text-white text-lg mb-6">Decision Timeline</h3>
      
      <div className="relative border-l border-slate-700 ml-3 space-y-6">
        
        {/* Created */}
        <div className="relative pl-6">
          <div className="absolute -left-2.5 top-0 w-5 h-5 bg-slate-900 border-2 border-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-semibold text-white">Decision Created</h4>
            <span className="text-xs text-slate-500 mt-1">{createdDate}</span>
          </div>
        </div>

        {/* Status */}
        {!isDraft && (
          <div className="relative pl-6">
            <div className="absolute -left-2.5 top-0 w-5 h-5 bg-slate-900 border-2 border-blue-500 rounded-full flex items-center justify-center">
              <PlayCircle className="w-3 h-3 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-white">Voting Started</h4>
              <span className="text-xs text-slate-500 mt-1">Open for community votes</span>
            </div>
          </div>
        )}

        {/* Milestone - e.g. 100 votes */}
        {decision.totalVotes > 0 && !isDraft && (
          <div className="relative pl-6">
            <div className="absolute -left-2.5 top-0 w-5 h-5 bg-slate-900 border-2 border-amber-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-white">{decision.totalVotes.toLocaleString()} Votes Reached</h4>
              <span className="text-xs text-slate-500 mt-1">Community engagement active</span>
            </div>
          </div>
        )}

        {/* Deadline / Closed */}
        {deadlineDate && (
          <div className="relative pl-6">
            <div className={`absolute -left-2.5 top-0 w-5 h-5 bg-slate-900 border-2 rounded-full flex items-center justify-center ${isClosed ? "border-slate-500" : "border-slate-700"}`}>
              {isClosed ? <Archive className="w-3 h-3 text-slate-500" /> : <Clock className="w-3 h-3 text-slate-700" />}
            </div>
            <div className="flex flex-col">
              <h4 className={`text-sm font-semibold ${isClosed ? "text-slate-400" : "text-white"}`}>
                {isClosed ? "Voting Closed" : "Deadline"}
              </h4>
              <span className="text-xs text-slate-500 mt-1">{deadlineDate}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
