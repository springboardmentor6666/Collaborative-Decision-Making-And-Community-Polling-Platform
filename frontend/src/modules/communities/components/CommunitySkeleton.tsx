import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function CommunityCardSkeleton() {
  return (
    <Card className="flex flex-col h-full bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
      <Skeleton className="h-32 w-full bg-slate-100" />
      
      <CardHeader className="pt-6 pb-2 px-6 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-3 bg-slate-200" />
        <Skeleton className="h-4 w-full mb-1 bg-slate-200" />
        <Skeleton className="h-4 w-2/3 bg-slate-200" />
      </CardHeader>
      
      <CardContent className="px-6 py-2">
        <Skeleton className="h-4 w-1/3 bg-slate-200" />
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-4 flex gap-3">
        <Skeleton className="h-10 flex-1 bg-slate-200" />
        <Skeleton className="h-10 flex-1 bg-slate-200" />
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
