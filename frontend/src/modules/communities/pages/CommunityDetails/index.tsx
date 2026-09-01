import React from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, AlertCircle, FileText, Settings, Users, ArrowRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommunity, useCommunityMembership } from "../../hooks/useCommunity";
import { CommunityHeader } from "../../components/CommunityHeader";
import { useAuth } from "@/context/AuthContext";
import { useDecisions } from "@/modules/decisions/hooks/useDecisions";
import { DecisionCard } from "@/modules/decisions/components/DecisionCard";
import { ElectionsList } from "@/modules/elections/components/ElectionsList";

export default function CommunityDetails() {
  const { id } = useParams<{ id: string }>();
  const communityId = parseInt(id || "0", 10);
  const { user } = useAuth();
  
  const { data: community, isLoading, isError, refetch } = useCommunity(communityId);
  const { data: membership } = useCommunityMembership(communityId);
  const { data: decisionsData, isLoading: isLoadingDecisions } = useDecisions({ communityId });
  
  const isMember = membership?.status === "ACTIVE";

  if (isLoading || isLoadingDecisions) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError || !community) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-3xl border border-[#E2E8F0]">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Community Not Found</h2>
        <p className="text-[#64748B] mb-6">The community you're looking for doesn't exist or you don't have access.</p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => refetch()} variant="outline" className="border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-slate-100">Try Again</Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/communities">Browse Communities</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <CommunityHeader community={community} membership={membership || null} />

      <Tabs defaultValue="decisions" className="w-full">
        <TabsList className="mb-6 bg-white border border-[#E2E8F0] p-1 h-auto">
          <TabsTrigger value="decisions" className="data-[state=active]:bg-slate-100 data-[state=active]:shadow-none px-6 py-2.5">
            <FileText className="w-4 h-4 mr-2" />
            Decisions
          </TabsTrigger>
          <TabsTrigger value="elections" className="data-[state=active]:bg-slate-100 data-[state=active]:shadow-none px-6 py-2.5">
            <Award className="w-4 h-4 mr-2 text-blue-600" />
            Voting Arena
          </TabsTrigger>
        </TabsList>

        <TabsContent value="decisions" className="mt-0">
          <Card className="bg-white border-[#E2E8F0] shadow-sm">
            <CardHeader className="border-b border-[#E2E8F0] pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-[#0F172A] flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Recent Decisions
              </CardTitle>
              {isMember && (
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link to="/decisions/new">Create Decision</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {!decisionsData?.content || decisionsData.content.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[#64748B]">
                    {community.visibility === "PRIVATE" && !isMember
                      ? "Join the community to see the posts"
                      : "No decisions have been posted in this community yet."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col space-y-6">
                  {decisionsData.content.map((decision: any) => (
                    <DecisionCard 
                      key={decision.decisionId} 
                      decision={decision} 
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elections" className="mt-0">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Voting Arenas</h2>
            {membership?.memberRole === "MODERATOR" || membership?.memberRole === "OWNER" ? (
              <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link to={`/communities/${communityId}/admin`}>
                  Manage Voting Arenas
                </Link>
              </Button>
            ) : null}
          </div>
          <ElectionsList communityId={communityId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
