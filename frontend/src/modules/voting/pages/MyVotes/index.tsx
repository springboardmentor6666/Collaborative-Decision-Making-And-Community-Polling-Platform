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
      <div className="bg-card p-6 sm:p-7 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              My Votes & History
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
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
            className="border-border hover:bg-muted text-foreground text-xs font-semibold gap-1.5 h-9"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold gap-1.5 h-9 shadow-xs"
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
              ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/40' 
              : 'bg-card border-border hover:border-border/80 hover:bg-muted/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Votes Cast</span>
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Vote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">{stats.total}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('ACTIVE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ACTIVE'
              ? 'bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/40' 
              : 'bg-card border-border hover:border-border/80 hover:bg-muted/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Active Polls</span>
            <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{stats.active}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('CLOSED')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'CLOSED'
              ? 'bg-muted border-foreground/30 ring-1 ring-foreground/20' 
              : 'bg-card border-border hover:border-border/80 hover:bg-muted/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Closed Polls</span>
            <div className="p-1 rounded-md bg-muted text-muted-foreground">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">{stats.closed}</p>
        </div>

        <div 
          onClick={() => setTypeFilter('RATING')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            typeFilter === 'RATING'
              ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/40' 
              : 'bg-card border-border hover:border-border/80 hover:bg-muted/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Rating Votes</span>
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{stats.rating}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-3 sm:p-4 rounded-xl border border-border shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status and Type Pills */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-lg border border-border/50">
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
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border mx-0.5 hidden sm:block"></div>

          <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-lg border border-border/50">
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
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by poll or option title..."
            className="pl-9 pr-8 h-9 text-xs bg-background border-border text-foreground placeholder:text-muted-foreground focus:bg-background"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Votes List Content */}
      <div className="bg-card p-5 sm:p-7 md:p-8 rounded-2xl border border-border shadow-xs min-h-[420px]">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-5 rounded-xl border border-border space-y-3 animate-pulse bg-muted/30">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-48 rounded bg-muted" />
                  <Skeleton className="h-5 w-20 rounded bg-muted" />
                </div>
                <Skeleton className="h-4 w-32 rounded bg-muted" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-36 rounded-lg bg-muted" />
                  <Skeleton className="h-8 w-28 rounded-lg bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <Vote className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1.5">
              {searchQuery 
                ? 'No matching votes found' 
                : allVotes.length === 0
                  ? 'No votes cast yet'
                  : 'No votes match your selected filters'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
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
                className="text-xs font-semibold border-border hover:bg-muted text-foreground"
              >
                Reset All Filters
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/decisions')}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold gap-1.5 px-6 h-10 shadow-xs"
              >
                <span>Browse Active Decisions</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
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
                    className={`p-5 sm:p-6 rounded-xl border transition-all duration-200 ${
                      isActive 
                        ? 'bg-card border-border hover:border-blue-500/50 hover:shadow-md'
                        : 'bg-card/70 border-border/80 hover:border-border hover:bg-card'
                    }`}
                  >
                    {/* Top Row: Status Badge, Vote Type Badge, Cast Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Badge */}
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1.5 ${
                            isActive 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                              : 'bg-muted text-muted-foreground border border-border'
                          }`}
                        >
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                          <span>{isActive ? 'Active Poll' : 'Concluded Poll'}</span>
                        </Badge>

                        {/* Vote Type Badge */}
                        {vote.voteType && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold bg-background/80 text-muted-foreground border-border"
                          >
                            {vote.voteType.toLowerCase()} choice
                          </Badge>
                        )}
                      </div>

                      {/* Cast Date */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span title={formatted}>{relative || formatted}</span>
                      </div>
                    </div>

                    {/* Decision Board Title */}
                    <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                      {vote.decisionId ? (
                        <Link 
                          to={`/decisions/${vote.decisionId}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1.5 group"
                        >
                          <span>{vote.decisionTitle || 'Decision Board'}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
                        </Link>
                      ) : (
                        <span>{vote.decisionTitle || 'Decision Board'}</span>
                      )}
                    </h3>

                    {/* User's Selections Box */}
                    <div className="mt-3.5 p-3.5 sm:p-4 rounded-xl bg-muted/40 dark:bg-zinc-950/60 border border-border/80 space-y-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Your Selected Choice{vote.selections && vote.selections.length > 1 ? 's' : ''}:</span>
                      </p>

                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {vote.selections && vote.selections.length > 0 ? (
                          vote.selections.map((sel, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-2 bg-card px-3.5 py-2 rounded-lg border border-border shadow-xs text-xs font-semibold text-foreground"
                            >
                              <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></div>
                              <span>{sel.optionTitle || `Option #${sel.optionId}`}</span>

                              {sel.rating !== undefined && sel.rating !== null && (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-1">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  <span>{sel.rating}/10</span>
                                </Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No option details recorded</span>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-border text-xs">
                      <div className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Recorded on {formatted}</span>
                      </div>

                      {vote.decisionId ? (
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {isActive ? (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="border-border bg-card hover:bg-muted text-foreground text-xs font-semibold h-8 gap-1.5"
                            >
                              <Link to={`/decisions/${vote.decisionId}`}>
                                <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Change / Update Vote</span>
                              </Link>
                            </Button>
                          ) : (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="border-border bg-card hover:bg-muted text-foreground text-xs font-semibold h-8 gap-1.5"
                            >
                              <Link to={`/decisions/${vote.decisionId}`}>
                                <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>View Final Results</span>
                              </Link>
                            </Button>
                          )}

                          <Button
                            asChild
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-8 gap-1 shadow-xs"
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
                  className="border-border bg-card hover:bg-muted text-foreground text-xs font-bold px-7 h-10 shadow-xs"
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
