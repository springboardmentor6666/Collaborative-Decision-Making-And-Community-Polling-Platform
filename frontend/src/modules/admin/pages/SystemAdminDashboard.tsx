import React from 'react';
import { AnalyticsDashboardPage } from '@/modules/analytics/pages/AnalyticsDashboardPage';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, ShieldAlert } from 'lucide-react';
import { GlobalAbuseReportsList } from '../components/GlobalAbuseReportsList';

export function SystemAdminDashboard() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">System Administration</h1>
          <p className="text-muted-foreground">Platform-wide oversight and analytics.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/audit-logs">
              <ShieldAlert className="mr-2 h-4 w-4" />
              Audit Logs
            </Link>
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t space-y-8">
        <GlobalAbuseReportsList />
        <AnalyticsDashboardPage />
      </div>
    </div>
  );
}
