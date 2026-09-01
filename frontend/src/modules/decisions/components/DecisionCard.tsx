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
  onUnsaved?: () => void;
}

export function DecisionCard({ decision, isSaved = false, onUnsaved }: DecisionCardProps) {
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
    <Card className="flex flex-col bg-white border-[#E2E8F0] hover:border-slate-300 transition-colors shadow-sm rounded-xl overflow-hidden">
      <Link to={`/decisions/${decision.decisionId}`} className="flex-1">
        <CardHeader className="pb-3 pt-6 px-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-6 w-6 border border-slate-200">
                <AvatarImage src={decision.createdBy?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${decision.createdBy?.username || 'user'}`} />
                <AvatarFallback className="bg-slate-100 text-[10px] text-slate-600 font-medium">
                  {decision.createdBy?.fullName?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-[14px] font-semibold text-[#0F172A]">
                  {decision.createdBy?.fullName || decision.createdBy?.username || "DecisionHub"}
                </span>
                {decision.community && (
                  <>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="text-[12px] font-medium text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full flex items-center w-fit">
                      <Users className="w-3 h-3 mr-1.5" />
                      {decision.community.name}
                    </span>
                  </>
                )}
              </div>
            </div>
            <DecisionStatusBadge status={decision.status} />
          </div>
          
          <h3 className="text-[19px] font-bold text-[#0F172A] line-clamp-2 hover:text-[#2563EB] transition-colors leading-snug">
            {decision.title}
          </h3>
          
          {decision.description && (
            <p className="text-[#64748B] text-[15px] line-clamp-2 mt-2 leading-relaxed">
              {decision.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-0 mt-3">
          <div className="flex flex-wrap gap-4 text-[13px] font-medium text-[#64748B]">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 opacity-70 text-[#94A3B8]" />
              {getDeadlineText()}
            </div>
            <div className="w-px h-3.5 bg-[#E2E8F0] my-auto hidden sm:block"></div>
            <div className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-1.5 text-[#3B82F6]" />
              <span className="text-[#64748B] mr-1">{(decision.totalVotes ?? 0).toLocaleString()}</span> Votes
            </div>
            <div className="w-px h-3.5 bg-[#E2E8F0] my-auto hidden sm:block"></div>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1.5 text-[#60A5FA]" />
              <span className="text-[#64748B] mr-1">{(decision.commentCount ?? 0).toLocaleString()}</span> Comments
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="px-6 py-4 border-t border-[#E2E8F0] flex justify-between items-center bg-white">
        <span className="text-[13px] text-[#64748B]">Created {createdDate}</span>
        
        <div className="flex items-center gap-1 text-[#64748B]">
          <ReportButton decisionId={decision.decisionId} />
          <BookmarkButton decisionId={decision.decisionId} isSaved={isSaved} onUnsaved={onUnsaved} />
          <ShareButton decisionId={decision.decisionId} title={decision.title} />
        </div>
      </CardFooter>
    </Card>
  );
}
