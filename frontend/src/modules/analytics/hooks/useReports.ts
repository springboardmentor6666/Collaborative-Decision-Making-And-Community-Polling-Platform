import { useMutation } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';

export const useDownloadPdfReport = () => {
  return useMutation({
    mutationFn: (decisionId: number) => reportApi.downloadDecisionReportPdf(decisionId),
  });
};

export const useDownloadExcelReport = () => {
  return useMutation({
    mutationFn: (decisionId: number) => reportApi.downloadDecisionReportExcel(decisionId),
  });
};
