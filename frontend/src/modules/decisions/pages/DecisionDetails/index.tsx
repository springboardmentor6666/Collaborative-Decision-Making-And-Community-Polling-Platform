import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDecision } from "../../hooks/useDecision";
import { DecisionHeader } from "../../components/DecisionHeader";
import { PollOverview } from "../../components/PollOverview";
import { DecisionCardSkeleton } from "../../components/DecisionSkeleton";
import { useAuth } from "@/context/AuthContext";
import { PollCard } from "@/modules/voting/components/PollCard";
import { CommentSection } from "../../../comments/components/CommentSection";
export default function DecisionDetails() {
  const { id } = useParams<{ id: string }>();
  const decisionId = parseInt(id || "0", 10);
  
  const { user } = useAuth();
  const { data: decision, isLoading, error } = useDecision(decisionId);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-6 text-slate-400 hover:text-white" disabled>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <DecisionCardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <DecisionCardSkeleton />
          </div>
          <div className="lg:col-span-1">
            <DecisionCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Decision Not Found</h2>
        <p className="text-slate-400 mb-6">The decision you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link to="/decisions">Back to Decisions</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button asChild variant="ghost" className="mb-6 -ml-4 text-slate-400 hover:text-white">
        <Link to="/decisions">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Decisions
        </Link>
      </Button>

      <DecisionHeader decision={decision} />

      <div className="space-y-8 mt-8">
        {/* Main Content: Poll & Comments */}
        <PollCard decision={decision} />

        <div className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-4 md:p-8 shadow-sm">
          <CommentSection decisionId={decisionId} />
        </div>

        <PollOverview decision={decision} />
        
        {/* Attachments (if any) */}
        {decision.attachments && decision.attachments.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-white text-lg mb-4">Attachments</h3>
            <div className="space-y-3">
              {decision.attachments.map((attachment) => (
                <div key={attachment.attachmentId} className="flex items-center p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-slate-300 truncate">{attachment.fileName}</p>
                    <p className="text-xs text-slate-500">{attachment.fileType}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="shrink-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                    <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
