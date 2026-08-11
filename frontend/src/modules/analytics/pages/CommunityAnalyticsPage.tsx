import React from 'react';
import { useParams } from 'react-router-dom';
import { useCommunityAnalytics } from '../hooks/useCommunityAnalytics';
import { TimelineChart } from '../components/TimelineChart';
import { ChartSkeleton } from '../components/AnalyticsSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { AlertCircle, Users, Activity } from 'lucide-react';

export function CommunityAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const communityId = parseInt(id || '0', 10);
  const { data, isLoading, error } = useCommunityAnalytics(communityId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Community Analytics</h1>
        <div className="grid gap-4 md:grid-cols-2 mb-6">
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
              Failed to load community analytics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Community Analytics</h1>
        <p className="text-muted-foreground">Insights for community #{data.communityId}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeMembers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Community Growth & Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineChart data={data.communityGrowth} />
        </CardContent>
      </Card>
    </div>
  );
}
