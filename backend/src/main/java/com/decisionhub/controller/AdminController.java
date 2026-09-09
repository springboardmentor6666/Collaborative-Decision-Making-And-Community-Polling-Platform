package com.decisionhub.controller;

import com.decisionhub.dto.*;
import com.decisionhub.entity.AdminSetting;
import com.decisionhub.entity.AuditLog;
import com.decisionhub.repository.AdminSettingRepository;
import com.decisionhub.service.AdminModerationService;
import com.decisionhub.service.AdminStatisticsService;
import com.decisionhub.service.AuditLogService;
import com.decisionhub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: AdminController
 * Architecture Tier: REST API Controller (Presentation Tier)
 * Package: com.decisionhub.controller
 *
 * Purpose:
 *   Provides administrative control endpoints for managing users, updating account statuses, assigning RBAC roles, and reviewing system audit logs.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Admin, Statistics & Moderation", description = "Endpoints for platform administration, real-time statistics, report management, user control, and settings")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserService userService;
    private final AuditLogService auditLogService;
    private final AdminSettingRepository adminSettingRepository;
    private final AdminStatisticsService adminStatisticsService;
    private final AdminModerationService adminModerationService;

    public AdminController(UserService userService,
                           AuditLogService auditLogService,
                           AdminSettingRepository adminSettingRepository,
                           AdminStatisticsService adminStatisticsService,
                           AdminModerationService adminModerationService) {
        this.userService = userService;
        this.auditLogService = auditLogService;
        this.adminSettingRepository = adminSettingRepository;
        this.adminStatisticsService = adminStatisticsService;
        this.adminModerationService = adminModerationService;
    }

    // ─────────────────────────────────────────────────────────
    // PAGE 1: APPLICATION STATISTICS ENDPOINTS (ADMIN ONLY)
    // ─────────────────────────────────────────────────────────

    @GetMapping("/admin/stats/overview")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get platform overview statistics", description = "Calculates application-wide real-time metrics including users, decisions, communities, comments, discussions, and reports (Admin only)")
    public ResponseEntity<AdminStatsOverviewDto> getOverviewStatistics() {
        return ResponseEntity.ok(adminStatisticsService.getOverviewStatistics());
    }

    @GetMapping("/admin/stats/timeseries")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get time-series usage statistics", description = "Retrieves daily usage statistics for decisions, communities, users, comments, discussions, and reports with interval filter (Admin only)")
    public ResponseEntity<AdminStatsTimeSeriesDto> getTimeSeriesStatistics(
            @RequestParam(value = "range", defaultValue = "7D") String range,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        return ResponseEntity.ok(adminStatisticsService.getTimeSeriesStatistics(range, startDate, endDate));
    }

    // ─────────────────────────────────────────────────────────
    // PAGE 2: REPORT MANAGEMENT & MODERATION (ADMIN & USER)
    // ─────────────────────────────────────────────────────────

    @PostMapping("/reports")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit content report", description = "Allows registered users to report inappropriate decisions, comments, discussions, or user profiles")
    public ResponseEntity<ReportDetailResponse> submitReport(@RequestBody Map<String, Object> body, Authentication authentication) {
        ReportDetailResponse response = adminModerationService.submitReport(body, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports/my-submissions")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user submitted reports", description = "Retrieves all reports filed by the current user along with resolution status for profile display")
    public ResponseEntity<List<ReportDetailResponse>> getMySubmittedReports(Authentication authentication) {
        return ResponseEntity.ok(adminModerationService.getUserSubmittedReports(authentication.getName()));
    }

    @GetMapping("/reports/my-notices")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get moderation notices on user content", description = "Retrieves moderation actions, modification requests, and review notices on content owned by the current user")
    public ResponseEntity<List<ReportDetailResponse>> getMyModerationNotices(Authentication authentication) {
        return ResponseEntity.ok(adminModerationService.getUserModerationNotices(authentication.getName()));
    }

    @GetMapping("/admin/reports")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN') or hasRole('MODERATOR') or hasAuthority('ROLE_MODERATOR')")
    @Operation(summary = "Get content reports with filters", description = "Retrieves paginated content reports with status, contentType, and keyword filters (Admin/Moderator only)")
    public ResponseEntity<Page<ReportDetailResponse>> getReports(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "contentType", required = false) String contentType,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(adminModerationService.getReportsPaged(status, contentType, search, pageable));
    }

    @GetMapping("/admin/reports/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN') or hasRole('MODERATOR') or hasAuthority('ROLE_MODERATOR')")
    @Operation(summary = "Get report details", description = "Retrieves comprehensive details and content snapshot of a report (Admin/Moderator only)")
    public ResponseEntity<ReportDetailResponse> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(adminModerationService.getReportById(id));
    }

    @PostMapping("/admin/reports/{id}/moderate")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN') or hasRole('MODERATOR') or hasAuthority('ROLE_MODERATOR')")
    @Operation(summary = "Execute moderation action", description = "Executes moderation action (NO_ACTION, TEMPORARY_REMOVAL, DIRECT_REMOVE, RESTORE), modifies content state, notifies creator and reporter (Admin/Moderator only)")
    public ResponseEntity<ReportDetailResponse> moderateReport(@PathVariable Long id,
                                                               @Valid @RequestBody ModerationActionRequest request,
                                                               Authentication authentication) {
        ReportDetailResponse response = adminModerationService.moderateReport(id, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/reports/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN') or hasRole('MODERATOR') or hasAuthority('ROLE_MODERATOR')")
    @Operation(summary = "Resolve report", description = "Marks a report as resolved (Admin/Moderator only)")
    public ResponseEntity<ReportDetailResponse> resolveReport(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(adminModerationService.resolveReport(id, authentication.getName()));
    }

    @DeleteMapping("/reports/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete report", description = "Deletes/cancels a report (Reporter or Admin/Moderator)")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id, Authentication authentication) {
        adminModerationService.deleteReport(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/admin/reports/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN') or hasRole('MODERATOR') or hasAuthority('ROLE_MODERATOR')")
    @Operation(summary = "Admin delete report", description = "Deletes a report directly (Admin/Moderator only)")
    public ResponseEntity<Void> adminDeleteReport(@PathVariable Long id, Authentication authentication) {
        adminModerationService.deleteReport(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────
    // USER CONTROL & LIFECYCLE MANAGEMENT (ADMIN ONLY)
    // ─────────────────────────────────────────────────────────

    @PostMapping("/admin/users/{id}/ban")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN') or hasRole('MODERATOR') or hasAuthority('ROLE_MODERATOR')")
    @Operation(summary = "Ban/Deactivate user", description = "Deactivates a user account (Admin/Moderator only)")
    public ResponseEntity<UserResponse> banUser(@PathVariable Long id, Authentication authentication) {
        UserResponse user = userService.setUserActiveStatus(id, false, authentication.getName());
        auditLogService.logAction(authentication.getName(), "BAN_USER", "USER", id, "Deactivated user account");
        return ResponseEntity.ok(user);
    }

    @PostMapping("/admin/users/{id}/unban")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN') or hasRole('MODERATOR') or hasAuthority('ROLE_MODERATOR')")
    @Operation(summary = "Unban/Reactivate user", description = "Reactivates a user account (Admin/Moderator only)")
    public ResponseEntity<UserResponse> unbanUser(@PathVariable Long id, Authentication authentication) {
        UserResponse user = userService.setUserActiveStatus(id, true, authentication.getName());
        auditLogService.logAction(authentication.getName(), "UNBAN_USER", "USER", id, "Reactivated user account");
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/admin/users/{id}/permanent")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Permanent delete user", description = "Permanently deletes user account, detaches votes/comments/decisions, and purges personal data (Admin only)")
    public ResponseEntity<Void> permanentDeleteUser(@PathVariable Long id, Authentication authentication) {
        userService.adminPermanentDeleteUser(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/users/{id}/cancel-deletion")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Cancel user deletion", description = "Cancels a user's scheduled 14-day deletion and restores account to active (Admin only)")
    public ResponseEntity<UserResponse> adminCancelDeletion(@PathVariable Long id, Authentication authentication) {
        UserResponse response = userService.adminCancelUserDeletion(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update user role", description = "Updates user role (Admin only)")
    public ResponseEntity<UserResponse> updateUserRole(@PathVariable Long id,
                                                       @RequestBody Map<String, String> body,
                                                       Authentication authentication) {
        String newRole = body.get("role");
        UserResponse user = userService.updateUserRole(id, newRole, authentication.getName());
        auditLogService.logAction(authentication.getName(), "UPDATE_ROLE", "USER", id, "Updated role to: " + newRole);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/admin/audit-logs")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get audit logs", description = "Retrieves admin audit logs (Admin only)")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogService.getAllAuditLogs());
    }

    @GetMapping("/admin/settings")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get admin settings", description = "Retrieves system admin settings (Admin only)")
    public ResponseEntity<List<AdminSetting>> getAdminSettings() {
        return ResponseEntity.ok(adminSettingRepository.findAll());
    }

    @PutMapping("/admin/settings")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update admin setting", description = "Updates or creates an admin setting (Admin only)")
    public ResponseEntity<AdminSetting> updateAdminSetting(@RequestBody Map<String, String> body, Authentication authentication) {
        String key = body.get("key");
        String value = body.get("value");
        String desc = body.get("description");

        AdminSetting setting = adminSettingRepository.findBySettingKey(key).orElseGet(AdminSetting::new);
        setting.setSettingKey(key);
        setting.setSettingValue(value);
        if (desc != null) {
            setting.setDescription(desc);
        }

        AdminSetting saved = adminSettingRepository.save(setting);
        auditLogService.logAction(authentication.getName(), "UPDATE_SETTING", "ADMIN_SETTING", saved.getId(), "Set " + key + "=" + value);
        return ResponseEntity.ok(saved);
    }
}
