import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommunityResponse } from "@/types";
import { TrendingUp, Users, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/utils";

interface TrendingCommunitiesProps {
  communities: CommunityResponse[];
}

export function TrendingCommunities({ communities }: TrendingCommunitiesProps) {
  const navigate = useNavigate();

  if (!communities || communities.length === 0) {
    return (
      <Card className="h-full border shadow-xs">
        <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
            Trending Communities
          </CardTitle>
          <Link to="/communities" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
            Explore <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2 text-muted-foreground border border-border">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-foreground">No communities found</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
            Join or create a community to start engaging.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border shadow-xs flex flex-col">
      <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-center justify-between border-b">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp className="w-4 h-4" />
          </div>
          Trending Communities
        </CardTitle>
        <Link to="/communities" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>

      <CardContent className="pt-4 px-4 pb-4 flex-1">
        <div className="space-y-1.5">
          {communities.map((community, index) => {
            const communityId = community.communityId || (community as any).id;
            const memberCount = community.memberCount ?? 1;

            return (
              <div
                key={communityId || index}
                onClick={() => navigate(`/communities/${communityId}`)}
                className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 border border-transparent hover:border-border transition-all cursor-pointer"
              >
                {/* Ranking Number */}
                <div className={`font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  index === 0 ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold" :
                  index === 1 ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold" :
                  index === 2 ? "bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-400" :
                  "text-muted-foreground bg-muted"
                }`}>
                  {index + 1}
                </div>

                {/* Community Avatar */}
                <Avatar className="h-8 w-8 rounded-lg border border-border shrink-0">
                  <AvatarImage src={getImageUrl(community.profileImage || community.image) || `https://api.dicebear.com/7.x/initials/svg?seed=${community.name || 'Community'}`} />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                    {community.name?.substring(0, 2).toUpperCase() || "C"}
                  </AvatarFallback>
                </Avatar>

                {/* Community Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                    {community.name}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </span>
                    {community.visibility && (
                      <>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="capitalize text-[11px] text-muted-foreground">
                          {community.visibility.toLowerCase()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
