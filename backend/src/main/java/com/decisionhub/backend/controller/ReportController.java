package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.ReportRequest;
import com.decisionhub.backend.dto.ReportResponse;
import com.decisionhub.backend.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<List<ReportResponse>> getMyReports() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(reportService.getMyReports(email));
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ReportResponse> generateReport(@Valid @RequestBody ReportRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(reportService.generateReport(req, email));
    }

    @GetMapping("/{id}/export")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<String> exportReport(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String csvData = reportService.exportReportCsv(id, email);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report_" + id + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
