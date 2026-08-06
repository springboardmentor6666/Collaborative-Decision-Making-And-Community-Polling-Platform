import React from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analyticsApi";
import { decisionApi } from "@/api/decisionApi";
import { useAuth } from "@/context/AuthContext";
import { DashboardStats } from "./components/DashboardStats";
import { RecentDecisions } from "./components/RecentDecisions";
import { TrendingPolls } from "./components/TrendingPolls";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPage() {
  const { user } = useAuth();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats', user?.userId],
    queryFn: () => analyticsApi.getUserAnalytics(user?.userId as number).then(res => res.data),
    enabled: !!user?.userId
  });

  const { data: recentDecisionsData, isLoading: recentLoading } = useQuery({
    queryKey: ['recentDecisions'],
    queryFn: () => decisionApi.getLatestDecisions(0, 5).then(res => res.data)
  });

  const { data: trendingDecisionsData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trendingDecisions'],
    queryFn: () => decisionApi.getTrendingDecisions(0, 5).then(res => res.data)
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.fullName || "User"} 👋
          </p>
        </div>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <DashboardStats stats={statsData?.data} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {recentLoading ? (
            <Skeleton className="h-[400px] w-full rounded-xl" />
          ) : (
            <RecentDecisions decisions={recentDecisionsData?.data?.content || []} />
          )}
        </div>
        <div className="lg:col-span-1">
          {trendingLoading ? (
            <Skeleton className="h-[400px] w-full rounded-xl" />
          ) : (
            <TrendingPolls decisions={trendingDecisionsData?.data?.content || []} />
          )}
        </div>
      </div>
    </div>
  );
}
