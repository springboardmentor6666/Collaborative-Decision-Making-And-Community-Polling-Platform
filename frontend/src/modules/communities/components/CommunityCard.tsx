import React from "react";
import { Link } from "react-router-dom";
import { Users, Globe, Lock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommunityResponse } from "../types/community";
import { JoinButton } from "./JoinButton";

interface CommunityCardProps {
  community: CommunityResponse;
  isMember?: boolean;
}

export function CommunityCard({ community, isMember = false }: CommunityCardProps) {
  return (
    <Card className="flex flex-col h-full bg-slate-900 border-slate-800 overflow-hidden hover:border-slate-700 transition-colors">
      <div 
        className="h-32 bg-slate-800 relative w-full"
        style={{
          backgroundImage: community.image ? `url(${community.image})` : 'linear-gradient(to right, #1e293b, #0f172a)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute top-4 right-4">
          <Badge variant={community.visibility === "PUBLIC" ? "secondary" : "outline"} className="bg-slate-950/80 text-xs font-semibold backdrop-blur-sm border-slate-700 text-white">
            {community.visibility === "PUBLIC" ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
            {community.visibility}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pt-4 pb-2 px-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white line-clamp-1">{community.name}</h3>
        </div>
        <p className="text-slate-400 text-sm line-clamp-2 mt-1 h-10">
          {community.description || "No description provided."}
        </p>
      </CardHeader>
      
      <CardContent className="px-5 py-2">
        <div className="flex items-center text-slate-400 text-sm font-medium">
          <Users className="w-4 h-4 mr-1.5 text-blue-500" />
          <span>{community.memberCount.toLocaleString()} {community.memberCount === 1 ? 'Member' : 'Members'}</span>
        </div>
      </CardContent>
      
      <CardFooter className="px-5 pb-5 pt-3 flex gap-3">
        <Button asChild variant="default" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
          <Link to={`/communities/${community.communityId}`}>View</Link>
        </Button>
        <JoinButton communityId={community.communityId} membership={isMember ? { status: "ACTIVE" } as any : null} />
      </CardFooter>
    </Card>
  );
}
