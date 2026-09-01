import React, { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { ProfileCard } from '../components/ProfileCard';
import { useMyVotes } from '@/modules/voting/hooks/useMyVotes';
import { useDecisions, useSavedDecisions } from '@/modules/decisions/hooks/useDecisions';
import { 
  AlertCircle, 
  Vote, 
  Layers, 
  Bookmark, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export function ProfilePage() {
  const { data: user, isLoading, error } = useProfile();
  const [activeTab, setActiveTab] = useState<'ALL' | 'VOTES' | 'DECISIONS'>('ALL');

  // Fetch real user stats
  const { data: myVotesData, isLoading: isLoadingVotes } = useMyVotes(10);
  const { data: myDecisionsData, isLoading: isLoadingDecisions } = useDecisions({
    createdById: user?.userId,
    size: 10,
  });
  const { data: savedDecisionsData } = useSavedDecisions({ size: 1 });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm font-medium">Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="bg-destructive/15 text-destructive p-4 rounded-xl border border-destructive/20 flex gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold">Error</h3>
            <p className="text-sm">Failed to load profile. Please sign in again or refresh the page.</p>
          </div>
        </div>
      </div>
    );
  }

  const votes = myVotesData?.pages?.flatMap((p) => p.content) || [];
  const totalVotesCount = myVotesData?.pages?.[0]?.totalElements ?? votes.length;

  const decisions = myDecisionsData?.content || [];
  const totalDecisionsCount = myDecisionsData?.totalElements ?? decisions.length;

  const totalSavedCount = savedDecisionsData?.totalElements ?? 0;

  // Combine recent activity
  const recentVotes = votes.map((v) => ({
    id: `vote-${v.voteId}`,
    type: 'VOTE' as const,
    title: v.decisionTitle || 'Decision Board',
    decisionId: v.decisionId,
    decisionStatus: v.decisionStatus,
    subtitle: v.selections && v.selections.length > 0
      ? `Selected: ${v.selections.map((s) => s.optionTitle ? `${s.optionTitle}${s.rating ? ` (${s.rating}/10)` : ''}` : `Option #${s.optionId}`).join(', ')}`
      : 'Voted',
    createdAt: v.createdAt,
  }));

  const recentDecisions = decisions.map((d) => ({
    id: `decision-${d.decisionId}`,
    type: 'DECISION' as const,
    title: d.title,
    decisionId: d.decisionId,
    decisionStatus: d.status,
    subtitle: `${d.options?.length || 0} options • ${d.totalVotes || 0} ${(d.totalVotes || 0) === 1 ? 'vote' : 'votes'}`,
    createdAt: d.createdAt,
  }));

  const combinedActivities = [...recentVotes, ...recentDecisions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredActivities = combinedActivities.filter((item) => {
    if (activeTab === 'VOTES') return item.type === 'VOTE';
    if (activeTab === 'DECISIONS') return item.type === 'DECISION';
    return true;
  });

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account information, personal preferences, and track your activity.</p>
      </div>

      <ProfileCard user={user} isCurrentUser={true} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Real Dynamic Activity Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Activity Stats</span>
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Decisions Created</span>
                </div>
                <span className="text-base font-extrabold text-slate-900">
                  {isLoadingDecisions ? '...' : totalDecisionsCount}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
                    <Vote className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Votes Cast</span>
                </div>
                <span className="text-base font-extrabold text-slate-900">
                  {isLoadingVotes ? '...' : totalVotesCount}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100/80 text-purple-700 flex items-center justify-center">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Saved Bookmarks</span>
                </div>
                <span className="text-base font-extrabold text-slate-900">
                  {totalSavedCount}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link 
                to="/activity" 
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-between group"
              >
                <span>View Full Activity Timeline</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Real My Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Recent Activity</h3>
                <p className="text-xs text-slate-500">Your latest participatory votes and decision boards.</p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('VOTES')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'VOTES'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Votes ({totalVotesCount})
                </button>
                <button
                  onClick={() => setActiveTab('DECISIONS')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'DECISIONS'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Decisions ({totalDecisionsCount})
                </button>
              </div>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="py-12 text-center max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
                  <Vote className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">No activities found</h4>
                <p className="text-xs text-slate-500 mb-4">
                  {activeTab === 'VOTES'
                    ? "You haven't cast any votes yet. Vote on active decision boards to see them here."
                    : activeTab === 'DECISIONS'
                    ? "You haven't created any decision boards yet."
                    : "Engage with community decisions to build your activity history."}
                </p>
                <Button asChild size="sm" className="text-xs font-semibold bg-blue-600 hover:bg-blue-700">
                  <Link to="/decisions">Explore Decisions</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredActivities.slice(0, 6).map((item) => {
                  const isVote = item.type === 'VOTE';
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                            isVote
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}
                        >
                          {isVote ? <CheckCircle2 className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                isVote ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isVote ? 'Vote Cast' : 'Decision Created'}
                            </Badge>
                            {item.decisionStatus && (
                              <Badge variant="outline" className="text-[10px] capitalize bg-white text-slate-600">
                                {item.decisionStatus.toLowerCase()}
                              </Badge>
                            )}
                            <span className="text-[11px] text-slate-400">
                              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">{item.subtitle}</p>
                        </div>
                      </div>

                      <div className="shrink-0 self-end sm:self-center">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Link to={item.decisionId ? `/decisions/${item.decisionId}` : '/decisions'}>
                            <span>View</span>
                            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {filteredActivities.length > 6 && (
                  <div className="pt-2 text-center">
                    <Button asChild variant="outline" size="sm" className="text-xs font-bold">
                      <Link to="/activity">View All Activities ({combinedActivities.length})</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
