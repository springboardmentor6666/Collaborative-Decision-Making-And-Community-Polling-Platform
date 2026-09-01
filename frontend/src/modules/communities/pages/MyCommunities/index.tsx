import React from "react";
import { Link } from "react-router-dom";
import { Plus, Users, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyCommunities } from "../../hooks/useCommunities";
import { CommunityCard } from "../../components/CommunityCard";
import { CommunityListSkeleton } from "../../components/CommunitySkeleton";

export default function MyCommunities() {
  const { data: myData, isLoading: isLoadingMy, isError: isErrorMy, error: errorMy, refetch: refetchMy } = useMyCommunities({ size: 100 });

  const myCommunities = myData?.content || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Communities</h1>
          <p className="text-slate-500 mt-1">Communities you manage or have joined.</p>
        </div>
        
        <div className="flex gap-3">
          <Button asChild variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
            <Link to="/communities">
              <Globe className="w-4 h-4 mr-2" />
              Discover All
            </Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
            <Link to="/communities/new">
              <Plus className="w-5 h-5 mr-2" />
              Create Community
            </Link>
          </Button>
        </div>
      </div>

      {isLoadingMy ? (
        <CommunityListSkeleton />
      ) : isErrorMy ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-red-500 mb-6 font-medium">Failed to load your communities.</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => refetchMy()} variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
              Try Again
            </Button>
          </div>
        </div>
      ) : myCommunities.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myCommunities.map((community) => (
              <CommunityCard 
                key={community.communityId} 
                community={community} 
                isMember={true}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-gradient-to-b from-blue-50/50 to-white rounded-3xl border border-blue-100 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100/80 rounded-2xl flex items-center justify-center mb-4 text-blue-600 shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No Joined Communities Yet</h3>
          <p className="text-slate-600 mb-6 max-w-lg text-base">
            You haven't joined any communities yet. Check out the active public communities below or start your own!
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
              <Link to="/communities">Discover Communities</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
              <Link to="/communities/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Community
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
