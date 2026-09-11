import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, BarChart3, Clock, Users, Eye } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DecisionResponse } from "../types/decision";
import { DecisionStatusBadge } from "./DecisionStatusBadge";
import { BookmarkButton } from "./BookmarkButton";
import { ShareButton } from "./ShareButton";
import { ReportButton } from "./ReportButton";
import { HikeButton } from "./HikeButton";
import { useUserPreferences } from "@/modules/profile/hooks/useSettings";

interface DecisionCardProps {
  decision: DecisionResponse;
  isSaved?: boolean;
  onUnsaved?: () => void;
  density?: 'comfortable' | 'compact';
}

export function DecisionCard({ decision, isSaved = false, onUnsaved, density }: DecisionCardProps) {
  const { data: preferences } = useUserPreferences();
  const currentDensity = density || preferences?.feedDensity || 'comfortable';

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

  if (currentDensity === 'compact') {
    return (
      <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-border/80 transition-all shadow-xs">
        <Link to={`/decisions/${decision.decisionId}`} className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar className="h-6 w-6 border border-border shrink-0">
            <AvatarImage src={decision.createdBy?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${decision.createdBy?.username || 'user'}`} />
            <AvatarFallback className="bg-muted text-[10px] text-muted-foreground font-medium">
              {decision.createdBy?.fullName?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap sm:flex-nowrap">
            <span className="text-xs text-muted-foreground font-medium shrink-0">
              {decision.createdBy?.fullName || decision.createdBy?.username || "Author"}
            </span>
            {decision.community && (
              <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center shrink-0">
                <Users className="w-3 h-3 mr-1" />
                {decision.community.name}
              </span>
            )}
            <span className="hidden sm:inline text-border">•</span>
            <span className="text-sm font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {decision.title}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3.5 shrink-0 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1 font-medium text-cyan-600 dark:text-cyan-400">
              <Eye className="w-3.5 h-3.5" />
              {(decision.viewCount ?? 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/80" />
              {(decision.totalVotes ?? 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/80" />
              {(decision.commentCount ?? 0).toLocaleString()}
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground/80" />
              {getDeadlineText()}
            </span>
          </div>
          
          <DecisionStatusBadge status={decision.status} />

          <div className="flex items-center gap-1.5 shrink-0">
            <HikeButton
              decisionId={decision.decisionId}
              isHiked={decision.isHiked}
              hikeCount={decision.hikeCount ?? decision.likeCount ?? 0}
              size="sm"
            />
            <BookmarkButton
              decisionId={decision.decisionId}
              isSaved={isSaved}
              showLabel={false}
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
              onUnsaved={onUnsaved}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="flex flex-col bg-card border-border hover:border-border/80 transition-colors shadow-xs rounded-xl overflow-hidden">
      <Link to={`/decisions/${decision.decisionId}`} className="flex-1">
        <CardHeader className="pb-3 pt-6 px-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-6 w-6 border border-border">
                <AvatarImage src={decision.createdBy?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${decision.createdBy?.username || 'user'}`} />
                <AvatarFallback className="bg-muted text-[10px] text-muted-foreground font-medium">
                  {decision.createdBy?.fullName?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-[14px] font-semibold text-foreground">
                  {decision.createdBy?.fullName || decision.createdBy?.username || "DecisionHub"}
                </span>
                {decision.community && (
                  <>
                    <span className="hidden sm:inline text-border">•</span>
                    <span className="text-[12px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full flex items-center w-fit">
                      <Users className="w-3 h-3 mr-1.5" />
                      {decision.community.name}
                    </span>
                  </>
                )}
              </div>
            </div>
            <DecisionStatusBadge status={decision.status} />
          </div>
          
          <h3 className="text-[19px] font-bold text-foreground line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug">
            {decision.title}
          </h3>
          
          {decision.description && (
            <p className="text-muted-foreground text-[15px] line-clamp-2 mt-2 leading-relaxed">
              {decision.description}
            </p>
          )}

          {/* Media Preview (if any) */}
          {decision.attachments && decision.attachments.length > 0 && (() => {
            const firstImg = decision.attachments.find(a => a.fileType?.startsWith("image/"));
            const totalVisual = decision.attachments.filter(a => a.fileType?.startsWith("image/") || a.fileType?.startsWith("video/")).length;
            if (!firstImg) return null;
            return (
              <div className="relative mt-3.5 rounded-xl overflow-hidden border border-border bg-slate-950 aspect-[16/9] max-h-[240px]">
                <img
                  src={firstImg.fileUrl}
                  alt={decision.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {totalVisual > 1 && (
                  <span className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-white/15 shadow-sm">
                    +{totalVisual - 1} more
                  </span>
                )}
              </div>
            );
          })()}
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-0 mt-3">
          <div className="flex flex-wrap gap-4 text-[13px] font-medium text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 opacity-70" />
              {getDeadlineText()}
            </div>
            <div className="w-px h-3.5 bg-border my-auto hidden sm:block"></div>
            <div className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-1.5 text-blue-500" />
              <span className="text-foreground font-semibold mr-1">{(decision.totalVotes ?? 0).toLocaleString()}</span> Votes
            </div>
            <div className="w-px h-3.5 bg-border my-auto hidden sm:block"></div>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1.5 text-blue-400" />
              <span className="text-foreground font-semibold mr-1">{(decision.commentCount ?? 0).toLocaleString()}</span> Comments
            </div>
            <div className="w-px h-3.5 bg-border my-auto hidden sm:block"></div>
            <div className="flex items-center text-cyan-600 dark:text-cyan-400">
              <Eye className="w-4 h-4 mr-1.5" />
              <span className="text-foreground font-semibold mr-1">{(decision.viewCount ?? 0).toLocaleString()}</span> Views
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="px-6 py-4 border-t border-border flex justify-between items-center bg-card">
        <span className="text-[13px] text-muted-foreground">Created {createdDate}</span>
        
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <HikeButton
            decisionId={decision.decisionId}
            isHiked={decision.isHiked}
            hikeCount={decision.hikeCount ?? decision.likeCount ?? 0}
            size="sm"
          />
          <ReportButton decisionId={decision.decisionId} />
          <BookmarkButton 
            decisionId={decision.decisionId} 
            isSaved={isSaved} 
            showLabel={false} 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onUnsaved={onUnsaved} 
          />
          <ShareButton decisionId={decision.decisionId} title={decision.title} />
        </div>
      </CardFooter>
    </Card>
  );
}
