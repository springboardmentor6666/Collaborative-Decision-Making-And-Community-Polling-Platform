import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDecisionAnalytics } from '../hooks/useDecisionAnalytics';
import { useDownloadPdfReport, useDownloadExcelReport } from '../hooks/useReports';
import { VotingChart } from '../components/VotingChart';
import { ParticipationChart } from '../components/ParticipationChart';
import { ChartSkeleton } from '../components/AnalyticsSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { AlertCircle, Download, FileSpreadsheet, FileText, Trophy, Users } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

export function DecisionAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const decisionId = parseInt(id || '0', 10);
  const { data, isLoading, error } = useDecisionAnalytics(decisionId);
  const pdfMutation = useDownloadPdfReport();
  const excelMutation = useDownloadExcelReport();
  const handleDownloadPdf = async () => {
    try {
      await pdfMutation.mutateAsync(decisionId);
      toast.success('PDF report downloaded successfully');
    } catch (err) {
      toast.error('Failed to download PDF report');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await excelMutation.mutateAsync(decisionId);
      toast.success('Excel report downloaded successfully');
    } catch (err) {
      toast.error('Failed to download Excel report');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Decision Analytics</h1>
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p className="text-sm">
              Failed to load decision analytics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Decision Insights</h1>
          <p className="text-muted-foreground">Deep dive into voting patterns and results.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPdf} disabled={pdfMutation.isPending}>
            <FileText className="mr-2 h-4 w-4" />
            {pdfMutation.isPending ? 'Generating...' : 'Export PDF'}
          </Button>
          <Button variant="outline" onClick={handleDownloadExcel} disabled={excelMutation.isPending}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {excelMutation.isPending ? 'Generating...' : 'Export Excel'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Votes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalVotes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Participation Rate</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.participationRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leading Option</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold line-clamp-1">{data.winningOption}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Voting Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <VotingChart data={data.optionsData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Participation Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ParticipationChart participated={data.participationRate} total={100} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
