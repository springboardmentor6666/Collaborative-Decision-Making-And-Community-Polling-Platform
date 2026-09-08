import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "../api/reportsApi";
import { toast } from "sonner";

export const useReportHistory = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ["reports-history", page, size],
    queryFn: () => reportsApi.getAllReports(page, size),
  });
};

export const useDownloadDecisionPdf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ decisionId, title }: { decisionId: number; title?: string }) =>
      reportsApi.downloadDecisionPdf(decisionId, title),
    onSuccess: () => {
      toast.success("PDF report generated and downloaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["reports-history"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to generate PDF report");
    },
  });
};

export const useDownloadDecisionExcel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ decisionId, title }: { decisionId: number; title?: string }) =>
      reportsApi.downloadDecisionExcel(decisionId, title),
    onSuccess: () => {
      toast.success("Excel report generated and downloaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["reports-history"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to generate Excel report");
    },
  });
};

export const useDownloadCommunityExcel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, name }: { communityId: number; name?: string }) =>
      reportsApi.downloadCommunityExcel(communityId, name),
    onSuccess: () => {
      toast.success("Community report generated and downloaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["reports-history"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to generate Community report");
    },
  });
};

export const useDownloadPlatformSummaryPdf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => reportsApi.downloadPlatformSummaryPdf(),
    onSuccess: () => {
      toast.success("Platform Executive Summary PDF downloaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["reports-history"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to generate Platform Summary PDF");
    },
  });
};
