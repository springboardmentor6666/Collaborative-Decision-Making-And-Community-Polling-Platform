import React, { useState } from "react";
import { useDecisions } from "@/modules/decisions/hooks/useDecisions";
import { useDownloadDecisionPdf, useDownloadDecisionExcel } from "../hooks/useReports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  FileSpreadsheet, 
  Search, 
  Loader2, 
  Users, 
  Vote, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { DecisionResponse } from "@/modules/decisions/types/decision";

export function DecisionReportsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const { data: decisionsData, isLoading } = useDecisions({
    query: searchTerm || undefined,
    status: statusFilter !== "ALL" ? (statusFilter as any) : undefined,
    page,
    size: pageSize,
  });

  const downloadPdf = useDownloadDecisionPdf();
  const downloadExcel = useDownloadDecisionExcel();
  const [activeDecisionId, setActiveDecisionId] = useState<number | null>(null);

  const handleDownloadPdf = (decision: DecisionResponse) => {
    setActiveDecisionId(decision.decisionId);
    downloadPdf.mutate(
      { decisionId: decision.decisionId, title: decision.title },
      { onSettled: () => setActiveDecisionId(null) }
    );
  };

  const handleDownloadExcel = (decision: DecisionResponse) => {
    setActiveDecisionId(decision.decisionId);
    downloadExcel.mutate(
      { decisionId: decision.decisionId, title: decision.title },
      { onSettled: () => setActiveDecisionId(null) }
    );
  };

  const decisions = decisionsData?.content || [];
  const totalPages = decisionsData?.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search decisions by title..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="pl-9 bg-slate-50 border-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "ACTIVE", "CLOSED"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? "default" : "outline"}
              onClick={() => {
                setStatusFilter(st);
                setPage(0);
              }}
              className={statusFilter === st ? "bg-[#18181B] text-white" : "text-slate-600"}
            >
              {st === "ALL" ? "All Decisions" : st === "ACTIVE" ? "Active / Open" : "Closed Polls"}
            </Button>
          ))}
        </div>
      </div>

      {/* Decision Reports Table / Cards */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-xl border border-[#E2E8F0]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
          <p>Loading decision records for reporting...</p>
        </div>
      ) : decisions.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-xl border border-[#E2E8F0]">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-semibold text-[#0F172A]">No Decisions Found</h3>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-600 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Decision Title</th>
                  <th className="py-3.5 px-4">Community</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Votes</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Generate & Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {decisions.map((dec) => {
                  const isGeneratingPdf = downloadPdf.isPending && activeDecisionId === dec.decisionId;
                  const isGeneratingExcel = downloadExcel.isPending && activeDecisionId === dec.decisionId;

                  return (
                    <tr key={dec.decisionId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-medium text-[#0F172A] max-w-xs truncate">
                        {dec.title}
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {dec.community ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                            <Users className="w-3 h-3" />
                            {dec.community.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Public Board</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="outline"
                          className={
                            dec.status === "CLOSED" || dec.status === "ARCHIVED"
                              ? "bg-slate-100 text-slate-700 border-slate-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }
                        >
                          {dec.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-semibold">
                        <div className="flex items-center gap-1">
                          <Vote className="w-3.5 h-3.5 text-slate-400" />
                          {dec.totalVotes.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(dec.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 h-8"
                            onClick={() => handleDownloadPdf(dec)}
                            disabled={isGeneratingPdf || isGeneratingExcel}
                          >
                            {isGeneratingPdf ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 mr-1" />
                            )}
                            PDF
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 h-8"
                            onClick={() => handleDownloadExcel(dec)}
                            disabled={isGeneratingPdf || isGeneratingExcel}
                          >
                            {isGeneratingExcel ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                            ) : (
                              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                            )}
                            Excel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[#E2E8F0] bg-slate-50/50">
              <span className="text-xs text-slate-500">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
