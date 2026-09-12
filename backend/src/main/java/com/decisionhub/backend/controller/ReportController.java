package com.decisionhub.backend.controller;

import com.decisionhub.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/export/decision/{decisionId}")
    public ResponseEntity<byte[]> exportDecisionReport(@PathVariable Long decisionId) {
        byte[] csvData = reportService.generateCsvReport(decisionId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=decision_report_" + decisionId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
