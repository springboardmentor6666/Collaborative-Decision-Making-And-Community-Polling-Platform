import React from "react";
import { useDownloadPlatformSummaryPdf } from "../hooks/useReports";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Loader2, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function PlatformSummaryCard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";
  const downloadPlatformPdf = useDownloadPlatformSummaryPdf();

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
      <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Administration Suite
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Platform-Wide Intelligence & Health Report</h3>
          <p className="text-slate-300 text-sm">
            Generate an executive summary PDF containing real-time platform statistics, total active decision boards, registered user counts, and voting participation metrics.
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => downloadPlatformPdf.mutate()}
          disabled={downloadPlatformPdf.isPending}
          className="bg-white text-purple-950 hover:bg-purple-50 font-semibold shadow-lg shrink-0 h-11 px-6"
        >
          {downloadPlatformPdf.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Compiling Executive PDF...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2 text-purple-700" />
              Download Platform Digest (PDF)
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
