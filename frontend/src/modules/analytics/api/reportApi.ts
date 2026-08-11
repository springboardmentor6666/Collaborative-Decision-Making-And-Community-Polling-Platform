import api from "../../../api/axios";

export const reportApi = {
  downloadDecisionReportPdf: async (decisionId: number): Promise<void> => {
    const response = await api.post(`/reports/decision/${decisionId}/pdf`, {}, {
      responseType: 'blob',
    });
    
    // Create a blob from the response and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `decision_report_${decisionId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  downloadDecisionReportExcel: async (decisionId: number): Promise<void> => {
    const response = await api.post(`/reports/decision/${decisionId}/excel`, {}, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `decision_report_${decisionId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
