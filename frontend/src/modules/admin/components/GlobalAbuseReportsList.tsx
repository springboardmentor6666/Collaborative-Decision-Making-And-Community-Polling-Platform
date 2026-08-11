import React from 'react';
import { useGlobalReports, useResolveReport } from '../../decisions/hooks/useAbuseReport';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Trash2, CheckCircle2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export function GlobalAbuseReportsList() {
  const { data, isLoading, error } = useGlobalReports('PENDING');
  const resolveMutation = useResolveReport();

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

  const handleResolve = async (reportId: number, deleteDecision: boolean) => {
    const action = deleteDecision ? 'delete this decision globally' : 'dismiss this report';
    if (window.confirm(`Are you sure you want to ${action}?`)) {
      try {
        await resolveMutation.mutateAsync({ reportId, deleteDecision });
        toast.success(deleteDecision ? 'Decision deleted and report resolved' : 'Report dismissed');
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
        <CardDescription>Platform-wide overview of reported decisions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.reportId} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg bg-red-500/5 gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                    {report.reason}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Reported on {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  {report.communityName && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md ml-auto">
                      Community: {report.communityName}
                    </span>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold">
                    <Link to={`/decisions/${report.decisionId}`} className="hover:underline">
                      {report.decisionTitle}
                    </Link>
                  </h4>
                  {report.description && (
                    <p className="text-sm text-muted-foreground mt-1 border-l-2 border-red-200 pl-2">
                      "{report.description}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <span>Reported by:</span>
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={report.reportedBy.profileImage} />
                    <AvatarFallback>{report.reportedBy.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{report.reportedBy.username}</span>
                </div>
              </div>

              <div className="flex md:flex-col gap-2 shrink-0 justify-center">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleResolve(report.reportId, true)}
                  disabled={resolveMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Decision
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleResolve(report.reportId, false)}
                  disabled={resolveMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                  Dismiss Report
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
