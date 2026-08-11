import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useDecisions } from "../../hooks/useDecisions";
import { DecisionCard } from "../../components/DecisionCard";
import { DecisionFeedSkeleton } from "../../components/DecisionSkeleton";
import { DecisionStatus, DecisionVisibility, VoteType } from "../../types/decision";
import { DecisionFilters } from "../../components/DecisionFilters";
import { DecisionSearch } from "../../components/DecisionSearch";

export default function MyDecisions() {
  const { user } = useAuth();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | "">("");
  const [visibilityFilter, setVisibilityFilter] = useState<DecisionVisibility | "">("");
  const [voteTypeFilter, setVoteTypeFilter] = useState<VoteType | "">("");

  // Get decisions created by the user
  const { data, isLoading } = useDecisions({
    createdById: user?.userId,
    query: searchQuery || undefined,
    status: statusFilter || undefined,
    visibility: visibilityFilter || undefined,
    voteType: voteTypeFilter || undefined,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Decisions</h1>
          <p className="text-slate-400">Decisions you have created.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <DecisionSearch 
            onSearch={setSearchQuery} 
            className="w-full md:w-64"
          />
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
            <Link to="/decisions/new">
              <PlusCircle className="w-4 h-4 mr-2" />
              New Decision
            </Link>
          </Button>
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
          {isLoading ? (
            <DecisionFeedSkeleton />
          ) : !data?.content || data.content.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
              <h3 className="text-xl font-bold text-white mb-2">No Decisions Found</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                {searchQuery || statusFilter || visibilityFilter || voteTypeFilter 
                  ? "You haven't created any decisions matching these filters."
                  : "You haven't created any decisions yet."}
              </p>
              {!searchQuery && !statusFilter && !visibilityFilter && !voteTypeFilter && (
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link to="/decisions/new">Create Decision</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.content.map((decision: any) => (
                <DecisionCard 
                  key={decision.decisionId} 
                  decision={decision} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
