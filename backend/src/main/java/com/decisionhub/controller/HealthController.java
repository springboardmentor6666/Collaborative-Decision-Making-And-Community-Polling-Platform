package com.decisionhub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: HealthController
 * Architecture Tier: Presentation Layer (Controller Tier)
 * Package: com.decisionhub.controller
 *
 * Purpose:
 *   Lightweight, non-blocking health check and root landing endpoint for Render,
 *   Docker container monitoring, and cloud uptime probes. Returns HTTP 200 without DB delays.
 */
@RestController
public class HealthController {

    @GetMapping(value = {"/", "/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("service", "DecisionHub API");
        response.put("version", "1.0.0");
        response.put("timestamp", Instant.now().toString());
        response.put("message", "DecisionHub backend service is running smoothly.");
        return ResponseEntity.ok(response);
    }
}
