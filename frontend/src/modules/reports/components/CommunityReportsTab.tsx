import React, { useState } from "react";
import { useCommunities } from "@/modules/communities/hooks/useCommunities";
import { useDownloadCommunityExcel } from "../hooks/useReports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileSpreadsheet, 
  Search, 
  Loader2, 
  Users, 
  ShieldCheck, 
  Globe, 
  Lock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { CommunityResponse } from "@/types";

export function CommunityReportsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const { data: communitiesData, isLoading } = useCommunities({
    query: searchTerm || undefined,
    page,
    size: pageSize,
  });

  const downloadCommunityExcel = useDownloadCommunityExcel();
  const [activeCommunityId, setActiveCommunityId] = useState<number | null>(null);

  const handleDownload = (community: CommunityResponse) => {
    setActiveCommunityId(community.communityId);
    downloadCommunityExcel.mutate(
      { communityId: community.communityId, name: community.name },
      { onSettled: () => setActiveCommunityId(null) }
    );
  };

  const communities = communitiesData?.content || [];
  const totalPages = communitiesData?.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search communities by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="pl-9 bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      {/* Community Reports Table */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-xl border border-[#E2E8F0]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
          <p>Loading communities for reporting...</p>
        </div>
      ) : communities.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-xl border border-[#E2E8F0]">
          <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-semibold text-[#0F172A]">No Communities Found</h3>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-600 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Community</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Visibility</th>
                  <th className="py-3.5 px-4">Members</th>
                  <th className="py-3.5 px-4 text-right">Audit & Data Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {communities.map((comm) => {
                  const isGenerating = downloadCommunityExcel.isPending && activeCommunityId === comm.communityId;

                  return (
                    <tr key={comm.communityId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-medium text-[#0F172A]">
                        <div>
                          <p className="font-semibold text-slate-900">{comm.name}</p>
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-sm">{comm.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span>{comm.owner?.fullName || comm.owner?.username || "Owner"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="outline"
                          className={
                            comm.visibility === "PUBLIC"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {comm.visibility === "PUBLIC" ? (
                            <Globe className="w-3 h-3 mr-1" />
                          ) : (
                            <Lock className="w-3 h-3 mr-1" />
                          )}
                          {comm.visibility}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-medium">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {comm.memberCount || 1} members
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 h-8"
                          onClick={() => handleDownload(comm)}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          ) : (
                            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          Export Excel
                        </Button>
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
