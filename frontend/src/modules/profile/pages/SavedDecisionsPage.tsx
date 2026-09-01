import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Bookmark, 
  Search, 
  X, 
  AlertCircle, 
  Compass, 
  SlidersHorizontal,
  BookmarkCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSavedDecisions } from "@/modules/decisions/hooks/useDecisions";
import { DecisionCard } from "@/modules/decisions/components/DecisionCard";
import { DecisionFeedSkeleton } from "@/modules/decisions/components/DecisionSkeleton";
import { DecisionStatus } from "@/modules/decisions/types/decision";

export function SavedDecisionsPage() {
  const { data, isLoading, error, refetch } = useSavedDecisions({ page: 0, size: 50 });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const allSavedDecisions = useMemo(() => {
    return data?.content || [];
  }, [data]);

  const filteredDecisions = useMemo(() => {
    return allSavedDecisions.filter((decision: any) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = decision.title?.toLowerCase().includes(query);
        const matchesDescription = decision.description?.toLowerCase().includes(query);
        const matchesAuthor = decision.createdBy?.fullName?.toLowerCase().includes(query) ||
                              decision.createdBy?.username?.toLowerCase().includes(query);
        const matchesCommunity = decision.community?.name?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription && !matchesAuthor && !matchesCommunity) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "ALL") {
        if (decision.status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [allSavedDecisions, searchQuery, statusFilter]);

  const totalCount = allSavedDecisions.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
            <Bookmark className="w-6 h-6 fill-blue-600/20" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">Saved Decisions</h1>
              {totalCount > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/80">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-slate-500 mt-0.5">
              Decisions and polls you have bookmarked for easy access and participation.
            </p>
          </div>
        </div>

        <Button asChild variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 font-medium">
          <Link to="/decisions">
            <Compass className="w-4 h-4 mr-2 text-blue-600" />
            Explore Decisions
          </Link>
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search saved decisions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 bg-slate-50 border-slate-200 focus:bg-white text-sm h-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-400 font-medium mr-1 hidden md:inline">Status:</span>
            {[
              { label: "All", value: "ALL" },
              { label: "Active", value: "ACTIVE" },
              { label: "Closed", value: "CLOSED" },
              { label: "Archived", value: "ARCHIVED" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                  statusFilter === tab.value
                    ? "bg-[#0F172A] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 bg-slate-50 border border-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DecisionFeedSkeleton />
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-xl p-10 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Failed to load saved decisions</h3>
            <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
              We encountered an issue retrieving your saved items. Please try again.
            </p>
            <Button onClick={() => refetch()} variant="outline" className="border-slate-200">
              Try Again
            </Button>
          </div>
        ) : totalCount === 0 ? (
          /* Empty State - No Saved Decisions at all */
          <div className="bg-white border border-slate-200 rounded-2xl p-12 sm:p-16 text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Bookmark className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Saved Decisions Yet</h3>
            <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
              When you bookmark decisions or polls while browsing, they will be saved here so you can easily track progress and vote before deadlines.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full sm:w-auto">
                <Link to="/decisions">
                  <Compass className="w-4 h-4 mr-2" />
                  Browse Active Decisions
                </Link>
              </Button>
            </div>
          </div>
        ) : filteredDecisions.length === 0 ? (
          /* Filter Empty State - Search returned 0 results */
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm max-w-md mx-auto">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Matching Saved Decisions</h3>
            <p className="text-slate-500 text-sm mb-6">
              No saved decisions match your current search or status filter.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="border-slate-200 text-slate-700"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          /* Decisions Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecisions.map((decision: any) => (
              <DecisionCard 
                key={decision.decisionId} 
                decision={decision} 
                isSaved={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
