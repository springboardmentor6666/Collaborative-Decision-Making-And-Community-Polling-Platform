import React, { useState } from "react";
import { DecisionResponse } from "../types/decision";
import { DecisionStatusBadge } from "./DecisionStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar, BarChart3, Edit, Trash2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useDecisionMutations } from "../hooks/useDecisionMutations";
import { useAuth } from "@/context/AuthContext";
import { ReportDecisionModal } from "./ReportDecisionModal";

interface DecisionHeaderProps {
  decision: DecisionResponse;
}

export function DecisionHeader({ decision }: DecisionHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { deleteDecision } = useDecisionMutations();
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 mb-8 shadow-sm relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <DecisionStatusBadge status={decision.status} />
            <span className="text-sm font-medium px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
              {decision.voteType.replace("_", " ")}
            </span>
            <span className="text-sm font-medium px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
              {decision.visibility}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {decision.title}
          </h1>

          {decision.description && (
            <p className="text-slate-400 text-lg mb-6 max-w-3xl whitespace-pre-line">
              {decision.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-slate-700">
                <AvatarImage src={decision.createdBy.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${decision.createdBy.username}`} />
                <AvatarFallback>{decision.createdBy.fullName?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs">Created by</span>
                <span className="font-medium text-slate-200">{decision.createdBy.fullName}</span>
              </div>
            </div>

            {decision.community && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs">Community</span>
                  <Link to={`/communities/${decision.community.communityId}`} className="font-medium text-blue-400 hover:underline">
                    {decision.community.name}
                  </Link>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs">Total Votes</span>
                <span className="font-medium text-slate-200">{decision.totalVotes.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs">Deadline</span>
                <span className="font-medium text-slate-200">{deadlineDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col gap-3 shrink-0">
          {isOwner ? (
            <>
              <Button asChild variant="outline" className="border-slate-700 hover:bg-slate-800 text-white w-full">
                <Link to={`/decisions/${decision.decisionId}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-none"
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
              className="border-slate-700 hover:bg-slate-800 text-white w-full"
              onClick={() => setIsReportModalOpen(true)}
            >
              <Flag className="w-4 h-4 mr-2 text-red-400" />
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
