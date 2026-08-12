package com.decisionhub.service;

import com.decisionhub.dto.response.ReportResponse;

public interface ReportService {

    byte[] generatePdfReport(Long decisionId, Long requestingUserId);

    byte[] generateExcelReport(Long decisionId, Long requestingUserId);
}
