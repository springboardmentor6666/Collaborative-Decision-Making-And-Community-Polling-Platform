import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Globe, Lock, Settings, Calendar, Shield, ArrowRight, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommunityResponse, CommunityMemberResponse } from "../types/community";
import { JoinButton } from "./JoinButton";
import { useAuth } from "@/context/AuthContext";
import { useCommunityMutations } from "../hooks/useCommunityMutations";

interface CommunityHeaderProps {
  community: CommunityResponse;
  membership: CommunityMemberResponse | null;
}

export function CommunityHeader({ community, membership }: CommunityHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { deleteCommunity } = useCommunityMutations();
  
  const isOwner = user?.userId === community.owner.userId;
  const isAdmin = user?.role === "ROLE_ADMIN";
  const canEdit = isOwner || isAdmin;

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this community? This action cannot be undone.")) {
      deleteCommunity.mutate(community.communityId, {
        onSuccess: () => navigate("/communities")
      });
    }
  };

  const createdDate = new Date(community.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-sm mb-6">
      {/* Banner */}
      <div 
        className="h-48 md:h-64 bg-slate-100 relative w-full"
        style={{
          backgroundImage: community.image ? `url(${community.image})` : 'linear-gradient(to right, #f1f5f9, #e2e8f0)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90" />
      </div>
      
      {/* Content */}
      <div className="px-6 md:px-10 pb-8 pt-6 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 -mt-16 md:-mt-20 mb-4 z-10 relative">
          <div className="bg-white p-2 rounded-2xl inline-block border border-[#E2E8F0] shadow-sm">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-100 rounded-xl flex items-center justify-center text-4xl font-bold text-[#2563EB] overflow-hidden">
              {community.image ? (
                <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                community.name.substring(0, 2).toUpperCase()
              )}
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {(isOwner || isAdmin || membership?.memberRole === "MODERATOR") && (
              <Button asChild variant="outline" className="border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#0F172A]">
                <Link to={`/communities/${community.communityId}/admin`}>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            
            {canEdit && (
              <Button asChild variant="outline" className="border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#0F172A]">
                <Link to={`/communities/${community.communityId}/edit`}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            )}
            
            {isOwner ? (
              <Button 
                variant="destructive" 
                className="flex-1 md:flex-none"
                onClick={handleDelete}
                disabled={deleteCommunity.isPending}
              >
                {deleteCommunity.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete Community
              </Button>
            ) : (
              <JoinButton 
                communityId={community.communityId} 
                membership={membership} 
                communityVisibility={community.visibility as any}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-semibold" 
              />
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight">{community.name}</h1>
            <Badge 
              variant="outline" 
              className={community.visibility === "PUBLIC" 
                ? "bg-[#EFF6FF] text-[#1D4ED8] border-none" 
                : "bg-[#F1F5F9] text-[#334155] border-none"}
            >
              {community.visibility === "PUBLIC" ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
              {community.visibility}
            </Badge>
          </div>
          
          <p className="text-[#64748B] text-lg max-w-3xl mb-6">
            {community.description || "Welcome to our community!"}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 md:gap-8 text-sm text-[#64748B] font-medium">
              <div className="flex items-center hover:text-[#0F172A] transition-colors cursor-pointer" onClick={() => window.location.href = `/communities/${community.communityId}/members`}>
                <Users className="w-4 h-4 mr-2 text-[#2563EB]" />
                <span>{community.memberCount.toLocaleString()} {community.memberCount === 1 ? 'Member' : 'Members'}</span>
              </div>
              
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-[#2563EB]" />
                <span>Managed by <span className="text-[#0F172A] font-semibold">{community.owner.username}</span></span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-[#2563EB]" />
                <span>Created on {createdDate}</span>
              </div>
            </div>
            
            <Button asChild variant="outline" className="border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-slate-50 shrink-0">
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
