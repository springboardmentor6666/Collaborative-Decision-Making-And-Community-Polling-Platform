import axiosInstance from "@/api/axios";
import { PagedResponse } from "@/types";
import { ReportItem } from "../types/reports";

const API_PREFIX = "/reports";

function triggerBlobDownload(blobData: BlobPart, defaultFilename: string, mimeType: string) {
  const blob = new Blob([blobData], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", defaultFilename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const reportsApi = {
  getAllReports: async (page = 0, size = 10): Promise<PagedResponse<ReportItem>> => {
    const response = await axiosInstance.get(API_PREFIX, { params: { page, size } });
    return response.data.data;
  },

  downloadDecisionPdf: async (decisionId: number, title?: string): Promise<void> => {
    const response = await axiosInstance.post(
      `${API_PREFIX}/decision/${decisionId}/pdf`,
      {},
      { responseType: "blob" }
    );
    const sanitized = (title || `decision_${decisionId}`).replace(/[^a-zA-Z0-9_-]/g, "_");
    triggerBlobDownload(response.data, `${sanitized}_summary.pdf`, "application/pdf");
  },

  downloadDecisionExcel: async (decisionId: number, title?: string): Promise<void> => {
    const response = await axiosInstance.post(
      `${API_PREFIX}/decision/${decisionId}/excel`,
      {},
      { responseType: "blob" }
    );
    const sanitized = (title || `decision_${decisionId}`).replace(/[^a-zA-Z0-9_-]/g, "_");
    triggerBlobDownload(
      response.data,
      `${sanitized}_votes.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  },

  downloadCommunityExcel: async (communityId: number, name?: string): Promise<void> => {
    const response = await axiosInstance.post(
      `${API_PREFIX}/community/${communityId}/excel`,
      {},
      { responseType: "blob" }
    );
    const sanitized = (name || `community_${communityId}`).replace(/[^a-zA-Z0-9_-]/g, "_");
    triggerBlobDownload(
      response.data,
      `${sanitized}_report.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  },

  downloadPlatformSummaryPdf: async (): Promise<void> => {
    const response = await axiosInstance.post(
      `${API_PREFIX}/platform/pdf`,
      {},
      { responseType: "blob" }
    );
    triggerBlobDownload(response.data, "DecisionHub_Platform_Summary.pdf", "application/pdf");
  },
};
