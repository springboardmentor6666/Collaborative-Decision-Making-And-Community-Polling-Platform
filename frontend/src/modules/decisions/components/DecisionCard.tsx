import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, BarChart3, Clock, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DecisionResponse } from "../types/decision";
import { DecisionStatusBadge } from "./DecisionStatusBadge";
import { BookmarkButton } from "./BookmarkButton";
import { ShareButton } from "./ShareButton";
import { ReportButton } from "./ReportButton";

interface DecisionCardProps {
  decision: DecisionResponse;
  isSaved?: boolean;
}

export function DecisionCard({ decision, isSaved = false }: DecisionCardProps) {
  const createdDate = new Date(decision.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getDeadlineText = () => {
    if (!decision.deadline) return "No deadline";
    const deadlineDate = new Date(decision.deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    
    if (diffTime < 0) return "Ended";
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Ends today";
    if (diffDays === 1) return "Ends tomorrow";
    return `Ends in ${diffDays} days`;
  };

  return (
    <Card className="flex flex-col bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors shadow-sm">
      <Link to={`/decisions/${decision.decisionId}`} className="flex-1">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border border-slate-700">
                <AvatarImage src={decision.createdBy.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${decision.createdBy.username}`} />
                <AvatarFallback className="bg-slate-800 text-[10px] text-white">
                  {decision.createdBy.fullName?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-sm font-medium text-slate-300">
                  {decision.createdBy.fullName}
                </span>
                {decision.community && (
                  <>
                    <span className="hidden sm:inline text-slate-600">•</span>
                    <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center w-fit">
                      <Users className="w-3 h-3 mr-1" />
                      {decision.community.name}
                    </span>
                  </>
                )}
              </div>
            </div>
            <DecisionStatusBadge status={decision.status} />
          </div>
          
          <h3 className="text-xl font-bold text-white line-clamp-2 hover:text-blue-400 transition-colors">
            {decision.title}
          </h3>
          
          {decision.description && (
            <p className="text-slate-400 text-sm line-clamp-2 mt-2">
              {decision.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="px-5 py-3">
          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {getDeadlineText()}
            </div>
            <div className="flex items-center">
              <BarChart3 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              <span className="text-slate-300 mr-1">{decision.totalVotes.toLocaleString()}</span> Votes
            </div>
            <div className="flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1 text-blue-500" />
              <span className="text-slate-300 mr-1">0</span> Comments
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="px-5 py-3 border-t border-slate-800 flex justify-between items-center bg-slate-900/50">
        <span className="text-xs text-slate-500">Created {createdDate}</span>
        
        <div className="flex items-center gap-1">
          <ReportButton decisionId={decision.decisionId} />
          <BookmarkButton decisionId={decision.decisionId} isSaved={isSaved} />
          <ShareButton decisionId={decision.decisionId} title={decision.title} />
        </div>
      </CardFooter>
    </Card>
  );
}
