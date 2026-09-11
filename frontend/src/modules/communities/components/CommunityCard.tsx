import React from "react";
import { Link } from "react-router-dom";
import { Users, Globe, Lock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommunityResponse } from "../types/community";
import { JoinButton } from "./JoinButton";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils";

interface CommunityCardProps {
  community: CommunityResponse;
  isMember?: boolean;
}

export function CommunityCard({ community, isMember = false }: CommunityCardProps) {
  const { user } = useAuth();
  const isOwner = user?.userId === community.owner?.userId;
  const bannerUrl = getImageUrl(community.image);
  const avatarUrl = getImageUrl(community.profileImage || community.image) || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(community.name || 'Community')}`;

  return (
    <Card className="flex flex-col h-full bg-card border-border shadow-xs hover:shadow-md rounded-2xl overflow-hidden transition-all duration-200 group">
      {/* Cover Banner */}
      <div 
        className="h-28 relative w-full bg-muted/40 overflow-hidden"
        style={{
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!bannerUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-purple-800/30" />
        )}
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute top-3 right-3">
          <Badge 
            variant="secondary" 
            className={`text-xs font-medium rounded-full px-2.5 py-0.5 border-none shadow-xs backdrop-blur-md ${
              community.visibility === "PUBLIC" 
                ? "bg-blue-500/20 text-blue-100 border border-blue-400/30" 
                : "bg-slate-900/60 text-slate-200 border border-slate-700/50"
            }`}
          >
            {community.visibility === "PUBLIC" ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
            {community.visibility}
          </Badge>
        </div>
      </div>
      
      {/* Card Header with Overlapping Profile Avatar */}
      <CardHeader className="pt-0 pb-2 px-5 flex-grow relative">
        <div className="flex items-end justify-between -mt-6 mb-3">
          <Avatar className="w-14 h-14 rounded-2xl border-2 border-card shadow-md bg-muted overflow-hidden shrink-0">
            <AvatarImage src={avatarUrl} alt={community.name} className="object-cover w-full h-full" />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-lg">
              {community.name?.substring(0, 2).toUpperCase() || "C"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {community.name}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mt-1 h-10">
          {community.description || "No description provided."}
        </p>
      </CardHeader>
      
      <CardContent className="px-5 py-2">
        <div className="flex items-center text-muted-foreground text-sm font-medium">
          <Users className="w-4 h-4 mr-1.5 text-primary" />
          <span>{community.memberCount.toLocaleString()} {community.memberCount === 1 ? 'Member' : 'Members'}</span>
        </div>
      </CardContent>
      
      <CardFooter className="px-5 pb-5 pt-3 flex gap-2.5">
        <Button asChild variant="outline" className="flex-1 rounded-xl font-medium border-border hover:bg-muted">
          <Link to={`/communities/${community.communityId}`}>View</Link>
        </Button>
        <JoinButton communityId={community.communityId} membership={isMember ? { status: "ACTIVE" } as any : null} isOwner={isOwner} className="flex-1 rounded-xl" />
      </CardFooter>
    </Card>
  );
}
