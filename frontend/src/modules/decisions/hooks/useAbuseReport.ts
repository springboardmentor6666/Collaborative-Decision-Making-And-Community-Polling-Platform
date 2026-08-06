import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { abuseReportApi, AbuseReportRequest, AbuseReportStatus } from "../api/abuseReportApi";

export const useReportDecision = () => {
  return useMutation({
    mutationFn: ({ decisionId, data }: { decisionId: number, data: AbuseReportRequest }) => 
      abuseReportApi.reportDecision(decisionId, data)
  });
};

export const useCommunityReports = (communityId: number, status?: AbuseReportStatus, page = 0, size = 10) => {
  return useQuery({
    queryKey: ["community-abuse-reports", communityId, status, page, size],
    queryFn: () => abuseReportApi.getCommunityReports(communityId, { status, page, size }),
    enabled: !!communityId,
  });
};

export const useGlobalReports = (status?: AbuseReportStatus, page = 0, size = 20) => {
  return useQuery({
    queryKey: ["global-abuse-reports", status, page, size],
    queryFn: () => abuseReportApi.getGlobalReports({ status, page, size })
  });
};

export const useResolveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, deleteDecision }: { reportId: number, deleteDecision: boolean }) => 
      abuseReportApi.resolveReport(reportId, deleteDecision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-abuse-reports"] });
      queryClient.invalidateQueries({ queryKey: ["global-abuse-reports"] });
      // Might want to invalidate decisions if one was deleted
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
    }
  });
};
