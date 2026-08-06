package com.decisionhub.controller;

import com.decisionhub.common.response.ApiResponse;
import com.decisionhub.dto.response.ReportResponse;
import com.decisionhub.security.UserPrincipal;
import com.decisionhub.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Exports", description = "Endpoints for generating PDF and Excel analytics reports")
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/decision/{decisionId}/pdf")
    @Operation(summary = "Generate PDF analytics summary report for a decision board")
    public ResponseEntity<byte[]> generatePdfReport(
            @PathVariable Long decisionId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        byte[] pdfBytes = reportService.generatePdfReport(decisionId, userId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "decision_report.pdf");
        
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
        headers.setContentDispositionFormData("attachment", "decision_report.xlsx");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }
}
