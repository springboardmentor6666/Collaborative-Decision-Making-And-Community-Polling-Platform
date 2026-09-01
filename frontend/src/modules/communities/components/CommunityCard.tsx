import React from "react";
import { Link } from "react-router-dom";
import { Users, Globe, Lock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommunityResponse } from "../types/community";
import { JoinButton } from "./JoinButton";
import { useAuth } from "@/context/AuthContext";

interface CommunityCardProps {
  community: CommunityResponse;
  isMember?: boolean;
}

export function CommunityCard({ community, isMember = false }: CommunityCardProps) {
  const { user } = useAuth();
  const isOwner = user?.userId === community.owner?.userId;

  return (
    <Card className="flex flex-col h-full bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="h-32 relative w-full bg-slate-100"
        style={{
          backgroundImage: community.image ? `url(${community.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute top-4 right-4">
          <Badge 
            variant="secondary" 
            className={`text-xs font-medium rounded-full px-2.5 py-0.5 border-none shadow-none ${
              community.visibility === "PUBLIC" 
                ? "bg-blue-50 text-blue-700" 
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {community.visibility === "PUBLIC" ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
            {community.visibility}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pt-6 pb-2 px-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{community.name}</h3>
        </div>
        <p className="text-slate-500 text-sm line-clamp-2 mt-1 h-10">
          {community.description || "No description provided."}
        </p>
      </CardHeader>
      
      <CardContent className="px-6 py-2">
        <div className="flex items-center text-slate-500 text-sm font-medium">
          <Users className="w-4 h-4 mr-1.5 text-blue-600" />
          <span>{community.memberCount.toLocaleString()} {community.memberCount === 1 ? 'Member' : 'Members'}</span>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-4 flex gap-3">
        <Button asChild variant="default" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-none">
          <Link to={`/communities/${community.communityId}`}>View</Link>
        </Button>
        <JoinButton communityId={community.communityId} membership={isMember ? { status: "ACTIVE" } as any : null} isOwner={isOwner} className="flex-1" />
      </CardFooter>
    </Card>
  );
}
