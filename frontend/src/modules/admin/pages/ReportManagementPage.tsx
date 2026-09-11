import React, { useState, useMemo } from 'react';
import { useGlobalReports } from '@/modules/decisions/hooks/useAbuseReport';
import { AbuseReportStatus, AbuseReportResponse } from '@/modules/decisions/api/abuseReportApi';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Users, 
  Layers, 
  Globe, 
  MessageSquare, 
  Search, 
  CheckCircle2, 
  Clock, 
  Filter, 
  RotateCw,
  FileCheck,
  Activity
} from 'lucide-react';
import { ReportCard } from '../components/ReportCard';

export function ReportManagementPage() {
  const [selectedStatus, setSelectedStatus] = useState<AbuseReportStatus | 'ALL'>('PENDING');
  const [activeTab, setActiveTab] = useState<'decisions' | 'communities' | 'comments'>('decisions');
  const [searchQuery, setSearchQuery] = useState('');

  const statusParam = selectedStatus === 'ALL' ? undefined : selectedStatus;
  const { data, isLoading, error, refetch, isRefetching } = useGlobalReports(statusParam, 0, 100);

  const reports: AbuseReportResponse[] = data?.content || [];

  // Filter into categories
  const decisionReports = useMemo(() => {
    return reports.filter(r => !!r.decisionId && !r.commentId);
  }, [reports]);

  const communityReports = useMemo(() => {
    return reports.filter(r => !r.decisionId && !r.commentId && !!r.communityId);
  }, [reports]);

  const commentReports = useMemo(() => {
    return reports.filter(r => !!r.commentId);
  }, [reports]);

  // Apply search query
  const filterBySearch = (list: AbuseReportResponse[]) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(r => {
      const matchTitle = r.decisionTitle?.toLowerCase().includes(query);
      const matchCommunity = r.communityName?.toLowerCase().includes(query);
      const matchComment = r.commentMessage?.toLowerCase().includes(query);
      const matchReporter = r.reportedBy?.username?.toLowerCase().includes(query) || r.reportedBy?.fullName?.toLowerCase().includes(query);
      const matchAuthor = r.targetAuthor?.username?.toLowerCase().includes(query) || r.targetAuthor?.fullName?.toLowerCase().includes(query);
      const matchReason = r.reason?.toLowerCase().includes(query);
      const matchDesc = r.description?.toLowerCase().includes(query);
      return matchTitle || matchCommunity || matchComment || matchReporter || matchAuthor || matchReason || matchDesc;
    });
  };

  const filteredDecisions = filterBySearch(decisionReports);
  const filteredCommunities = filterBySearch(communityReports);
  const filteredComments = filterBySearch(commentReports);

  const pendingCountTotal = reports.filter(r => r.status === 'PENDING').length;
  const pendingDecisionsCount = decisionReports.filter(r => r.status === 'PENDING').length;
  const pendingCommunitiesCount = communityReports.filter(r => r.status === 'PENDING').length;
  const pendingCommentsCount = commentReports.filter(r => r.status === 'PENDING').length;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold backdrop-blur-sm border border-purple-500/30">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            Platform Moderation Center
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Report Management</h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl">
            Review reported decisions, communities, and comments. Verify content integrity, remove violations, and manage user account standing.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button asChild variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
            <Link to="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
            <Link to="/admin/audit-logs">
              <FileCheck className="mr-2 h-4 w-4" />
              Audit Logs
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pending</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{pendingCountTotal}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires administrative review</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Decision Reports</CardTitle>
            <Layers className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{pendingDecisionsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending decision board flags</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Community Reports</CardTitle>
            <Globe className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{pendingCommunitiesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Scam / Spam / Rule violations</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Comment Reports</CardTitle>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{pendingCommentsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Harassment / Toxic remarks</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search reports by title, keyword, user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <Select 
            value={selectedStatus} 
            onValueChange={(val) => setSelectedStatus(val as AbuseReportStatus | 'ALL')}
          >
            <SelectTrigger className="w-[140px] bg-slate-50 font-medium text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="DISMISSED">Dismissed</SelectItem>
              <SelectItem value="ALL">All Reports</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="text-slate-500 hover:text-slate-900"
            title="Refresh Reports"
          >
            <RotateCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Tabs Container */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-2xl border border-slate-200/80 w-full sm:w-auto grid grid-cols-3 sm:inline-flex h-auto">
          <TabsTrigger 
            value="decisions" 
            className="rounded-xl font-bold text-xs sm:text-sm py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Decision Reports</span>
            <Badge className="bg-blue-100 text-blue-800 text-[11px] px-1.5 py-0 font-bold border-none">
              {filteredDecisions.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger 
            value="communities" 
            className="rounded-xl font-bold text-xs sm:text-sm py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span>Community Reports</span>
            <Badge className="bg-amber-100 text-amber-800 text-[11px] px-1.5 py-0 font-bold border-none">
              {filteredCommunities.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger 
            value="comments" 
            className="rounded-xl font-bold text-xs sm:text-sm py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comment Reports</span>
            <Badge className="bg-purple-100 text-purple-800 text-[11px] px-1.5 py-0 font-bold border-none">
              {filteredComments.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Decision Reports */}
        <TabsContent value="decisions" className="space-y-4 outline-none">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <RotateCw className="w-8 h-8 animate-spin text-blue-600" />
              <p>Loading reported decisions...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200">
              Failed to load decision reports. Please try again.
            </div>
          ) : filteredDecisions.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500/60 mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No Decision Reports Found</h3>
                <p className="text-sm max-w-md mt-1">
                  {searchQuery ? 'No decision reports matching your search query.' : 'There are currently no decision reports under this filter.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredDecisions.map((report) => (
                <ReportCard key={report.reportId} report={report} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Community Reports */}
        <TabsContent value="communities" className="space-y-4 outline-none">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <RotateCw className="w-8 h-8 animate-spin text-amber-600" />
              <p>Loading reported communities...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200">
              Failed to load community reports. Please try again.
            </div>
          ) : filteredCommunities.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500/60 mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No Community Reports Found</h3>
                <p className="text-sm max-w-md mt-1">
                  {searchQuery ? 'No community reports matching your search query.' : 'There are currently no community reports under this filter.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCommunities.map((report) => (
                <ReportCard key={report.reportId} report={report} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Comment Reports */}
        <TabsContent value="comments" className="space-y-4 outline-none">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <RotateCw className="w-8 h-8 animate-spin text-purple-600" />
              <p>Loading reported comments...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200">
              Failed to load comment reports. Please try again.
            </div>
          ) : filteredComments.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500/60 mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No Comment Reports Found</h3>
                <p className="text-sm max-w-md mt-1">
                  {searchQuery ? 'No comment reports matching your search query.' : 'There are currently no comment reports under this filter.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredComments.map((report) => (
                <ReportCard key={report.reportId} report={report} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
