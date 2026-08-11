import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommunities, useMyCommunities } from "../../hooks/useCommunities";
import { CommunityCard } from "../../components/CommunityCard";
import { CommunitySearch } from "../../components/CommunitySearch";
import { CommunityListSkeleton } from "../../components/CommunitySkeleton";
import { CommunityVisibility } from "../../types/community";

export default function CommunityList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<CommunityVisibility | undefined>(undefined);

  // We can fetch my communities to quickly know which ones we are members of
  const { data: myCommunities } = useMyCommunities({ size: 100 });
  const myCommunityIds = new Set(myCommunities?.content?.map(c => c.communityId) || []);

  const { data, isLoading, isError, refetch } = useCommunities({ 
    query: searchQuery, 
    visibility: visibilityFilter,
    size: 20 
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Discover Communities</h1>
          <p className="text-slate-400 mt-1">Find and join communities that match your interests.</p>
        </div>
        
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20">
          <Link to="/communities/new">
            <Plus className="w-5 h-5 mr-2" />
            Create Community
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <CommunitySearch initialQuery={searchQuery} onSearch={setSearchQuery} />
        
        <div className="flex space-x-2">
          <Button 
            variant={visibilityFilter === undefined ? "default" : "outline"}
            onClick={() => setVisibilityFilter(undefined)}
            className={visibilityFilter === undefined ? "bg-slate-700 hover:bg-slate-600" : "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"}
          >
            All
          </Button>
          <Button 
            variant={visibilityFilter === "PUBLIC" ? "default" : "outline"}
            onClick={() => setVisibilityFilter("PUBLIC")}
            className={visibilityFilter === "PUBLIC" ? "bg-slate-700 hover:bg-slate-600" : "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"}
          >
            Public
          </Button>
          <Button 
            variant={visibilityFilter === "PRIVATE" ? "default" : "outline"}
            onClick={() => setVisibilityFilter("PRIVATE")}
            className={visibilityFilter === "PRIVATE" ? "bg-slate-700 hover:bg-slate-600" : "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"}
          >
            Private
          </Button>
        </div>
      </div>

      {isLoading ? (
        <CommunityListSkeleton />
      ) : isError ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800">
          <p className="text-red-400 mb-4">Failed to load communities.</p>
          <Button onClick={() => refetch()} variant="outline" className="border-slate-700">Try Again</Button>
        </div>
      ) : data?.content.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Communities Found</h3>
          <p className="text-slate-400 mb-6 max-w-md">
            {searchQuery 
              ? `We couldn't find any communities matching "${searchQuery}".` 
              : "There are no communities available yet. Be the first to create one!"}
          </p>
          {!searchQuery && (
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link to="/communities/new">Create Community</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.content.map((community) => (
            <CommunityCard 
              key={community.communityId} 
              community={community} 
              isMember={myCommunityIds.has(community.communityId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
