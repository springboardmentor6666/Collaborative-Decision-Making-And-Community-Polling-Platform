import React from 'react';
import { Users, FileText, CheckSquare, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function KPICard({ title, value, icon, trend, trendUp }: KPICardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsCards({
  users,
  communities,
  decisions,
  votes,
}: {
  users: number;
  communities: number;
  decisions: number;
  votes: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <KPICard
        title="Total Members"
        value={users.toLocaleString()}
        icon={<Users />}
        trend="+12% from last month"
        trendUp={true}
      />
      <KPICard
        title="Active Communities"
        value={communities.toLocaleString()}
        icon={<Activity />}
        trend="+4 new this week"
        trendUp={true}
      />
      <KPICard
        title="Decisions Created"
        value={decisions.toLocaleString()}
        icon={<FileText />}
        trend="+18% from last month"
        trendUp={true}
      />
      <KPICard
        title="Total Votes Cast"
        value={votes.toLocaleString()}
        icon={<CheckSquare />}
        trend="+24% from last month"
        trendUp={true}
      />
    </div>
  );
}
