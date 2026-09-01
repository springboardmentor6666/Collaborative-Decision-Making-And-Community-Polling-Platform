import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommunityResponse } from "@/types";
import { TrendingUp, Users, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TrendingCommunitiesProps {
  communities: CommunityResponse[];
}

export function TrendingCommunities({ communities }: TrendingCommunitiesProps) {
  const navigate = useNavigate();

  if (!communities || communities.length === 0) {
    return (
      <Card className="h-full bg-white border border-[#E2E8F0] shadow-sm rounded-xl">
        <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
            <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB]">
              <TrendingUp className="w-4 h-4" />
            </div>
            Trending Communities
          </CardTitle>
          <Link to="/communities" className="text-xs text-[#2563EB] hover:underline font-medium flex items-center gap-1">
            Explore <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400 border border-slate-100">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-700">No communities found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
            Join or create a community to start engaging.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-white border border-[#E2E8F0] shadow-sm rounded-xl flex flex-col">
      <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-center justify-between border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
          <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB]">
            <TrendingUp className="w-4 h-4" />
          </div>
          Trending Communities
        </CardTitle>
        <Link to="/communities" className="text-xs text-[#2563EB] hover:underline font-medium flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>

      <CardContent className="pt-4 px-4 pb-4 flex-1">
        <div className="space-y-2">
          {communities.map((community, index) => {
            const communityId = community.communityId || (community as any).id;
            const memberCount = community.memberCount ?? 1;

            return (
              <div
                key={communityId || index}
                onClick={() => navigate(`/communities/${communityId}`)}
                className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all cursor-pointer"
              >
                {/* Ranking Number */}
                <div className={`font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  index === 0 ? "bg-amber-100 text-amber-700 font-bold" :
                  index === 1 ? "bg-slate-100 text-slate-700 font-bold" :
                  index === 2 ? "bg-amber-50 text-amber-800" :
                  "text-slate-400"
                }`}>
                  {index + 1}
                </div>

                {/* Community Avatar */}
                <Avatar className="h-8 w-8 rounded-lg border border-slate-200 shrink-0">
                  <AvatarImage src={community.image || `https://api.dicebear.com/7.x/initials/svg?seed=${community.name || 'Community'}`} />
                  <AvatarFallback className="rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                    {community.name?.substring(0, 2).toUpperCase() || "C"}
                  </AvatarFallback>
                </Avatar>

                {/* Community Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors leading-tight">
                    {community.name}
                  </p>
                  <div className="flex items-center text-xs text-slate-500 gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </span>
                    {community.visibility && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="capitalize text-[11px] text-slate-400">
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
