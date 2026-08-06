import React from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, AlertCircle, FileText, Settings, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCommunity, useCommunityMembership } from "../../hooks/useCommunity";
import { CommunityHeader } from "../../components/CommunityHeader";
import { useAuth } from "@/context/AuthContext";

export default function CommunityDetails() {
  const { id } = useParams<{ id: string }>();
  const communityId = parseInt(id || "0", 10);
  const { user } = useAuth();
  
  const { data: community, isLoading, isError, refetch } = useCommunity(communityId);
  const { data: membership } = useCommunityMembership(communityId);
  
  const isMember = membership?.status === "ACTIVE";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError || !community) {
    return (
      <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Community Not Found</h2>
        <p className="text-slate-400 mb-6">The community you're looking for doesn't exist or you don't have access.</p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => refetch()} variant="outline" className="border-slate-700">Try Again</Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800 shadow-lg">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-xl text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Recent Decisions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <p className="text-slate-400">No decisions have been posted in this community yet.</p>
                {isMember && (
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                    Create a Decision
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 shadow-lg">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-xl text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  Community Info
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-slate-300">
                {community.description || "A place to collaborate and make decisions together."}
              </p>
              
              <Button asChild variant="outline" className="w-full border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
                <Link to={`/communities/${communityId}/members`}>
                  View All Members
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
