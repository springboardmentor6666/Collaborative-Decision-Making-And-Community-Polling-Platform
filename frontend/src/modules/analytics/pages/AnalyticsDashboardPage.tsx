import React, { useState } from 'react';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { AnalyticsCards } from '../components/AnalyticsCards';
import { TimelineChart } from '../components/TimelineChart';
import { AnalyticsCardsSkeleton, ChartSkeleton } from '../components/AnalyticsSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { AlertCircle } from 'lucide-react';

export function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState('all');
  const { data, isLoading, error } = useDashboardAnalytics(timeRange);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Platform Analytics</h1>
        <AnalyticsCardsSkeleton />
        <div className="mt-6">
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
              Failed to load analytics dashboard data. Please ensure you have Admin privileges.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">Comprehensive overview of platform activity and growth.</p>
        </div>
        <div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past 7 Days</SelectItem>
              <SelectItem value="month">Past 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnalyticsCards
        users={data.totalUsers}
        communities={data.totalCommunities}
        decisions={data.totalDecisions}
        votes={data.totalVotes}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-6">
        <Card className="col-span-4 lg:col-span-5">
          <CardHeader>
            <CardTitle>Daily Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineChart data={data.dailyActivity} />
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Polls</p>
              <p className="text-3xl font-bold">{data.activePolls}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Global Participation Rate</p>
              <p className="text-3xl font-bold">{data.participationRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
