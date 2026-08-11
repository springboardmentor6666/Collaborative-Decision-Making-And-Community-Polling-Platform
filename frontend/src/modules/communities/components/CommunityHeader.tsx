import React from "react";
import { Link } from "react-router-dom";
import { Users, Globe, Lock, Settings, Calendar, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommunityResponse, CommunityMemberResponse } from "../types/community";
import { JoinButton } from "./JoinButton";
import { useAuth } from "@/context/AuthContext";

interface CommunityHeaderProps {
  community: CommunityResponse;
  membership: CommunityMemberResponse | null;
}

export function CommunityHeader({ community, membership }: CommunityHeaderProps) {
  const { user } = useAuth();
  
  const isOwner = user?.userId === community.owner.userId;
  const isAdmin = user?.role === "ROLE_ADMIN";
  const canEdit = isOwner || isAdmin;

  const createdDate = new Date(community.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl mb-6">
      {/* Banner */}
      <div 
        className="h-48 md:h-64 bg-slate-800 relative w-full"
        style={{
          backgroundImage: community.image ? `url(${community.image})` : 'linear-gradient(to right, #1e293b, #0f172a)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
      </div>
      
      {/* Content */}
      <div className="px-6 md:px-10 pb-8 pt-6 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 -mt-16 md:-mt-20 mb-4 z-10 relative">
          <div className="bg-slate-950 p-2 rounded-2xl inline-block border border-slate-800 shadow-lg">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-800 rounded-xl flex items-center justify-center text-4xl font-bold text-blue-500 overflow-hidden">
              {community.image ? (
                <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                community.name.substring(0, 2).toUpperCase()
              )}
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {canEdit && (
              <Button asChild variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-white backdrop-blur-sm">
                <Link to={`/communities/${community.communityId}/edit`}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            )}
            
            <JoinButton 
              communityId={community.communityId} 
              membership={membership} 
              communityVisibility={community.visibility as any}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-semibold" 
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{community.name}</h1>
            <Badge variant={community.visibility === "PUBLIC" ? "secondary" : "outline"} className="bg-slate-800 text-xs border-slate-700 text-white">
              {community.visibility === "PUBLIC" ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
              {community.visibility}
            </Badge>
          </div>
          
          <p className="text-slate-300 text-lg max-w-3xl mb-6">
            {community.description || "Welcome to our community!"}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 md:gap-8 text-sm text-slate-400 font-medium">
              <div className="flex items-center hover:text-white transition-colors cursor-pointer" onClick={() => window.location.href = `/communities/${community.communityId}/members`}>
                <Users className="w-4 h-4 mr-2 text-blue-500" />
                <span>{community.memberCount.toLocaleString()} {community.memberCount === 1 ? 'Member' : 'Members'}</span>
              </div>
              
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-500" />
                <span>Managed by <span className="text-white font-semibold">{community.owner.username}</span></span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                <span>Created on {createdDate}</span>
              </div>
            </div>
            
            <Button asChild variant="outline" className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 shrink-0">
              <Link to={`/communities/${community.communityId}/members`}>
                View All Members
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
