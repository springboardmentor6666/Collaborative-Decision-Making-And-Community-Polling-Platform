import React from "react";
import { UserResponse } from "@/types";
import { MemberRole, MemberStatus } from "../types/community";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, Settings, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommunityMutations } from "../hooks/useCommunityMutations";

interface MemberCardProps {
  communityId: number;
  user: UserResponse;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  canManage: boolean;
  isSelf: boolean;
}

export function MemberCard({ communityId, user, role, status, joinedAt, canManage, isSelf }: MemberCardProps) {
  const { updateMemberRole, removeMember, approveRequest, rejectRequest } = useCommunityMutations();

  const handlePromote = () => updateMemberRole.mutate({ communityId, userId: user.userId, role: "MODERATOR" });
  const handleDemote = () => updateMemberRole.mutate({ communityId, userId: user.userId, role: "MEMBER" });
  const handleRemove = () => removeMember.mutate({ communityId, userId: user.userId });
  
  const handleApprove = () => approveRequest.mutate({ communityId, userId: user.userId });
  const handleReject = () => rejectRequest.mutate({ communityId, userId: user.userId });

  const formattedDate = new Date(joinedAt).toLocaleDateString();

  return (
    <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border border-slate-700">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
          <AvatarFallback className="bg-slate-800 text-white">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-lg">
              {user.fullName} 
              {isSelf && <span className="text-slate-400 text-sm ml-2 font-normal">(You)</span>}
            </h4>
            {role === "OWNER" && (
              <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">
                <Shield className="w-3 h-3 mr-1" /> Owner
              </Badge>
            )}
            {role === "MODERATOR" && (
              <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">
                <Settings className="w-3 h-3 mr-1" /> Moderator
              </Badge>
            )}
          </div>
          <p className="text-slate-400 text-sm">@{user.username} • Joined {formattedDate}</p>
        </div>
      </div>

      {canManage && !isSelf && role !== "OWNER" && status === "ACTIVE" && (
        <div className="flex items-center gap-2">
          {role === "MEMBER" ? (
            <Button variant="outline" size="sm" onClick={handlePromote} className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700">
              Promote
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleDemote} className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700">
              Demote
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleRemove} className="border-red-900/30 bg-red-900/10 text-red-500 hover:bg-red-900/30 hover:text-red-400">
            <UserMinus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {canManage && status === "PENDING" && (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white">
            Approve
          </Button>
          <Button variant="outline" size="sm" onClick={handleReject} className="border-red-900/30 bg-red-900/10 text-red-500 hover:bg-red-900/30 hover:text-red-400">
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
