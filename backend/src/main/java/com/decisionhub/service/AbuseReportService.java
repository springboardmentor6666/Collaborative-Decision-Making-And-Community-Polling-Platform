package com.decisionhub.service;

import com.decisionhub.common.enums.AbuseReportStatus;
import com.decisionhub.dto.request.AbuseReportRequest;
import com.decisionhub.dto.response.AbuseReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AbuseReportService {
    AbuseReportResponse reportDecision(Long decisionId, AbuseReportRequest request, Long userId);
    
    Page<AbuseReportResponse> getReportsForCommunity(Long communityId, AbuseReportStatus status, Pageable pageable, Long userId);
    
    Page<AbuseReportResponse> getGlobalReports(AbuseReportStatus status, Pageable pageable);
    
    AbuseReportResponse resolveReport(Long reportId, boolean deleteDecision, Long userId);
}
