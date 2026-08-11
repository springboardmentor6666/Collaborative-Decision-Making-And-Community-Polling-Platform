import axiosInstance from "@/api/axios";
import { PagedResponse, UserResponse } from "@/types";

export type AbuseReason = 'ABUSE' | 'RESTRICTED_ADULT' | 'SPAM' | 'OTHER';
export type AbuseReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface AbuseReportRequest {
  reason: AbuseReason;
  description?: string;
}

export interface AbuseReportResponse {
  reportId: number;
  decisionId: number;
  decisionTitle: string;
  communityId?: number;
  communityName?: string;
  reportedBy: UserResponse;
  reason: AbuseReason;
  description?: string;
  status: AbuseReportStatus;
  resolvedBy?: UserResponse;
  createdAt: string;
  updatedAt: string;
}

const API_PREFIX = "/abuse-reports";

export const abuseReportApi = {
  reportDecision: async (decisionId: number, data: AbuseReportRequest): Promise<AbuseReportResponse> => {
    const response = await axiosInstance.post(`${API_PREFIX}/decision/${decisionId}`, data);
    return response.data.data;
  },

  getCommunityReports: async (communityId: number, params: { status?: AbuseReportStatus, page?: number, size?: number }): Promise<PagedResponse<AbuseReportResponse>> => {
    const response = await axiosInstance.get(`${API_PREFIX}/community/${communityId}`, { params });
    return response.data.data;
  },

  getGlobalReports: async (params: { status?: AbuseReportStatus, page?: number, size?: number }): Promise<PagedResponse<AbuseReportResponse>> => {
    const response = await axiosInstance.get(`${API_PREFIX}/admin`, { params });
    return response.data.data;
  },

  resolveReport: async (reportId: number, deleteDecision: boolean): Promise<AbuseReportResponse> => {
    const response = await axiosInstance.patch(`${API_PREFIX}/${reportId}/resolve`, null, { params: { deleteDecision } });
    return response.data.data;
  }
};
