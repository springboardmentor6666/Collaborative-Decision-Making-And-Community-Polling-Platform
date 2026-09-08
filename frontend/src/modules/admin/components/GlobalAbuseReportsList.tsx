import React from 'react';
import { useGlobalReports, useResolveReport } from '../../decisions/hooks/useAbuseReport';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Trash2, CheckCircle2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfirm } from '@/context/ConfirmDialogContext';

export function GlobalAbuseReportsList() {
  const { data, isLoading, error } = useGlobalReports('PENDING');
  const resolveMutation = useResolveReport();
  const { confirm } = useConfirm();

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading global abuse reports...</div>;
  if (error) return <div className="py-4 text-destructive">Failed to load global abuse reports.</div>;

  const reports = data?.content || [];

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground flex flex-col items-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500/50 mb-4" />
          <p>No pending abuse reports platform-wide.</p>
        </CardContent>
      </Card>
    );
  }

  const handleResolve = async (report: any, deleteTarget: boolean) => {
    const isComment = !!report.commentId;
    const isCommunity = !report.decisionId && !report.commentId && !!report.communityId;
    const targetName = isComment ? 'comment' : (isCommunity ? 'community' : 'decision');
    const targetTitle = targetName.charAt(0).toUpperCase() + targetName.slice(1);

    const confirmed = await confirm(
      deleteTarget
        ? {
            title: `Delete ${targetTitle} Globally`,
            message: `Are you sure you want to permanently delete this ${targetName} across the entire platform? This action cannot be reversed.`,
            confirmText: `Delete ${targetTitle}`,
            cancelText: 'Cancel',
            variant: 'destructive',
            icon: 'trash',
            badgeText: 'Global Administration',
          }
        : {
            title: 'Dismiss Abuse Report',
            message: `Are you sure you want to dismiss this report? The reported ${targetName} will remain active.`,
            confirmText: 'Dismiss Report',
            cancelText: 'Cancel',
            variant: 'warning',
            icon: 'check',
            badgeText: 'Report Resolution',
          }
    );

    if (confirmed) {
      try {
        await resolveMutation.mutateAsync({ reportId: report.reportId, deleteDecision: deleteTarget });
        toast.success(deleteTarget ? `${targetTitle} deleted and report resolved` : 'Report dismissed');
      } catch {
        toast.error('Failed to resolve report');
      }
    }
  };

  return (
    <Card className="border-red-500/20">
      <CardHeader>
        <CardTitle className="text-red-500 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Global Pending Reports
        </CardTitle>
        <CardDescription>Platform-wide overview of reported communities, decisions, and discussion comments.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => {
            const isComment = !!report.commentId;
            const isCommunity = !report.decisionId && !report.commentId && !!report.communityId;

            return (
              <div key={report.reportId} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg bg-red-500/5 gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                      {report.reason}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      isComment ? 'bg-purple-100 text-purple-800' : isCommunity ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isComment ? 'Comment Report' : isCommunity ? 'Community Report' : 'Decision Report'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Reported on {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    {report.communityName && !isCommunity && (
                      <span className="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md ml-auto">
                        Community: {report.communityName}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    {isCommunity ? (
                      <h4 className="font-semibold text-lg">
                        <Link to={`/communities/${report.communityId}`} className="hover:underline text-blue-600">
                          {report.communityName || `Community #${report.communityId}`}
                        </Link>
                      </h4>
                    ) : (
                      <h4 className="font-semibold">
                        <Link to={`/decisions/${report.decisionId}`} className="hover:underline text-blue-600">
                          {report.decisionTitle || `Decision #${report.decisionId}`}
                        </Link>
                      </h4>
                    )}

                    {report.commentMessage && (
                      <div className="mt-1.5 p-2 bg-white/80 border border-red-200 rounded text-sm text-slate-800">
                        <span className="text-xs font-semibold text-red-600 block mb-0.5">Reported Comment Text:</span>
                        "{report.commentMessage}"
                      </div>
                    )}
                    {report.description && (
                      <p className="text-sm text-muted-foreground mt-1 border-l-2 border-red-200 pl-2">
                        <span className="font-medium text-slate-700">Reporter Note:</span> "{report.description}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <span>Reported by:</span>
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={report.reportedBy?.profileImage} />
                      <AvatarFallback>{report.reportedBy?.username?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span>{report.reportedBy?.fullName || report.reportedBy?.username}</span>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 shrink-0 justify-center">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleResolve(report, true)}
                    disabled={resolveMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isComment ? 'Delete Comment' : isCommunity ? 'Delete Community' : 'Delete Decision'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResolve(report, false)}
                    disabled={resolveMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                    Dismiss Report
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
