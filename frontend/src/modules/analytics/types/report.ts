export interface ReportResponse {
  reportId: number;
  reportUrl?: string; // Not used anymore since we download directly, but keep for type compatibility
  reportType: 'PDF' | 'EXCEL';
  decisionId: number;
  generatedAt: string;
}
