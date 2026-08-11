import React from "react";
import { Link } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyCommunities } from "../../hooks/useCommunities";
import { CommunityCard } from "../../components/CommunityCard";
import { CommunityListSkeleton } from "../../components/CommunitySkeleton";

export default function MyCommunities() {
  const { data, isLoading, isError, refetch } = useMyCommunities({ size: 100 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Communities</h1>
          <p className="text-slate-400 mt-1">Communities you manage or have joined.</p>
        </div>
        
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20">
          <Link to="/communities/new">
            <Plus className="w-5 h-5 mr-2" />
            Create Community
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <CommunityListSkeleton />
      ) : isError ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800">
          <p className="text-red-400 mb-4">Failed to load your communities.</p>
          <Button onClick={() => refetch()} variant="outline" className="border-slate-700">Try Again</Button>
        </div>
      ) : data?.content.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Joined Communities</h3>
          <p className="text-slate-400 mb-6 max-w-md">
            You haven't joined any communities yet. Discover interesting communities to connect with others!
          </p>
          <div className="flex gap-4">
            <Button asChild variant="outline" className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
              <Link to="/communities">Discover Communities</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link to="/communities/new">Create Community</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.content.map((community) => (
            <CommunityCard 
              key={community.communityId} 
              community={community} 
              isMember={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
