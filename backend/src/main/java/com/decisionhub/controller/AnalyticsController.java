package com.decisionhub.controller;

import com.decisionhub.dto.CreatorAnalyticsResponse;
import com.decisionhub.dto.ImpressionRequest;
import com.decisionhub.dto.MyVoteAnalysisDto;
import com.decisionhub.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Analytics & Decision Analysis", description = "Endpoints for user vote breakdown, creator analytics, impression tracking, and decision data export")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/analysis/my-votes")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user vote analysis", description = "Retrieves full voting analysis for decisions voted on by the authenticated user")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<MyVoteAnalysisDto>> getMyVotesAnalysis(Authentication authentication) {
        List<MyVoteAnalysisDto> response = analyticsService.getMyVotesAnalysis(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics/my-decisions")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get creator analytics", description = "Retrieves reach, views, votes, and conversion rate analytics for decisions owned by the authenticated creator")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<CreatorAnalyticsResponse> getCreatorAnalytics(Authentication authentication) {
        CreatorAnalyticsResponse response = analyticsService.getCreatorAnalytics(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/decisions/{id}/impressions")
    @Operation(summary = "Record decision impression", description = "Records a REACH or VIEW impression for a decision")
    public ResponseEntity<Map<String, String>> recordImpression(
            @PathVariable("id") Long id,
            @RequestBody(required = false) ImpressionRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        String type = (request != null && request.getType() != null) ? request.getType() : "VIEW";
        String userEmail = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : null;

        String clientIp = servletRequest.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = servletRequest.getRemoteAddr();
        } else {
            clientIp = clientIp.split(",")[0].trim();
        }

        analyticsService.recordImpression(id, type, userEmail, clientIp);
        return ResponseEntity.ok(Map.of("message", "Impression recorded successfully"));
    }

    @GetMapping(value = "/decisions/{id}/export/csv", produces = "text/csv")
    @Operation(summary = "Export decision analytics & score matrix to CSV", description = "Exports decision summary, vote percentage breakdown, and comparison factor score matrix as CSV")
    public ResponseEntity<byte[]> exportDecisionCsv(@PathVariable("id") Long id) {
        byte[] csvData = analyticsService.exportDecisionCsv(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"decision-" + id + "-export.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
