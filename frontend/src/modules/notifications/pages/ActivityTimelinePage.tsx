import React, { useState, useMemo } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useMyVotes } from '@/modules/voting/hooks/useMyVotes';
import { useDecisions } from '@/modules/decisions/hooks/useDecisions';
import { useAuth } from '@/context/AuthContext';
import { notificationApi } from '../api/notificationApi';
import { format, isToday, isYesterday } from 'date-fns';
import { 
  MessageSquare, 
  ThumbsUp, 
  Info, 
  UserPlus, 
  Lock, 
  Activity, 
  Clock, 
  Search, 
  Filter, 
  ArrowUpRight, 
  CheckCheck, 
  Vote,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  FilePlus2,
  Users,
  Layers,
  X
} from 'lucide-react';
import { NotificationListSkeleton } from '../components/NotificationSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

type ActivityFilter = 'ALL' | 'COMMENT' | 'VOTE' | 'MY_VOTE' | 'DECISION' | 'COMMUNITY';

interface UnifiedActivityItem {
  id: string;
  type: 'COMMENT' | 'VOTE' | 'MY_VOTE' | 'DECISION_CREATED' | 'DECISION_CLOSED' | 'INVITE' | 'SYSTEM';
  title: string;
  message: string;
  decisionId?: number;
  decisionTitle?: string;
  decisionStatus?: string;
  communityName?: string;
  optionsCount?: number;
  totalVotes?: number;
  voteType?: string;
  selections?: { optionId: number; optionTitle?: string; rating?: number }[];
  read: boolean;
  createdAt: string;
  isUserCastVote?: boolean;
  isUserCreatedDecision?: boolean;
}

export default function ActivityTimelinePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<ActivityFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // Real-time notifications
  const { 
    data: notifData, 
    fetchNextPage: fetchNextNotifs, 
    hasNextPage: hasNextNotifs, 
    isFetchingNextPage: isFetchingNotifs, 
    isLoading: isLoadingNotifs 
  } = useNotifications(40);

  // User's own cast votes
  const { 
    data: myVotesData, 
    fetchNextPage: fetchNextVotes, 
    hasNextPage: hasNextVotes, 
    isFetchingNextPage: isFetchingVotes, 
    isLoading: isLoadingVotes 
  } = useMyVotes(40);

  // Decisions created by the user
  const { 
    data: myDecisionsData, 
    isLoading: isLoadingMyDecisions 
  } = useDecisions({
    createdById: user?.userId,
    size: 50,
  });

  const notifications = useMemo(() => {
    return notifData?.pages.flatMap(page => page.content) || [];
  }, [notifData]);

  const myVotes = useMemo(() => {
    return myVotesData?.pages.flatMap(page => page.content) || [];
  }, [myVotesData]);

  const myDecisions = useMemo(() => {
    return myDecisionsData?.content || [];
  }, [myDecisionsData]);

  // Merge notifications, cast votes, and created decisions into a unified activity timeline
  const allActivities = useMemo(() => {
    const notifItems: UnifiedActivityItem[] = notifications.map(n => ({
      id: `notif_${n.notificationId}`,
      type: n.type as any,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      isUserCastVote: false,
    }));

    const voteItems: UnifiedActivityItem[] = myVotes.map(v => {
      const selectionsText = v.selections && v.selections.length > 0
        ? v.selections.map(s => s.optionTitle ? `${s.optionTitle}${s.rating ? ` (${s.rating}/10)` : ''}` : `Option #${s.optionId}${s.rating ? ` (${s.rating}/10)` : ''}`).join(', ')
        : 'Cast vote';

      return {
        id: `my_vote_${v.voteId}`,
        type: 'MY_VOTE',
        title: `You voted on "${v.decisionTitle || 'Decision Board'}"`,
        message: `Your selection: ${selectionsText}`,
        decisionId: v.decisionId,
        decisionTitle: v.decisionTitle,
        decisionStatus: v.decisionStatus,
        selections: v.selections,
        read: true,
        createdAt: v.createdAt,
        isUserCastVote: true,
      };
    });

    const decisionItems: UnifiedActivityItem[] = myDecisions.map(d => ({
      id: `my_decision_${d.decisionId}`,
      type: 'DECISION_CREATED',
      title: `You created decision "${d.title}"`,
      message: d.description || `Poll with ${d.options?.length || 0} options (${d.voteType.toLowerCase()} choice)`,
      decisionId: d.decisionId,
      decisionTitle: d.title,
      decisionStatus: d.status,
      communityName: d.community?.name,
      optionsCount: d.options?.length || 0,
      totalVotes: d.totalVotes || 0,
      voteType: d.voteType,
      read: true,
      createdAt: d.createdAt,
      isUserCreatedDecision: true,
    }));

    return [...notifItems, ...voteItems, ...decisionItems].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications, myVotes, myDecisions]);

  // Activity counts
  const stats = useMemo(() => {
    const total = allActivities.length;
    const discussions = allActivities.filter(n => n.type === 'COMMENT').length;
    const myVotesCount = allActivities.filter(n => n.type === 'MY_VOTE').length;
    const totalVotes = allActivities.filter(n => n.type === 'VOTE' || n.type === 'MY_VOTE').length;
    const decisions = allActivities.filter(n => n.type === 'DECISION_CREATED' || n.type === 'DECISION_CLOSED' || n.title.toLowerCase().includes('decision')).length;
    return { total, discussions, myVotesCount, totalVotes, decisions };
  }, [allActivities]);

  // Filtered timeline activities
  const filteredActivities = useMemo(() => {
    return allActivities.filter(item => {
      // Category filter
      if (selectedFilter === 'COMMENT' && item.type !== 'COMMENT') return false;
      if (selectedFilter === 'VOTE' && item.type !== 'VOTE' && item.type !== 'MY_VOTE') return false;
      if (selectedFilter === 'MY_VOTE' && item.type !== 'MY_VOTE') return false;
      if (selectedFilter === 'DECISION' && item.type !== 'DECISION_CREATED' && item.type !== 'DECISION_CLOSED' && !item.title.toLowerCase().includes('decision')) return false;
      if (selectedFilter === 'COMMUNITY' && item.type !== 'INVITE' && item.type !== 'SYSTEM') return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesMessage = item.message?.toLowerCase().includes(query);
        const matchesDecision = item.decisionTitle?.toLowerCase().includes(query);
        const matchesCommunity = item.communityName?.toLowerCase().includes(query);
        return matchesTitle || matchesMessage || matchesDecision || matchesCommunity;
      }

      return true;
    });
  }, [allActivities, selectedFilter, searchQuery]);

  // Group activities by human-readable date
  const groupedActivity = useMemo(() => {
    return filteredActivities.reduce((acc, item) => {
      const date = new Date(item.createdAt);
      let dateKey = format(date, 'MMMM d, yyyy');
      if (isToday(date)) dateKey = 'Today';
      else if (isYesterday(date)) dateKey = 'Yesterday';

      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item);
      return acc;
    }, {} as Record<string, typeof allActivities>);
  }, [filteredActivities]);

  const handleMarkAllRead = async () => {
    try {
      setIsMarkingRead(true);
      await notificationApi.markAllAsRead();
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications as read');
    } finally {
      setIsMarkingRead(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'COMMENT': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'MY_VOTE': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'VOTE': return <Vote className="w-4 h-4 text-emerald-600" />;
      case 'DECISION_CREATED': return <Layers className="w-4 h-4 text-amber-600" />;
      case 'INVITE': return <UserPlus className="w-4 h-4 text-purple-600" />;
      case 'DECISION_CLOSED': return <Lock className="w-4 h-4 text-slate-600" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'COMMENT': return 'bg-blue-50 border-blue-200 text-blue-600';
      case 'MY_VOTE': return 'bg-emerald-50 border-emerald-300 text-emerald-600';
      case 'VOTE': return 'bg-emerald-50 border-emerald-200 text-emerald-600';
      case 'DECISION_CREATED': return 'bg-amber-50 border-amber-300 text-amber-600';
      case 'INVITE': return 'bg-purple-50 border-purple-200 text-purple-600';
      case 'DECISION_CLOSED': return 'bg-slate-100 border-slate-300 text-slate-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  const getTypeLabel = (item: UnifiedActivityItem) => {
    if (item.type === 'DECISION_CREATED') return 'Decision Created';
    if (item.type === 'MY_VOTE') return 'My Vote Cast';
    if (item.type === 'COMMENT') return 'Discussion';
    if (item.type === 'VOTE') return 'Community Vote';
    if (item.type === 'INVITE') return 'Community Invite';
    if (item.type === 'DECISION_CLOSED') return 'Decision Closed';
    return 'Update';
  };

  // Helper to extract decision title / context
  const extractDecisionContext = (item: UnifiedActivityItem) => {
    if (item.decisionTitle) return item.decisionTitle;
    const title = item.title || '';
    const message = item.message || '';

    if (title.toLowerCase().startsWith('discussion on ')) {
      return title.substring('discussion on '.length);
    }
    if (title.toLowerCase().startsWith('new discussion on ')) {
      return title.substring('new discussion on '.length);
    }
    if (title.toLowerCase().startsWith('reply on ')) {
      return title.substring('reply on '.length);
    }
    if (title.toLowerCase().startsWith('new vote on ')) {
      return title.substring('new vote on '.length);
    }
    if (title.toLowerCase().startsWith('you voted on "')) {
      return title.replace(/^You voted on "/i, '').replace(/"$/, '');
    }
    if (title.toLowerCase().startsWith('you created decision "')) {
      return title.replace(/^You created decision "/i, '').replace(/"$/, '');
    }
    if (item.type === 'DECISION_CLOSED' || title.toLowerCase().includes('closed')) {
      const match = message.match(/'([^']+)'/) || message.match(/"([^"]+)"/);
      if (match) return match[1];
    }
    return null;
  };

  // Resolve target decision ID from context or ID
  const resolveDecisionId = (item: UnifiedActivityItem): number | undefined => {
    if (item.decisionId) return item.decisionId;
    const context = extractDecisionContext(item);
    if (context) {
      const matched = myDecisions.find(d => d.title?.trim().toLowerCase() === context.trim().toLowerCase());
      if (matched) return matched.decisionId;
    }
    return undefined;
  };

  const isLoading = isLoadingNotifs || isLoadingVotes || isLoadingMyDecisions;
  const hasNextPage = hasNextNotifs || hasNextVotes;
  const isFetchingNextPage = isFetchingNotifs || isFetchingVotes;

  const handleLoadMore = () => {
    if (hasNextNotifs) fetchNextNotifs();
    if (hasNextVotes) fetchNextVotes();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
              Activity & Discussion Timeline
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Keep track of discussions, community votes, decisions, and milestones in one place
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllRead}
            disabled={isMarkingRead}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold gap-1.5 h-9 shrink-0"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div 
          onClick={() => setSelectedFilter('ALL')} 
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedFilter === 'ALL' 
              ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">All Events</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
        </div>

        <div 
          onClick={() => setSelectedFilter('COMMENT')} 
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedFilter === 'COMMENT' 
              ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">Discussions</span>
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.discussions}</p>
        </div>

        <div 
          onClick={() => setSelectedFilter('MY_VOTE')} 
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedFilter === 'MY_VOTE' || selectedFilter === 'VOTE'
              ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Votes ({stats.myVotesCount} Mine)</span>
            <Vote className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.totalVotes}</p>
        </div>

        <div 
          onClick={() => setSelectedFilter('DECISION')} 
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedFilter === 'DECISION'
              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Decisions</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{stats.decisions}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { key: 'ALL', label: 'All', icon: Activity },
            { key: 'COMMENT', label: 'Discussions', icon: MessageSquare },
            { key: 'VOTE', label: 'All Votes', icon: Vote },
            { key: 'MY_VOTE', label: 'My Votes', icon: CheckCircle2 },
            { key: 'DECISION', label: 'Decisions', icon: Layers },
            { key: 'COMMUNITY', label: 'Community', icon: UserPlus },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedFilter(key as ActivityFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                selectedFilter === key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search votes, discussions, decisions..."
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

      {/* Main Activity Timeline Container */}
      <div className="bg-white p-5 sm:p-7 md:p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[420px]">
        {isLoading ? (
          <NotificationListSkeleton count={5} />
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5 border border-blue-100">
              {selectedFilter === 'COMMENT' ? (
                <MessageSquare className="w-7 h-7" />
              ) : selectedFilter === 'MY_VOTE' || selectedFilter === 'VOTE' ? (
                <Vote className="w-7 h-7" />
              ) : selectedFilter === 'DECISION' ? (
                <Layers className="w-7 h-7 text-amber-600" />
              ) : (
                <Clock className="w-7 h-7" />
              )}
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {searchQuery 
                ? 'No matching activities found' 
                : selectedFilter === 'MY_VOTE'
                  ? 'No votes cast yet'
                  : selectedFilter === 'COMMENT' 
                    ? 'No discussions yet' 
                    : 'No activity recorded'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">
              {searchQuery 
                ? `No activity matched "${searchQuery}". Try a different keyword or reset filters.` 
                : selectedFilter === 'MY_VOTE'
                  ? 'You have not cast any votes yet. Explore active decision boards to vote and track your choices here.'
                  : 'Engage with decision boards and community threads to see real-time updates, discussions, and votes here.'}
            </p>
            {searchQuery ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold"
              >
                Clear Search
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/decisions')} 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5"
              >
                <span>Browse Decisions</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedActivity).map(([dateLabel, items]) => (
              <div key={dateLabel} className="relative">
                {/* Date Sticky Header */}
                <div className="sticky top-16 z-20 mb-6 flex items-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80 shadow-xs backdrop-blur-md">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {dateLabel}
                  </span>
                  <div className="flex-1 h-px bg-slate-100 ml-3"></div>
                </div>

                {/* Timeline Track & Items */}
                <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 ml-4 sm:ml-5 space-y-6">
                  {items.map((item) => {
                    const decisionContext = extractDecisionContext(item);
                    const isComment = item.type === 'COMMENT';
                    const isVote = item.type === 'VOTE' || item.type === 'MY_VOTE';
                    const isMyVote = item.type === 'MY_VOTE';
                    const isCreatedDecision = item.type === 'DECISION_CREATED';
                    const isClosedDecision = item.type === 'DECISION_CLOSED';
                    const targetDecisionId = resolveDecisionId(item);

                    return (
                      <div key={item.id} className="relative group">
                        {/* Timeline Node Point */}
                        <div className={`absolute -left-[35px] sm:-left-[43px] top-3.5 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-sm z-10 transition-transform group-hover:scale-110 ${getIconBg(item.type)}`}>
                          {getIcon(item.type)}
                        </div>

                        {/* Activity Card */}
                        <div className={`p-4 sm:p-5 rounded-xl border transition-all ${
                          isCreatedDecision
                            ? 'bg-amber-50/20 border-amber-200/90 hover:border-amber-300 hover:shadow-sm'
                            : isMyVote
                              ? 'bg-emerald-50/20 border-emerald-200 hover:border-emerald-300 hover:shadow-sm'
                              : isClosedDecision
                                ? 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                : !item.read 
                                  ? 'bg-blue-50/30 border-blue-200 shadow-xs' 
                                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
                        }`}>
                          {/* Card Top Row */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  isCreatedDecision ? 'bg-amber-100 text-amber-800' :
                                  isMyVote ? 'bg-emerald-100 text-emerald-800' :
                                  isComment ? 'bg-blue-100 text-blue-800' :
                                  isVote ? 'bg-emerald-100 text-emerald-800' :
                                  isClosedDecision ? 'bg-slate-200 text-slate-800' :
                                  'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {getTypeLabel(item)}
                              </Badge>

                              {item.communityName && (
                                <Badge variant="outline" className="text-[10px] font-semibold bg-slate-50 text-slate-600 border-slate-200 flex items-center gap-1">
                                  <Users className="w-2.5 h-2.5 text-slate-500" />
                                  {item.communityName}
                                </Badge>
                              )}

                              {!item.read && !isMyVote && !isCreatedDecision && (
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                              )}
                            </div>

                            <span className="text-[11px] font-medium text-slate-400">
                              {format(new Date(item.createdAt), 'h:mm a')}
                            </span>
                          </div>

                          {/* Activity Title */}
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            {isClosedDecision && decisionContext ? `Poll Closed: "${decisionContext}"` : item.title}
                          </h4>

                          {/* Decision Context Link Badge */}
                          {decisionContext && !isCreatedDecision && (
                            <div className="mt-1.5 mb-2">
                              <Link
                                to={targetDecisionId ? `/decisions/${targetDecisionId}` : "/decisions"}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline bg-blue-50/60 px-2.5 py-1 rounded-md border border-blue-100 transition-colors"
                              >
                                <Sparkles className="w-3 h-3 text-blue-500" />
                                <span>Decision: {decisionContext}</span>
                                <ExternalLink className="w-3 h-3 ml-0.5 text-blue-400" />
                              </Link>
                            </div>
                          )}

                          {/* Event Details */}
                          {isCreatedDecision ? (
                            <div className="mt-2.5 p-3 rounded-lg bg-white border border-amber-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>{item.message}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.decisionStatus && (
                                  <Badge variant="outline" className="text-[10px] capitalize bg-slate-50 text-slate-600 border-slate-200">
                                    {item.decisionStatus.toLowerCase()}
                                  </Badge>
                                )}
                                <span className="text-xs font-semibold text-slate-500">
                                  {item.totalVotes || 0} {(item.totalVotes || 0) === 1 ? 'vote' : 'votes'}
                                </span>
                              </div>
                            </div>
                          ) : isClosedDecision ? (
                            <div className="mt-2.5 p-3 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                                <span>{item.message}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700 border-slate-300 font-bold self-start sm:self-auto">
                                Closed
                              </Badge>
                            </div>
                          ) : isComment ? (
                            <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal relative">
                              <p className="italic">
                                {item.message}
                              </p>
                            </div>
                          ) : isMyVote ? (
                            <div className="mt-2.5 p-3 rounded-lg bg-white border border-emerald-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{item.message}</span>
                              </div>
                              {item.decisionStatus && (
                                <Badge variant="outline" className="text-[10px] capitalize bg-slate-50 text-slate-600 border-slate-200">
                                  {item.decisionStatus.toLowerCase()}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
                              {item.message}
                            </p>
                          )}

                          {/* Card Footer Quick Actions */}
                          <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-slate-100 text-xs">
                            <div className="text-slate-400 text-[11px]">
                              {format(new Date(item.createdAt), 'MMM d, yyyy')}
                            </div>

                            <Link
                              to={targetDecisionId ? `/decisions/${targetDecisionId}` : "/decisions"}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                            >
                              <span>
                                {isCreatedDecision
                                  ? 'Manage Decision'
                                  : isMyVote 
                                    ? 'View / Update Vote' 
                                    : isClosedDecision
                                      ? 'View Final Results'
                                      : isComment 
                                        ? 'View Discussion' 
                                        : 'View Decision'}
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Load More Trigger */}
            {hasNextPage && (
              <div className="pt-6 flex justify-center">
                <Button 
                  variant="outline" 
                  className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-6 h-10 shadow-xs"
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading older activity...' : 'Load More Activity'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}




