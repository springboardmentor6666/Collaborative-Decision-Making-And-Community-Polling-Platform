import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Globe, Lock, Settings, Calendar, Shield, ArrowRight, Trash2, Loader2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommunityResponse, CommunityMemberResponse } from "../types/community";
import { JoinButton } from "./JoinButton";
import { useAuth } from "@/context/AuthContext";
import { useCommunityMutations } from "../hooks/useCommunityMutations";
import { ReportCommunityModal } from "./ReportCommunityModal";
import { useConfirm } from "@/context/ConfirmDialogContext";
import { getImageUrl } from "@/utils";

interface CommunityHeaderProps {
  community: CommunityResponse;
  membership: CommunityMemberResponse | null;
}

export function CommunityHeader({ community, membership }: CommunityHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { deleteCommunity } = useCommunityMutations();
  const { confirm } = useConfirm();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const isOwner = user?.userId === community.owner.userId;
  const isAdmin = user?.role === "ROLE_ADMIN";
  const canEdit = isOwner || isAdmin;
  const bannerUrl = getImageUrl(community.image);
  const profileAvatarUrl = getImageUrl(community.profileImage || community.image);

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: `Delete Community`,
      message: `Are you sure you want to permanently delete "${community.name}"? This action cannot be undone and will delete all associated decisions, polls, elections, and member discussions.`,
      confirmText: 'Delete Community',
      cancelText: 'Keep Community',
      variant: 'destructive',
      icon: 'trash',
      badgeText: 'Irreversible Community Deletion',
      highlightContent: `Community: "${community.name}" (${community.memberCount || 0} members)`,
    });

    if (confirmed) {
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
    <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm mb-6">
      {/* Cover Banner */}
      <div 
        className="h-48 md:h-64 bg-muted/40 relative w-full overflow-hidden"
        style={{
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'linear-gradient(to right, #1e293b, #0f172a)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="px-6 md:px-10 pb-8 pt-6 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 -mt-16 md:-mt-20 mb-4 z-10 relative">
          {/* Profile Logo Avatar */}
          <div className="bg-card p-2 rounded-2xl inline-block border border-border shadow-md">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-xl flex items-center justify-center text-4xl font-bold text-blue-600 dark:text-blue-400 overflow-hidden shadow-inner">
              {profileAvatarUrl ? (
                <img src={profileAvatarUrl} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                community.name.substring(0, 2).toUpperCase()
              )}
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {(isOwner || isAdmin || membership?.memberRole === "MODERATOR") && (
              <Button asChild variant="outline" className="border-border bg-card hover:bg-muted text-foreground">
                <Link to={`/communities/${community.communityId}/admin`}>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            
            {canEdit && (
              <Button asChild variant="outline" className="border-border bg-card hover:bg-muted text-foreground">
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
              <>
                <JoinButton 
                  communityId={community.communityId} 
                  membership={membership} 
                  communityVisibility={community.visibility as any}
                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-semibold" 
                />
                {user && (
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <ReportCommunityModal
          communityId={community.communityId}
          communityName={community.name}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />

        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">{community.name}</h1>
            <Badge 
              variant="outline" 
              className={community.visibility === "PUBLIC" 
                ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-none" 
                : "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-none"}
            >
              {community.visibility === "PUBLIC" ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
              {community.visibility}
            </Badge>
          </div>
          
          <p className="text-muted-foreground text-lg max-w-3xl mb-6">
            {community.description || "Welcome to our community!"}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 md:gap-8 text-sm text-muted-foreground font-medium">
              <div className="flex items-center hover:text-foreground transition-colors cursor-pointer" onClick={() => navigate(`/communities/${community.communityId}/members`)}>
                <Users className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                <span>{community.memberCount.toLocaleString()} {community.memberCount === 1 ? 'Member' : 'Members'}</span>
              </div>
              
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                <span>Managed by <span className="text-foreground font-semibold">{community.owner.username}</span></span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                <span>Created on {createdDate}</span>
              </div>
            </div>
            
            <Button asChild variant="outline" className="border-border bg-card text-foreground hover:bg-muted shrink-0">
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

