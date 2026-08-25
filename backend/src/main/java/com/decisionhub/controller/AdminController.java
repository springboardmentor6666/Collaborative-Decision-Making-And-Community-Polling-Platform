package com.decisionhub.controller;

import com.decisionhub.dto.UserResponse;
import com.decisionhub.entity.AdminSetting;
import com.decisionhub.entity.AuditLog;
import com.decisionhub.entity.Report;
import com.decisionhub.repository.AdminSettingRepository;
import com.decisionhub.repository.ReportRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.AuditLogService;
import com.decisionhub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Admin & Moderation", description = "Endpoints for platform administration, user management, content reporting, and settings")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserService userService;
    private final AuditLogService auditLogService;
    private final ReportRepository reportRepository;
    private final AdminSettingRepository adminSettingRepository;
    private final UserRepository userRepository;

    public AdminController(UserService userService,
                           AuditLogService auditLogService,
                           ReportRepository reportRepository,
                           AdminSettingRepository adminSettingRepository,
                           UserRepository userRepository) {
        this.userService = userService;
        this.auditLogService = auditLogService;
        this.reportRepository = reportRepository;
        this.adminSettingRepository = adminSettingRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/admin/users/{id}/ban")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_MODERATOR')")
    @Operation(summary = "Ban/Deactivate user", description = "Deactivates a user account (Admin/Moderator only)")
    public ResponseEntity<UserResponse> banUser(@PathVariable Long id, Authentication authentication) {
        UserResponse user = userService.setUserActiveStatus(id, false, authentication.getName());
        auditLogService.logAction(authentication.getName(), "BAN_USER", "USER", id, "Deactivated user account");
        return ResponseEntity.ok(user);
    }

    @PostMapping("/admin/users/{id}/unban")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_MODERATOR')")
    @Operation(summary = "Unban/Reactivate user", description = "Reactivates a user account (Admin/Moderator only)")
    public ResponseEntity<UserResponse> unbanUser(@PathVariable Long id, Authentication authentication) {
        UserResponse user = userService.setUserActiveStatus(id, true, authentication.getName());
        auditLogService.logAction(authentication.getName(), "UNBAN_USER", "USER", id, "Reactivated user account");
        return ResponseEntity.ok(user);
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

    @PostMapping("/reports")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Report content", description = "Submits a content report for moderation")
    public ResponseEntity<Report> submitReport(@RequestBody Map<String, Object> body, Authentication authentication) {
        String reporterEmail = authentication.getName();
        com.decisionhub.entity.User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + reporterEmail));

        Report report = new Report();
        report.setReporter(reporter);
        report.setReason((String) body.get("reason"));
        report.setContentType((String) body.get("contentType"));
        if (body.get("contentId") != null) {
            report.setContentId(Long.valueOf(body.get("contentId").toString()));
        }
        if (body.get("reportedUserId") != null) {
            userRepository.findById(Long.valueOf(body.get("reportedUserId").toString())).ifPresent(report::setReportedUser);
        }

        Report saved = reportRepository.save(report);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_MODERATOR')")
    @Operation(summary = "Get content reports", description = "Retrieves pending content reports (Admin/Moderator only)")
    public ResponseEntity<List<Report>> getReports() {
        return ResponseEntity.ok(reportRepository.findByStatus("PENDING"));
    }

    @PutMapping("/reports/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_MODERATOR')")
    @Operation(summary = "Resolve report", description = "Marks a report as resolved (Admin/Moderator only)")
    public ResponseEntity<Report> resolveReport(@PathVariable Long id, Authentication authentication) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with id: " + id));

        report.setStatus("RESOLVED");
        Report saved = reportRepository.save(report);
        auditLogService.logAction(authentication.getName(), "RESOLVE_REPORT", "REPORT", id, "Resolved content report");
        return ResponseEntity.ok(saved);
    }
}
