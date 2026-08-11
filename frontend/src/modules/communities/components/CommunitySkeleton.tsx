import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function CommunityCardSkeleton() {
  return (
    <Card className="flex flex-col h-full bg-slate-900 border-slate-800 overflow-hidden">
      <Skeleton className="h-32 w-full bg-slate-800" />
      
      <CardHeader className="pt-4 pb-2 px-5 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-3 bg-slate-800" />
        <Skeleton className="h-4 w-full mb-1 bg-slate-800" />
        <Skeleton className="h-4 w-2/3 bg-slate-800" />
      </CardHeader>
      
      <CardContent className="px-5 py-2">
        <Skeleton className="h-4 w-1/3 bg-slate-800" />
      </CardContent>
      
      <CardFooter className="px-5 pb-5 pt-3 flex gap-3">
        <Skeleton className="h-10 flex-1 bg-slate-800" />
        <Skeleton className="h-10 w-24 bg-slate-800" />
      </CardFooter>
    </Card>
  );
}

export function CommunityListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <CommunityCardSkeleton key={i} />
      ))}
    </div>
  );
}
