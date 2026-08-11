import React from 'react';
import { useAuditLogs } from '../hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

export function AuditLogsPage() {
  const { data, isLoading, error } = useAuditLogs(0, 100);

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading audit logs...</div>;
  if (error) return <div className="py-4 text-destructive">Failed to load audit logs.</div>;

  const logs = data?.content || [];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Audit Logs</h1>
        <p className="text-muted-foreground">Track important actions performed on the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Chronological record of system events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative border-l border-muted ml-4 space-y-8 py-4">
            {logs.length === 0 ? (
              <p className="text-muted-foreground pl-6">No audit logs found.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="relative pl-8">
                  <span className="absolute -left-2.5 top-1 h-5 w-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </span>
                  
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                    <span className="font-semibold text-foreground">
                      {log.actor ? log.actor.fullName : 'System'}
                    </span>
                    <span className="text-muted-foreground">
                      {log.action}
                    </span>
                    <span className="font-medium">
                      {log.resourceType} #{log.resourceId}
                    </span>
                  </div>
                  
                  {log.details && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md mt-2 inline-block">
                      {log.details}
                    </p>
                  )}
                  
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    {log.ipAddress && <span className="ml-2">• IP: {log.ipAddress}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
