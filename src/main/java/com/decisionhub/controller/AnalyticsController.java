package com.decisionhub.controller;

import com.decisionhub.common.response.ApiResponse;
import com.decisionhub.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Decision Analytics Dashboard", description = "Endpoints for platform statistics, user participation analytics, and decision insights")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform-wide dashboard analytics metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = analyticsService.getSystemDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user participation and decision analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserAnalytics(@PathVariable Long userId) {
        Map<String, Object> stats = analyticsService.getUserAnalytics(userId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/decision/{decisionId}")
    @Operation(summary = "Get detailed analytics metrics for a specific decision board")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDecisionAnalytics(@PathVariable Long decisionId) {
        Map<String, Object> stats = analyticsService.getDecisionAnalytics(decisionId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
