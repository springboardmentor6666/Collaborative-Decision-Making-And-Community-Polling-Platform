package com.decisionhub.backend.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Read-only endpoint for showing the database records in the frontend.
 * It supports both the supplied PostgreSQL schema and the older local schema
 * currently present in the decisionhub database.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final JdbcTemplate jdbcTemplate;

    public DashboardController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public Map<String, Object> getDashboard() {
        boolean suppliedSchema = hasColumn("users", "user_id");
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("schemaVersion", suppliedSchema ? "supplied" : "legacy");
        response.put("summary", getSummary());
        response.put("users", getUsers(suppliedSchema));
        response.put("decisions", getDecisions(suppliedSchema));
        response.put("options", jdbcTemplate.queryForList(
                "SELECT option_id, decision_id, option_title, score, ranking FROM options ORDER BY option_id"));
        return response;
    }

    private Map<String, Long> getSummary() {
        Map<String, Long> summary = new LinkedHashMap<>();
        for (String table : List.of("users", "decisions", "options", "votes", "communities", "community_members")) {
            Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + table, Long.class);
            summary.put(table, count == null ? 0L : count);
        }
        return summary;
    }

    private List<Map<String, Object>> getUsers(boolean suppliedSchema) {
        String query = suppliedSchema
                ? "SELECT user_id AS id, username AS name, email, full_name, role, created_at FROM users ORDER BY user_id"
                : "SELECT id, name, email, name AS full_name, role, created_at FROM users ORDER BY id";
        return jdbcTemplate.queryForList(query);
    }

    private List<Map<String, Object>> getDecisions(boolean suppliedSchema) {
        String query = suppliedSchema
                ? "SELECT decision_id AS id, title, category, status, visibility, created_at FROM decisions ORDER BY decision_id"
                : "SELECT id, title, category, status, visibility, created_at FROM decisions ORDER BY id";
        return jdbcTemplate.queryForList(query);
    }

    private boolean hasColumn(String table, String column) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM information_schema.columns "
                        + "WHERE table_schema = 'public' AND table_name = ? AND column_name = ?)",
                Boolean.class,
                table,
                column);
        return Boolean.TRUE.equals(exists);
    }
}
