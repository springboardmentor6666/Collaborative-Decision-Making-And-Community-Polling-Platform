import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommunity, useCommunityMembers, useCommunityRequests } from "../../hooks/useCommunity";
import { MemberCard } from "../../components/MemberCard";
import { InviteMemberModal } from "../../components/InviteMemberModal";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Members() {
  const { id } = useParams<{ id: string }>();
  const communityId = parseInt(id || "0", 10);
  const { user } = useAuth();
  
  const { data: community, isLoading: isCommunityLoading } = useCommunity(communityId);
  const { data: membersPage, isLoading: isMembersLoading } = useCommunityMembers(communityId, { size: 50 });
  const { data: requestsPage, isLoading: isRequestsLoading } = useCommunityRequests(communityId, { size: 50 });

  const isLoading = isCommunityLoading || isMembersLoading || isRequestsLoading;
  
  const canManage = user?.userId === community?.owner?.userId || user?.role === "ROLE_ADMIN";

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-700 bg-slate-800 text-slate-300 hover:text-white">
          <Link to={`/communities/${communityId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-500" />
            Members
          </h1>
          <p className="text-slate-400 mt-1">{community?.name} • {membersPage?.totalElements} members</p>
        </div>
        <div className="flex-1" />
        {canManage && <InviteMemberModal communityId={communityId} />}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <Tabs defaultValue="active" className="w-full">
          {canManage && (
            <TabsList className="mb-6 bg-slate-950 border border-slate-800">
              <TabsTrigger value="active" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">
                Active Members ({membersPage?.totalElements || 0})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">
                Pending Requests ({requestsPage?.totalElements || 0})
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="active" className="space-y-4">
            {membersPage?.content.map((member) => (
              <MemberCard
                key={member.memberId}
                communityId={communityId}
                user={member.user}
                role={member.memberRole}
                status={member.status}
                joinedAt={member.joinedAt}
                canManage={canManage}
                isSelf={user?.userId === member.user.userId}
              />
            ))}
            {membersPage?.content.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                No members found.
              </div>
            )}
          </TabsContent>

          {canManage && (
            <TabsContent value="pending" className="space-y-4">
              {requestsPage?.content.map((member) => (
                <MemberCard
                  key={member.memberId}
                  communityId={communityId}
                  user={member.user}
                  role={member.memberRole}
                  status={member.status}
                  joinedAt={member.joinedAt}
                  canManage={canManage}
                  isSelf={false}
                />
              ))}
              {requestsPage?.content.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  No pending requests.
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
