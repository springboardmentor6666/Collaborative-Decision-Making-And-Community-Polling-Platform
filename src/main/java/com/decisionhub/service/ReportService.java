package com.decisionhub.service;

import com.decisionhub.dto.response.ReportResponse;

public interface ReportService {

    ReportResponse generatePdfReport(Long decisionId, Long requestingUserId);

    ReportResponse generateExcelReport(Long decisionId, Long requestingUserId);
}
