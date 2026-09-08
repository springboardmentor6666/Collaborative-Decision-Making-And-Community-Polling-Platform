import { UserResponse } from "@/types";

export type ReportType = "PDF" | "EXCEL";

export interface ReportItem {
  reportId: number;
  decisionId?: number;
  decisionTitle?: string;
  communityName?: string;
  generatedBy?: UserResponse;
  reportType: ReportType;
  reportUrl: string;
  generatedAt: string;
}
