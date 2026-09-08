import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformSummaryCard } from "../components/PlatformSummaryCard";
import { DecisionReportsTab } from "../components/DecisionReportsTab";
import { CommunityReportsTab } from "../components/CommunityReportsTab";
import { ReportHistoryArchive } from "../components/ReportHistoryArchive";
import { 
  FileText, 
  FileSpreadsheet, 
  Users, 
  History, 
  BarChart3, 
  DownloadCloud, 
  Layers
} from "lucide-react";
import { useReportHistory } from "../hooks/useReports";
import { useDecisions } from "@/modules/decisions/hooks/useDecisions";
import { useCommunities } from "@/modules/communities/hooks/useCommunities";

export default function ReportsPage() {
  const { data: reportsData } = useReportHistory(0, 1);
  const { data: decisionsData } = useDecisions({ size: 1 });
  const { data: communitiesData } = useCommunities({ size: 1 });

  const totalReports = reportsData?.totalElements ?? 0;
  const totalDecisions = decisionsData?.totalElements ?? 0;
  const totalCommunities = communitiesData?.totalElements ?? 0;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Reports & Export Center</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
              Admin & Governance
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            Generate, compile, and export structured decision metrics, voting audit logs, and community analytics into PDF and Excel spreadsheets.
          </p>
        </div>
      </div>

      {/* Quick Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <DownloadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Reports Generated</p>
            <h4 className="text-2xl font-bold text-[#0F172A] mt-0.5">{totalReports.toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Decisions</p>
            <h4 className="text-2xl font-bold text-[#0F172A] mt-0.5">{totalDecisions.toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Communities Tracked</p>
            <h4 className="text-2xl font-bold text-[#0F172A] mt-0.5">{totalCommunities.toLocaleString()}</h4>
          </div>
        </div>
      </div>

      {/* Executive Digest Banner for Admins */}
      <PlatformSummaryCard />

      {/* Main Tabs Container */}
      <Tabs defaultValue="decisions" className="space-y-6">
        <TabsList className="bg-slate-100/80 p-1 border border-slate-200">
          <TabsTrigger value="decisions" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-950 font-medium">
            <FileText className="w-4 h-4 text-red-500" />
            Decision Reports
          </TabsTrigger>
          <TabsTrigger value="communities" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-950 font-medium">
            <Users className="w-4 h-4 text-blue-500" />
            Community Reports
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-950 font-medium">
            <History className="w-4 h-4 text-purple-500" />
            Reports Archive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="decisions">
          <DecisionReportsTab />
        </TabsContent>

        <TabsContent value="communities">
          <CommunityReportsTab />
        </TabsContent>

        <TabsContent value="history">
          <ReportHistoryArchive />
        </TabsContent>
      </Tabs>
    </div>
  );
}
