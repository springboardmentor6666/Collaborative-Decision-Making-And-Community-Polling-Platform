package com.decisionhub.service;

import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.response.ReportResponse;
import org.springframework.data.domain.Pageable;

public interface ReportService {

    byte[] generatePdfReport(Long decisionId, Long requestingUserId);

    byte[] generateExcelReport(Long decisionId, Long requestingUserId);

    byte[] generateCommunityExcelReport(Long communityId, Long requestingUserId);

    byte[] generatePlatformSummaryPdf(Long requestingUserId);

    PagedResponse<ReportResponse> getAllReports(Pageable pageable);
}
