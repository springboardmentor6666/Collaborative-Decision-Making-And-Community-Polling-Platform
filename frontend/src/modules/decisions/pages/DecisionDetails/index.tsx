import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDecision } from "../../hooks/useDecision";
import { DecisionHeader } from "../../components/DecisionHeader";
import { PollOverview } from "../../components/PollOverview";
import { DecisionCardSkeleton } from "../../components/DecisionSkeleton";
import { DecisionMediaGallery } from "../../components/DecisionMediaGallery";
import { useAuth } from "@/context/AuthContext";
import { PollCard } from "@/modules/voting/components/PollCard";
import { CommentSection } from "../../../comments/components/CommentSection";

export default function DecisionDetails() {
  const { id } = useParams<{ id: string }>();
  const decisionId = parseInt(id || "0", 10);
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const { data: decision, isLoading, error } = useDecision(decisionId);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground" disabled>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <DecisionCardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <div className="h-64 bg-card border border-border rounded-xl animate-pulse" />
          </div>
          <div>
            <div className="h-48 bg-card border border-border rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto shadow-sm">
          <p className="text-red-500 font-semibold mb-2">Error Loading Decision</p>
          <p className="text-muted-foreground text-sm mb-6">Could not load the requested decision or you don't have access.</p>
          <Button onClick={() => navigate("/decisions")} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-9">
            Return to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button 
        asChild
        type="button" 
        variant="ghost" 
        className="mb-6 -ml-4 text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-2 font-medium"
      >
        <Link 
          to="/decisions" 
          onClick={(e) => {
            if (window.history.state && window.history.state.idx > 0) {
              e.preventDefault();
              navigate(-1);
            }
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Decisions</span>
        </Link>
      </Button>

      <DecisionHeader decision={decision} />

      {/* Twitter/X Style Full-Width Media Gallery & Sliders */}
      {decision.attachments && decision.attachments.length > 0 && (
        <DecisionMediaGallery
          attachments={decision.attachments}
          title={decision.title}
          className="mt-6"
        />
      )}

      {/* Main Content: Poll & Comments */}
      <div className="space-y-8 mt-8">
        <PollCard decision={decision} />

        <div className="bg-card border border-border rounded-2xl px-3 py-5 md:p-8 shadow-xs">
          <CommentSection decisionId={decisionId} />
        </div>

        <PollOverview decision={decision} />
      </div>
    </div>
  );
}

