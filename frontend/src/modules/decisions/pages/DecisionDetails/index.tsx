import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Paperclip, 
  ExternalLink, 
  Download, 
  FileText, 
  Video, 
  Image as ImageIcon,
  Maximize2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto shadow-sm">
          <h2 className="text-2xl font-bold text-foreground mb-2">Decision Not Found</h2>
          <p className="text-muted-foreground text-sm mb-6">The decision you're looking for doesn't exist or has been deleted by its author.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-9">
            <Link to="/decisions">Back to Decisions</Link>
          </Button>
        </div>
      </div>
    );
  }

  const imageAttachments = decision.attachments?.filter(a => a.fileType?.startsWith("image/")) || [];
  const videoAttachments = decision.attachments?.filter(a => a.fileType?.startsWith("video/")) || [];
  const docAttachments = decision.attachments?.filter(a => !a.fileType?.startsWith("image/") && !a.fileType?.startsWith("video/")) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button asChild variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <Link to="/decisions">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Decisions
        </Link>
      </Button>

      <DecisionHeader decision={decision} />

      {/* Media Attachments Gallery (if any) */}
      {decision.attachments && decision.attachments.length > 0 && (
        <div className="mt-8 bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-blue-500" />
              <span>Media & Evidence</span>
            </h3>
            <Badge variant="secondary" className="bg-muted text-muted-foreground font-semibold text-xs">
              {decision.attachments.length} {decision.attachments.length === 1 ? 'file' : 'files'}
            </Badge>
          </div>

          {/* Images Grid Showcase */}
          {imageAttachments.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Images & Diagrams</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {imageAttachments.map((img) => (
                  <div
                    key={img.attachmentId}
                    onClick={() => setSelectedImage(img.fileUrl)}
                    className="relative group rounded-xl overflow-hidden border border-border bg-muted/40 aspect-video cursor-pointer hover:border-blue-500/60 transition-all"
                  >
                    <img
                      src={img.fileUrl}
                      alt={img.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-semibold">
                      <Maximize2 className="w-4 h-4" />
                      <span>View Full Image</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Player Showcase */}
          {videoAttachments.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-500" />
                <span>Video Demonstrations</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videoAttachments.map((vid) => (
                  <div key={vid.attachmentId} className="rounded-xl overflow-hidden border border-border bg-black/90 p-1">
                    <video
                      controls
                      preload="metadata"
                      className="w-full rounded-lg max-h-[300px] object-contain"
                    >
                      <source src={vid.fileUrl} type={vid.fileType} />
                      Your browser does not support HTML5 video playback.
                    </video>
                    <p className="text-xs text-muted-foreground p-2 truncate">{vid.fileName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents & PDFs */}
          {docAttachments.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Documents & Files</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {docAttachments.map((doc) => (
                  <div
                    key={doc.attachmentId}
                    className="flex items-center justify-between p-3.5 bg-muted/30 border border-border rounded-xl hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate max-w-[200px]">{doc.fileName}</p>
                        <p className="text-[11px] text-muted-foreground">{doc.fileType}</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="shrink-0 text-xs font-semibold h-8 border-border hover:bg-muted text-foreground gap-1.5"
                    >
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                        <Download className="w-3.5 h-3.5 text-blue-500" />
                        <span>Download</span>
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content: Poll & Comments */}
      <div className="space-y-8 mt-8">
        <PollCard decision={decision} />

        <div className="bg-card border border-border rounded-2xl px-3 py-5 md:p-8 shadow-xs">
          <CommentSection decisionId={decisionId} />
        </div>

        <PollOverview decision={decision} />
      </div>

      {/* Lightbox Zoom Modal for Images */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-card rounded-2xl p-2 border border-border shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-[85vh] rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
