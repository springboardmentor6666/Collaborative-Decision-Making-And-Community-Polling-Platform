import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { 
  useDecisions, 
  useTrendingDecisions, 
  usePopularDecisions, 
  useLatestDecisions 
} from "../../hooks/useDecisions";
import { DecisionCard } from "../../components/DecisionCard";
import { DecisionFeedSkeleton } from "../../components/DecisionSkeleton";
import { DecisionSearch } from "../../components/DecisionSearch";
import { DecisionFilters } from "../../components/DecisionFilters";
import { DecisionStatus, DecisionVisibility, VoteType } from "../../types/decision";

export default function DecisionFeed() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | "">("");
  const [visibilityFilter, setVisibilityFilter] = useState<DecisionVisibility | "">("");
  const [voteTypeFilter, setVoteTypeFilter] = useState<VoteType | "">("");

  // Queries
  const { data: allDecisions, isLoading: loadingAll, isError: errorAll, refetch: refetchAll } = useDecisions({
    query: searchQuery || undefined,
    status: statusFilter || undefined,
    visibility: visibilityFilter || undefined,
    voteType: voteTypeFilter || undefined,
  });
  
  const { data: trendingDecisions, isLoading: loadingTrending, isError: errorTrending, refetch: refetchTrending } = useTrendingDecisions();
  const { data: popularDecisions, isLoading: loadingPopular, isError: errorPopular, refetch: refetchPopular } = usePopularDecisions();
  const { data: latestDecisions, isLoading: loadingLatest, isError: errorLatest, refetch: refetchLatest } = useLatestDecisions();

  const renderContent = (data: any, isLoading: boolean, isError?: boolean, refetch?: () => void) => {
    if (isLoading) return <DecisionFeedSkeleton />;
    
    if (isError) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-red-500 mb-4 font-medium">Failed to load decisions.</p>
          {refetch && (
            <Button onClick={() => refetch()} variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
              Try Again
            </Button>
          )}
        </div>
      );
    }

    if (!data?.content || data.content.length === 0) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Decisions Found</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            We couldn't find any decisions matching your criteria. Be the first to create one!
          </p>
          <Button asChild className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
            <Link to="/decisions/new">Create Decision</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col space-y-6">
        {data.content.map((decision: any) => (
          <DecisionCard 
            key={decision.decisionId} 
            decision={decision} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-[#0F172A] mb-2 leading-tight">Decisions</h1>
        <p className="text-[#64748B] text-[15px]">Discover and participate in community decisions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Top Controls Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <DecisionSearch 
              onSearch={setSearchQuery} 
              className="w-full sm:w-64"
            />
            <DecisionFilters 
              statusFilter={statusFilter}
              visibilityFilter={visibilityFilter}
              voteTypeFilter={voteTypeFilter}
              onStatusChange={setStatusFilter}
              onVisibilityChange={setVisibilityFilter}
              onVoteTypeChange={setVoteTypeFilter}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {!(searchQuery || statusFilter || visibilityFilter || voteTypeFilter) && (
              <TabsList className="bg-transparent border-none p-0 gap-2">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#0F172A] data-[state=active]:text-white text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] rounded-md px-3 py-1.5 transition-colors font-medium">All</TabsTrigger>
                <TabsTrigger value="trending" className="data-[state=active]:bg-[#0F172A] data-[state=active]:text-white text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] rounded-md px-3 py-1.5 transition-colors font-medium">Trending</TabsTrigger>
                <TabsTrigger value="popular" className="data-[state=active]:bg-[#0F172A] data-[state=active]:text-white text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] rounded-md px-3 py-1.5 transition-colors font-medium">Popular</TabsTrigger>
                <TabsTrigger value="latest" className="data-[state=active]:bg-[#0F172A] data-[state=active]:text-white text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] rounded-md px-3 py-1.5 transition-colors font-medium">Latest</TabsTrigger>
              </TabsList>
            )}

            {user && (
              <Button asChild className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shrink-0 ml-2 shadow-sm rounded-[10px]">
                <Link to="/decisions/new">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Decision
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="w-full">
          {searchQuery || statusFilter || visibilityFilter || voteTypeFilter ? (
            <div>
              <div className="mb-4 text-[14px] text-slate-500 font-medium">
                Showing results for your filters
              </div>
              {renderContent(allDecisions, loadingAll, errorAll, refetchAll)}
            </div>
          ) : (
            <div className="w-full">
              <TabsContent value="all" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                {renderContent(allDecisions, loadingAll, errorAll, refetchAll)}
              </TabsContent>
              <TabsContent value="trending" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                {renderContent(trendingDecisions, loadingTrending, errorTrending, refetchTrending)}
              </TabsContent>
              <TabsContent value="popular" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                {renderContent(popularDecisions, loadingPopular, errorPopular, refetchPopular)}
              </TabsContent>
              <TabsContent value="latest" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                {renderContent(latestDecisions, loadingLatest, errorLatest, refetchLatest)}
              </TabsContent>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}

// Add Search icon import that was missing in renderContent
import { Search } from "lucide-react";
