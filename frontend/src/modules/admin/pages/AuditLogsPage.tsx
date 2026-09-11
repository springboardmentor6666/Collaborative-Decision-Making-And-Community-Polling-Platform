import React, { useState, useMemo } from 'react';
import { useAuditLogs } from '../hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  ShieldAlert, 
  Users, 
  Search, 
  RotateCw, 
  Clock, 
  FileCheck, 
  Layers, 
  Globe, 
  UserCheck, 
  UserX, 
  LogIn, 
  Shield, 
  MessageSquare,
  Activity,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'USER' | 'MODERATION' | 'DECISION' | 'COMMUNITY' | 'AUTH'>('ALL');
  
  const { data, isLoading, error, refetch, isRefetching } = useAuditLogs(0, 100);

  const logs = data?.content || [];

  // Filter logs by category and search
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const actorName = (log.user?.fullName || log.actor?.fullName || '').toLowerCase();
      const actorUsername = (log.user?.username || log.actor?.username || '').toLowerCase();
      const action = (log.action || '').toLowerCase();
      const entityType = (log.entityType || log.resourceType || '').toLowerCase();
      const details = (log.details || '').toLowerCase();
      const ip = (log.ipAddress || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || 
        actorName.includes(query) || 
        actorUsername.includes(query) || 
        action.includes(query) || 
        entityType.includes(query) || 
        details.includes(query) || 
        ip.includes(query);

      if (!matchesSearch) return false;

      if (categoryFilter === 'ALL') return true;
      if (categoryFilter === 'USER') return action.startsWith('USER_') || entityType === 'user';
      if (categoryFilter === 'MODERATION') return action.includes('REPORT_') || action.includes('MODERAT') || entityType === 'abuse_report';
      if (categoryFilter === 'DECISION') return action.startsWith('DECISION_') || entityType === 'decision';
      if (categoryFilter === 'COMMUNITY') return action.startsWith('COMMUNITY_') || action.startsWith('MEMBER_') || entityType === 'community';
      if (categoryFilter === 'AUTH') return action.includes('LOGIN') || action.includes('REGISTER') || action.includes('AUTH');

      return true;
    });
  }, [logs, searchQuery, categoryFilter]);

  const getActionBadgeStyle = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('SUSPEND') || act.includes('REJECT') || act.includes('REMOVE')) {
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    }
    if (act.includes('RESOLVE') || act.includes('APPROVE') || act.includes('ACTIVE') || act.includes('REGISTER')) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
    if (act.includes('STATUS') || act.includes('ROLE') || act.includes('UPDATE')) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    }
    if (act.includes('CREATE') || act.includes('POST')) {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    }
    if (act.includes('REPORT')) {
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
    }
    return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
  };

  const getActionIcon = (action: string, entityType?: string) => {
    const act = action.toUpperCase();
    if (act.includes('LOGIN')) return <LogIn className="w-4 h-4 text-indigo-500" />;
    if (act.includes('USER_STATUS') || act.includes('SUSPEND')) return <UserX className="w-4 h-4 text-amber-500" />;
    if (act.includes('USER')) return <Users className="w-4 h-4 text-blue-500" />;
    if (act.includes('REPORT')) return <ShieldAlert className="w-4 h-4 text-purple-500" />;
    if (act.includes('DECISION')) return <Layers className="w-4 h-4 text-blue-500" />;
    if (act.includes('COMMUNITY') || act.includes('MEMBER')) return <Globe className="w-4 h-4 text-emerald-500" />;
    return <Activity className="w-4 h-4 text-slate-500" />;
  };

  const stats = useMemo(() => {
    const total = logs.length;
    const userActions = logs.filter(l => l.action.startsWith('USER_')).length;
    const moderationActions = logs.filter(l => l.action.includes('REPORT_')).length;
    const decisionActions = logs.filter(l => l.action.includes('DECISION_')).length;
    const communityActions = logs.filter(l => l.action.includes('COMMUNITY_') || l.action.includes('MEMBER_')).length;
    return { total, userActions, moderationActions, decisionActions, communityActions };
  }, [logs]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-6xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-indigo-900/30">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-sm border border-indigo-500/30">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            Immutable Audit Trail
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">System Audit Logs</h1>
          <p className="text-indigo-200/80 text-sm md:text-base max-w-2xl">
            Chronological, immutable record of administrative actions, moderation decisions, user updates, and security events.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button asChild variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
            <Link to="/admin">
              <ShieldAlert className="mr-2 h-4 w-4 text-purple-400" />
              Report Management
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
            <Link to="/admin/users">
              <Users className="mr-2 h-4 w-4 text-blue-400" />
              Manage Users
            </Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => refetch()} 
            disabled={isRefetching}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
          >
            <RotateCw className={`h-4 w-4 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border/60 bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Recorded Logs</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-border/60 bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Moderation Events</CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-500">{stats.moderationActions}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-border/60 bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">User & Status Actions</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-500">{stats.userActions}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-border/60 bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Content & Governance</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-500">{stats.decisionActions + stats.communityActions}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search logs by actor, action, details, IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/50">
          {(['ALL', 'USER', 'MODERATION', 'DECISION', 'COMMUNITY', 'AUTH'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                categoryFilter === cat
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat === 'ALL' ? 'All Logs' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Timeline */}
      <Card className="border border-border/60 bg-card shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Activity Ledger</CardTitle>
              <CardDescription>
                Showing {filteredLogs.length} of {logs.length} system events in reverse chronological order.
              </CardDescription>
            </div>
            {isRefetching && (
              <Badge variant="secondary" className="animate-pulse text-xs font-medium">
                Syncing logs...
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <RotateCw className="w-6 h-6 animate-spin mx-auto text-primary" />
              <p className="text-sm">Loading system audit records...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-destructive space-y-2">
              <p className="font-semibold">Failed to load system audit logs.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold">No audit logs found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {searchQuery || categoryFilter !== 'ALL'
                  ? 'No logs match the selected filter or search query. Try broadening your criteria.'
                  : 'Administrative and system actions will appear here in real-time as they occur across the platform.'}
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-border/70 ml-4 space-y-6 py-2">
              {filteredLogs.map((log) => {
                const actor = log.user || log.actor;
                const entityType = log.entityType || log.resourceType;
                const entityId = log.entityId || log.resourceId;
                const logKey = log.logId || log.id || `${log.action}-${log.createdAt}`;

                let formattedDate = 'Unknown date';
                let timeAgo = '';
                try {
                  const logDate = new Date(log.createdAt);
                  formattedDate = format(logDate, 'MMM d, yyyy • HH:mm:ss');
                  timeAgo = formatDistanceToNow(logDate, { addSuffix: true });
                } catch {
                  formattedDate = log.createdAt;
                }

                return (
                  <div key={logKey} className="relative pl-7 group">
                    {/* Timeline Node */}
                    <div className="absolute -left-[17px] top-1.5 h-8 w-8 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-xs group-hover:border-primary transition-colors">
                      {getActionIcon(log.action, entityType)}
                    </div>

                    <div className="bg-muted/20 hover:bg-muted/40 border border-border/50 rounded-2xl p-4 transition-all space-y-2.5">
                      {/* Top Row: Actor, Action Badge, Target & Timestamp */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Actor Info */}
                          {actor ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 border border-border">
                                <AvatarImage src={actor.profileImage} />
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                  {actor.fullName ? actor.fullName.substring(0, 2).toUpperCase() : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-sm text-foreground">
                                {actor.fullName || `@${actor.username}`}
                              </span>
                              {actor.role === 'ROLE_ADMIN' && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20">
                                  Admin
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                              <Shield className="w-4 h-4 text-slate-500" />
                              <span>System</span>
                            </div>
                          )}

                          {/* Action Badge */}
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-bold uppercase tracking-wider border px-2 py-0.5 ${getActionBadgeStyle(log.action)}`}
                          >
                            {log.action.replace(/_/g, ' ')}
                          </Badge>

                          {/* Target Resource Tag */}
                          {entityType && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono font-medium">
                              {entityType} {entityId ? `#${entityId}` : ''}
                            </span>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{timeAgo}</span>
                          <span className="hidden sm:inline text-muted-foreground/60">• {formattedDate}</span>
                        </div>
                      </div>

                      {/* Details Box */}
                      {log.details && (
                        <div className="text-xs bg-background/80 text-foreground/90 p-2.5 rounded-xl border border-border/60 leading-relaxed font-sans">
                          {log.details}
                        </div>
                      )}

                      {/* Footer: IP Address */}
                      {log.ipAddress && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="font-mono bg-muted/40 px-1.5 py-0.5 rounded border border-border/40">
                            IP: {log.ipAddress}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
