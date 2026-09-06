package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.AnalyticsOverviewResponse;
import com.decisionhub.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewResponse> getOverview() {
        return ResponseEntity.ok(analyticsService.getOverview());
    }

    @GetMapping("/decisions/{id}")
    public ResponseEntity<Map<String, Object>> getDecisionAnalytics(@PathVariable Long id) {
        return ResponseEntity.ok(analyticsService.getDecisionAnalytics(id));
    }
}
