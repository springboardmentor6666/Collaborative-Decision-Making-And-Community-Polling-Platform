import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function DecisionCardSkeleton() {
  return (
    <Card className="flex flex-col bg-slate-900 border-slate-800 shadow-sm">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full bg-slate-800" />
            <Skeleton className="h-4 w-24 bg-slate-800" />
            <Skeleton className="h-4 w-20 bg-slate-800 rounded-full hidden sm:block" />
          </div>
          <Skeleton className="h-5 w-16 bg-slate-800 rounded-full" />
        </div>
        
        <Skeleton className="h-7 w-3/4 mb-2 bg-slate-800" />
        <Skeleton className="h-4 w-full mb-1 bg-slate-800" />
        <Skeleton className="h-4 w-2/3 bg-slate-800" />
      </CardHeader>

      <CardContent className="px-5 py-3">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20 bg-slate-800" />
          <Skeleton className="h-4 w-20 bg-slate-800" />
          <Skeleton className="h-4 w-24 bg-slate-800" />
        </div>
      </CardContent>

      <CardFooter className="px-5 py-3 border-t border-slate-800 flex justify-between items-center bg-[#111C33]">
        <Skeleton className="h-4 w-24 bg-slate-800" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 bg-slate-800 rounded-md" />
          <Skeleton className="h-8 w-8 bg-slate-800 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function DecisionFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <DecisionCardSkeleton key={i} />
      ))}
    </div>
  );
}
