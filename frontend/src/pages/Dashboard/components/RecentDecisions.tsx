import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DecisionResponse } from "@/types";
import { Target, Users, MessageSquare, Clock, Eye, ArrowRight } from "lucide-react";
import { HikeIcon } from "@/components/icons/HikeIcon";

interface RecentDecisionsProps {
  decisions?: DecisionResponse[];
  recentDecisions?: DecisionResponse[];
  mostHikedDecisions?: DecisionResponse[];
  isLoadingRecent?: boolean;
  isLoadingMostHiked?: boolean;
}

export function RecentDecisions({
  decisions,
  recentDecisions,
  mostHikedDecisions,
  isLoadingRecent = false,
  isLoadingMostHiked = false,
}: RecentDecisionsProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"recent" | "mostHiked">("recent");

  const recentList = recentDecisions || decisions || [];
  const mostHikedList = mostHikedDecisions || [];

  const currentList = activeTab === "recent" ? recentList : mostHikedList;
  const currentLoading = activeTab === "recent" ? isLoadingRecent : isLoadingMostHiked;

  return (
    <Card className="h-full border border-border shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        {/* Tabs: Recent Decisions | Most Hiked Decisions */}
        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("recent")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "recent"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recent Decisions</span>
            {recentList.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-medium text-muted-foreground">
                {recentList.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("mostHiked")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "mostHiked"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HikeIcon hiked={activeTab === "mostHiked"} className="w-3.5 h-3.5" />
            <span>Most Hiked Decisions</span>
            {mostHikedList.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400">
                {mostHikedList.length}
              </span>
            )}
          </button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/decisions")}
          className="text-xs text-muted-foreground hover:text-foreground font-medium h-8 px-2.5 self-end sm:self-center"
        >
          <span>Explore Feed</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </CardHeader>

      <CardContent className="pt-4">
        {currentLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {activeTab === "recent" ? (
              <>
                <Target className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-foreground">No recent decisions yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
                  Start by publishing a new decision board or exploring community discussions.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("/decisions/new")}
                    className="px-3.5 py-1.5 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors shadow-xs"
                  >
                    Create Decision
                  </button>
                  <button
                    onClick={() => navigate("/decisions")}
                    className="px-3.5 py-1.5 text-xs font-medium border border-border hover:bg-muted text-foreground rounded-lg transition-colors"
                  >
                    Explore Feed
                  </button>
                </div>
              </>
            ) : (
              <>
                <HikeIcon hiked={false} className="w-12 h-12 text-muted-foreground mb-4 opacity-30" />
                <h3 className="text-lg font-medium text-foreground">No hiked decisions yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
                  Be the first to hike a proposal or decision board in the community feed!
                </p>
                <button
                  onClick={() => navigate("/decisions")}
                  className="px-3.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Discover & Hike Decisions
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((decision, index) => {
              const decisionId = (decision as any).decisionId || decision.id;
              const hikeCount = (decision as any).hikeCount ?? (decision as any).likeCount ?? 0;
              const voteCount = (decision as any).totalVotes ?? decision.voteCount ?? 0;
              const viewCount = decision.viewCount || 0;

              return (
                <div
                  key={decisionId}
                  className="group flex items-start justify-between p-4 rounded-xl border border-border/70 bg-card text-card-foreground shadow-xs transition-all hover:bg-muted/40 hover:border-border hover:shadow-sm cursor-pointer"
                  onClick={() => navigate(`/decisions/${decisionId}`)}
                >
                  <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {activeTab === "mostHiked" && (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
                          #{index + 1}
                        </span>
                      )}
                      <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {decision.title}
                      </h4>
                      <Badge
                        variant={decision.status === "ACTIVE" || decision.status === "OPEN" ? "default" : "secondary"}
                        className="text-[10px] h-4.5 px-1.5 font-semibold"
                      >
                        {decision.status}
                      </Badge>
                    </div>

                    {decision.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                        {decision.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>{voteCount} votes</span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{decision.commentCount || 0} comments</span>
                      </span>

                      <span
                        className={`flex items-center gap-1.5 font-semibold ${
                          hikeCount > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        <HikeIcon hiked={hikeCount > 0} className="w-3.5 h-3.5" />
                        <span>{hikeCount} hikes</span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{viewCount} views</span>
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
