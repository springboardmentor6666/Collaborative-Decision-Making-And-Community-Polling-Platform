package com.decisionhub.controller;

import com.decisionhub.common.enums.AbuseReportStatus;
import com.decisionhub.common.response.ApiResponse;
import com.decisionhub.dto.request.AbuseReportRequest;
import com.decisionhub.dto.response.AbuseReportResponse;
import com.decisionhub.security.UserPrincipal;
import com.decisionhub.service.AbuseReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/abuse-reports")
@RequiredArgsConstructor
@Tag(name = "Abuse Reports", description = "Endpoints for reporting decisions and managing reports")
public class AbuseReportController {

    private final AbuseReportService abuseReportService;

    @PostMapping("/decision/{decisionId}")
    @Operation(summary = "Report a decision for abuse or violation")
    public ResponseEntity<ApiResponse<AbuseReportResponse>> reportDecision(
            @PathVariable Long decisionId,
            @Valid @RequestBody AbuseReportRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        AbuseReportResponse response = abuseReportService.reportDecision(decisionId, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Decision reported successfully", response));
    }

    @GetMapping("/community/{communityId}")
    @Operation(summary = "Get abuse reports for a community (Owner/Moderator only)")
    public ResponseEntity<ApiResponse<Page<AbuseReportResponse>>> getCommunityReports(
            @PathVariable Long communityId,
            @RequestParam(required = false) AbuseReportStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AbuseReportResponse> reports = abuseReportService.getReportsForCommunity(communityId, status, pageable, currentUser.getId());
        
        return ResponseEntity.ok(ApiResponse.success("Community reports retrieved successfully", reports));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all abuse reports (System Admin only)")
    public ResponseEntity<ApiResponse<Page<AbuseReportResponse>>> getGlobalReports(
            @RequestParam(required = false) AbuseReportStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AbuseReportResponse> reports = abuseReportService.getGlobalReports(status, pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Global reports retrieved successfully", reports));
    }

    @PatchMapping("/{reportId}/resolve")
    @Operation(summary = "Resolve or dismiss an abuse report")
    public ResponseEntity<ApiResponse<AbuseReportResponse>> resolveReport(
            @PathVariable Long reportId,
            @RequestParam boolean deleteDecision,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        AbuseReportResponse response = abuseReportService.resolveReport(reportId, deleteDecision, currentUser.getId());
        String msg = deleteDecision ? "Report resolved and decision deleted" : "Report dismissed";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }
}
