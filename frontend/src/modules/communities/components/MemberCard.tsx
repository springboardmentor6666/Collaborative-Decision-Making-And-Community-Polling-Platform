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
    <div className="flex items-center justify-between p-4 bg-white border border-[#E2E8F0] rounded-xl hover:border-slate-300 transition-colors shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border border-[#E2E8F0]">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
          <AvatarFallback className="bg-slate-100 text-[#0F172A] font-medium">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-[#0F172A] text-lg">
              {user.fullName} 
              {isSelf && <span className="text-[#64748B] text-sm ml-2 font-normal">(You)</span>}
            </h4>
            {role === "OWNER" && (
              <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200 shadow-none">
                <Shield className="w-3 h-3 mr-1" /> Owner
              </Badge>
            )}
            {role === "MODERATOR" && (
              <Badge className="bg-blue-50 text-[#2563EB] hover:bg-blue-100 border-blue-200 shadow-none">
                <Settings className="w-3 h-3 mr-1" /> Moderator
              </Badge>
            )}
          </div>
          <p className="text-[#64748B] text-sm">@{user.username} • Joined {formattedDate}</p>
        </div>
      </div>

      {canManage && !isSelf && role !== "OWNER" && status === "ACTIVE" && (
        <div className="flex items-center gap-2">
          {role === "MEMBER" ? (
            <Button variant="outline" size="sm" onClick={handlePromote} className="border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-slate-50">
              Promote
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleDemote} className="border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-slate-50">
              Demote
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleRemove} className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700">
            <UserMinus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {canManage && status === "PENDING" && (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
            Approve
          </Button>
          <Button variant="outline" size="sm" onClick={handleReject} className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700">
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
