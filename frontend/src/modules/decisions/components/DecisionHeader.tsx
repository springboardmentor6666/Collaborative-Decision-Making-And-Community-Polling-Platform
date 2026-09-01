import React, { useState } from "react";
import { DecisionResponse } from "../types/decision";
import { DecisionStatusBadge } from "./DecisionStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar, BarChart3, Edit, Trash2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useDecisionMutations } from "../hooks/useDecisionMutations";
import { useSavedDecisions } from "../hooks/useDecisions";
import { useAuth } from "@/context/AuthContext";
import { ReportDecisionModal } from "./ReportDecisionModal";
import { BookmarkButton } from "./BookmarkButton";

interface DecisionHeaderProps {
  decision: DecisionResponse;
}

export function DecisionHeader({ decision }: DecisionHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { deleteDecision } = useDecisionMutations();
  const { data: savedData } = useSavedDecisions({ size: 100 });
  const isSaved = savedData?.content?.some((d: any) => d.decisionId === decision.decisionId) ?? false;
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const isOwner = user?.userId === decision.createdBy.userId;
  
  const createdDate = new Date(decision.createdAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  
  const deadlineDate = decision.deadline ? new Date(decision.deadline).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) : "No deadline";

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this decision? This action cannot be undone.")) {
      deleteDecision.mutate(decision.decisionId, {
        onSuccess: () => {
          navigate("/decisions");
        }
      });
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 md:p-8 mb-8 shadow-sm relative overflow-hidden">
      
      <div className="flex flex-col lg:flex-row justify-between gap-6 relative z-10">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <DecisionStatusBadge status={decision.status} />
            <span className="text-sm font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {decision.voteType.replace("_", " ")}
            </span>
            <span className="text-sm font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {decision.visibility}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4 leading-tight">
            {decision.title}
          </h1>

          {decision.description && (
            <p className="text-[#64748B] text-lg mb-6 max-w-3xl whitespace-pre-line">
              {decision.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-slate-200">
                <AvatarImage src={decision.createdBy.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${decision.createdBy.username}`} />
                <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">{decision.createdBy.fullName?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-[#64748B] text-xs">Created by</span>
                <span className="font-semibold text-[#0F172A]">{decision.createdBy.fullName}</span>
              </div>
            </div>

            {decision.community && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB]">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#64748B] text-xs">Community</span>
                  <Link to={`/communities/${decision.community.communityId}`} className="font-semibold text-[#2563EB] hover:underline">
                    {decision.community.name}
                  </Link>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#64748B] text-xs">Total Votes</span>
                <span className="font-semibold text-[#0F172A]">{decision.totalVotes.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#64748B] text-xs">Deadline</span>
                <span className="font-semibold text-[#0F172A]">{deadlineDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col gap-3 shrink-0 relative z-10">
          <BookmarkButton 
            decisionId={decision.decisionId} 
            isSaved={isSaved} 
            variant="outline" 
            className="w-full border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] justify-center"
          />

          {isOwner ? (
            <>
              <Button asChild variant="outline" className="border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] w-full">
                <Link to={`/decisions/${decision.decisionId}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                className="w-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100"
                onClick={handleDelete}
                disabled={deleteDecision.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteDecision.isPending ? "Deleting..." : "Delete"}
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              className="border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] w-full"
              onClick={() => setIsReportModalOpen(true)}
            >
              <Flag className="w-4 h-4 mr-2 text-red-500" />
              Report
            </Button>
          )}
        </div>
      </div>

      <ReportDecisionModal 
        decisionId={decision.decisionId}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
