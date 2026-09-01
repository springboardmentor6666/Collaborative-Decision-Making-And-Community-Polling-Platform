import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  ArrowRight, 
  Vote, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Search, 
  X, 
  ExternalLink, 
  RotateCcw, 
  Star, 
  Lock, 
  Sparkles, 
  Edit3,
  Calendar,
  Filter,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyVotes } from '../../hooks/useMyVotes';
import { format, formatDistanceToNow } from 'date-fns';
import { VoteResponse } from '../../types/vote';

type StatusFilter = 'ALL' | 'ACTIVE' | 'CLOSED';
type TypeFilter = 'ALL' | 'SINGLE' | 'MULTIPLE' | 'RATING';

export default function MyVotes() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching
  } = useMyVotes(30);

  // Flatten all pages into an array of votes
  const allVotes = useMemo(() => {
    return data?.pages.flatMap(page => page.content) || [];
  }, [data]);

  // Compute metrics
  const stats = useMemo(() => {
    const total = allVotes.length;
    const active = allVotes.filter(v => (v.decisionStatus || '').toUpperCase() === 'ACTIVE').length;
    const closed = allVotes.filter(v => (v.decisionStatus || '').toUpperCase() === 'CLOSED' || (v.decisionStatus || '').toUpperCase() === 'ARCHIVED').length;
    const rating = allVotes.filter(v => (v.voteType || '').toUpperCase() === 'RATING').length;
    return { total, active, closed, rating };
  }, [allVotes]);

  // Filtered votes
  const filteredVotes = useMemo(() => {
    return allVotes.filter(vote => {
      // Status filter
      if (statusFilter === 'ACTIVE' && (vote.decisionStatus || '').toUpperCase() !== 'ACTIVE') return false;
      if (statusFilter === 'CLOSED' && (vote.decisionStatus || '').toUpperCase() !== 'CLOSED' && (vote.decisionStatus || '').toUpperCase() !== 'ARCHIVED') return false;

      // Type filter
      if (typeFilter !== 'ALL' && (vote.voteType || '').toUpperCase() !== typeFilter) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = (vote.decisionTitle || '').toLowerCase().includes(query);
        const matchesSelections = vote.selections?.some(s => 
          (s.optionTitle || '').toLowerCase().includes(query)
        );
        return matchesTitle || matchesSelections;
      }

      return true;
    });
  }, [allVotes, statusFilter, typeFilter, searchQuery]);

  const formatVoteDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        formatted: format(d, 'MMM d, yyyy • h:mm a'),
        relative: formatDistanceToNow(d, { addSuffix: true })
      };
    } catch {
      return { formatted: dateStr, relative: '' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Card */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
              My Votes & History
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Review all your cast votes, rating scores, and decision board participation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold gap-1.5 h-9"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 h-9 shadow-xs"
          >
            <Link to="/decisions">
              <span>Browse Active Decisions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div 
          onClick={() => { setStatusFilter('ALL'); setTypeFilter('ALL'); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ALL' && typeFilter === 'ALL'
              ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Votes Cast</span>
            <Vote className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('ACTIVE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ACTIVE'
              ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">Active Polls</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.active}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('CLOSED')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'CLOSED'
              ? 'bg-slate-100 border-slate-300 ring-1 ring-slate-400' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Closed Polls</span>
            <Lock className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.closed}</p>
        </div>

        <div 
          onClick={() => setTypeFilter('RATING')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            typeFilter === 'RATING'
              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Rating Scale Votes</span>
            <Star className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{stats.rating}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status and Type Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg">
            {[
              { key: 'ALL', label: 'All Votes' },
              { key: 'ACTIVE', label: 'Active Polls' },
              { key: 'CLOSED', label: 'Closed' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key as StatusFilter)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  statusFilter === key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg">
            {[
              { key: 'ALL', label: 'All Types' },
              { key: 'SINGLE', label: 'Single Choice' },
              { key: 'MULTIPLE', label: 'Multiple Choice' },
              { key: 'RATING', label: 'Rating' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key as TypeFilter)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  typeFilter === key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by poll or option title..."
            className="pl-9 pr-8 h-9 text-xs bg-slate-50 border-slate-200 focus:bg-white"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Votes List Content */}
      <div className="bg-white p-5 sm:p-7 md:p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[420px]">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-5 rounded-xl border border-slate-200 space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-48 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
                <Skeleton className="h-4 w-32 rounded" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-36 rounded-lg" />
                  <Skeleton className="h-8 w-28 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
              <Vote className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1.5">
              {searchQuery 
                ? 'No matching votes found' 
                : allVotes.length === 0
                  ? 'No votes cast yet'
                  : 'No votes match your selected filters'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              {searchQuery 
                ? `No vote history matched "${searchQuery}". Try searching with a different term or reset filters.` 
                : allVotes.length === 0
                  ? 'You have not participated in any decision polls yet. Browse open community decisions to cast your first vote!'
                  : 'Try changing the status or type filter to view other voting activities.'}
            </p>

            {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setTypeFilter('ALL');
                }}
                className="text-xs font-semibold"
              >
                Reset All Filters
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/decisions')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 px-6 h-10 shadow-sm"
              >
                <span>Browse Active Decisions</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span>Showing {filteredVotes.length} {filteredVotes.length === 1 ? 'vote record' : 'vote records'}</span>
              <span>Sorted by latest cast</span>
            </div>

            <div className="space-y-4">
              {filteredVotes.map((vote: VoteResponse) => {
                const { formatted, relative } = formatVoteDate(vote.createdAt);
                const isActive = (vote.decisionStatus || '').toUpperCase() === 'ACTIVE';
                const isClosed = (vote.decisionStatus || '').toUpperCase() === 'CLOSED' || (vote.decisionStatus || '').toUpperCase() === 'ARCHIVED';
                const isRating = (vote.voteType || '').toUpperCase() === 'RATING';

                return (
                  <div
                    key={vote.voteId}
                    className={`p-5 rounded-xl border transition-all ${
                      isActive 
                        ? 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-sm'
                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Title, Status Badge, Vote Type Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Badge */}
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                            isActive 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isActive ? 'Active Poll' : 'Concluded Poll'}
                        </Badge>

                        {/* Vote Type Badge */}
                        {vote.voteType && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold bg-slate-50 text-slate-600 border-slate-200"
                          >
                            {vote.voteType.toLowerCase()} choice
                          </Badge>
                        )}
                      </div>

                      {/* Cast Date */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span title={formatted}>{relative || formatted}</span>
                      </div>
                    </div>

                    {/* Decision Board Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-snug">
                      {vote.decisionId ? (
                        <Link 
                          to={`/decisions/${vote.decisionId}`}
                          className="hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 group"
                        >
                          <span>{vote.decisionTitle || 'Decision Board'}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                        </Link>
                      ) : (
                        <span>{vote.decisionTitle || 'Decision Board'}</span>
                      )}
                    </h3>

                    {/* User's Selections Box */}
                    <div className="mt-3.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Your Selected Choice{vote.selections && vote.selections.length > 1 ? 's' : ''}:</span>
                      </p>

                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {vote.selections && vote.selections.length > 0 ? (
                          vote.selections.map((sel, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs text-xs font-semibold text-[#0F172A]"
                            >
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              <span>{sel.optionTitle || `Option #${sel.optionId}`}</span>

                              {sel.rating !== undefined && sel.rating !== null && (
                                <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold px-1.5 py-0 rounded flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  <span>{sel.rating}/10</span>
                                </Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No option details recorded</span>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100 text-xs">
                      <div className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Recorded on {formatted}</span>
                      </div>

                      {vote.decisionId ? (
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {isActive ? (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold h-8 gap-1.5"
                            >
                              <Link to={`/decisions/${vote.decisionId}`}>
                                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Change / Update Vote</span>
                              </Link>
                            </Button>
                          ) : (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold h-8 gap-1.5"
                            >
                              <Link to={`/decisions/${vote.decisionId}`}>
                                <Layers className="w-3.5 h-3.5 text-slate-600" />
                                <span>View Final Results</span>
                              </Link>
                            </Button>
                          )}

                          <Button
                            asChild
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8 gap-1 shadow-xs"
                          >
                            <Link to={`/decisions/${vote.decisionId}`}>
                              <span>Open Board</span>
                              <ArrowRight className="w-3 h-3 ml-0.5" />
                            </Link>
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination / Load More */}
            {hasNextPage && (
              <div className="pt-6 flex justify-center">
                <Button
                  variant="outline"
                  className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-7 h-10 shadow-xs"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading older votes...' : 'Load More Historical Votes'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
