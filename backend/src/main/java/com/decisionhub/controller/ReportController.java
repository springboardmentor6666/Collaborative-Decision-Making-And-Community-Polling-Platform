package com.decisionhub.controller;

import com.decisionhub.common.response.ApiResponse;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.response.ReportResponse;
import com.decisionhub.security.UserPrincipal;
import com.decisionhub.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Exports", description = "Endpoints for generating and retrieving PDF and Excel analytics reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    @Operation(summary = "Get paginated audit history of generated reports")
    public ResponseEntity<ApiResponse<PagedResponse<ReportResponse>>> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<ReportResponse> reports = reportService.getAllReports(pageable);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @PostMapping("/decision/{decisionId}/pdf")
    @Operation(summary = "Generate PDF analytics summary report for a decision board")
    public ResponseEntity<byte[]> generatePdfReport(
            @PathVariable Long decisionId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        byte[] pdfBytes = reportService.generatePdfReport(decisionId, userId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "decision_report_" + decisionId + ".pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @PostMapping("/decision/{decisionId}/excel")
    @Operation(summary = "Generate Excel vote spreadsheet report for a decision board")
    public ResponseEntity<byte[]> generateExcelReport(
            @PathVariable Long decisionId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        byte[] excelBytes = reportService.generateExcelReport(decisionId, userId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "decision_report_" + decisionId + ".xlsx");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }

    @PostMapping("/community/{communityId}/excel")
    @Operation(summary = "Generate Excel analytics and member activity report for a community")
    public ResponseEntity<byte[]> generateCommunityExcelReport(
            @PathVariable Long communityId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        byte[] excelBytes = reportService.generateCommunityExcelReport(communityId, userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "community_report_" + communityId + ".xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }

    @PostMapping("/platform/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate Platform-wide Executive Summary PDF (Admin only)")
    public ResponseEntity<byte[]> generatePlatformSummaryPdf(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        byte[] pdfBytes = reportService.generatePlatformSummaryPdf(userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "platform_summary_report.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}

