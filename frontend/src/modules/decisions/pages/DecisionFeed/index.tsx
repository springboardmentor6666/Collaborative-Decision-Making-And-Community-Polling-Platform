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
  const { data: allDecisions, isLoading: loadingAll } = useDecisions({
    query: searchQuery || undefined,
    status: statusFilter || undefined,
    visibility: visibilityFilter || undefined,
    voteType: voteTypeFilter || undefined,
  });
  
  const { data: trendingDecisions, isLoading: loadingTrending } = useTrendingDecisions();
  const { data: popularDecisions, isLoading: loadingPopular } = usePopularDecisions();
  const { data: latestDecisions, isLoading: loadingLatest } = useLatestDecisions();

  const renderContent = (data: any, isLoading: boolean) => {
    if (isLoading) return <DecisionFeedSkeleton />;
    
    if (!data?.content || data.content.length === 0) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Decisions Found</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            We couldn't find any decisions matching your criteria. Be the first to create one!
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/decisions/new">Create Decision</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Decision Board</h1>
          <p className="text-slate-400">Discover and participate in community decisions.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <DecisionSearch 
            onSearch={setSearchQuery} 
            className="w-full md:w-64"
          />
          {user && (
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
              <Link to="/decisions/new">
                <PlusCircle className="w-4 h-4 mr-2" />
                New Decision
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 order-2 lg:order-1 hidden md:block">
          <DecisionFilters 
            statusFilter={statusFilter}
            visibilityFilter={visibilityFilter}
            voteTypeFilter={voteTypeFilter}
            onStatusChange={setStatusFilter}
            onVisibilityChange={setVisibilityFilter}
            onVoteTypeChange={setVoteTypeFilter}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 order-1 lg:order-2">
          {searchQuery || statusFilter || visibilityFilter || voteTypeFilter ? (
            // If any filter is active, only show the "All" filtered results
            <div>
              <div className="mb-4 text-sm text-slate-400 font-medium">
                Showing results for your filters
              </div>
              {renderContent(allDecisions, loadingAll)}
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-900 border border-slate-800 p-1 mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">All</TabsTrigger>
                <TabsTrigger value="trending" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Trending</TabsTrigger>
                <TabsTrigger value="popular" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Popular</TabsTrigger>
                <TabsTrigger value="latest" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Latest</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                {renderContent(allDecisions, loadingAll)}
              </TabsContent>
              
              <TabsContent value="trending" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                {renderContent(trendingDecisions, loadingTrending)}
              </TabsContent>
              
              <TabsContent value="popular" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                {renderContent(popularDecisions, loadingPopular)}
              </TabsContent>
              
              <TabsContent value="latest" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                {renderContent(latestDecisions, loadingLatest)}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

// Add Search icon import that was missing in renderContent
import { Search } from "lucide-react";
