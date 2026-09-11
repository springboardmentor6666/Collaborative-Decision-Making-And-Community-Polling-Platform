package com.decisionhub.controller;

import com.decisionhub.common.enums.AccountStatus;
import com.decisionhub.common.response.ApiResponse;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.CreateAdminUserRequest;
import com.decisionhub.dto.request.UpdateUserRoleRequest;
import com.decisionhub.dto.response.AuditLogResponse;
import com.decisionhub.dto.response.UserResponse;
import com.decisionhub.security.UserPrincipal;
import com.decisionhub.service.AuditLogService;
import com.decisionhub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Operations", description = "Privileged administrator endpoints for user oversight and audit log inspection")
public class AdminController {

    private final UserService userService;
    private final AuditLogService auditLogService;

    @GetMapping("/users")
    @Operation(summary = "Get paginated roster of all registered system users")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<UserResponse> response = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/users/{userId}/status")
    @Operation(summary = "Update user account status (e.g. SUSPENDED, INACTIVE, ACTIVE)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam AccountStatus status,
            @RequestParam(required = false) String reason) {
        UserResponse response = userService.updateUserStatus(userId, status, reason);
        return ResponseEntity.ok(ApiResponse.success("User account status updated successfully", response));
    }

    @PostMapping("/users")
    @Operation(summary = "Create a new administrator, moderator, or staff account")
    public ResponseEntity<ApiResponse<UserResponse>> createAdminUser(
            @Valid @RequestBody CreateAdminUserRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse response = userService.createAdminUser(request, currentUser != null ? currentUser.getId() : null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Staff account created successfully", response));
    }

    @PatchMapping("/users/{userId}/role")
    @Operation(summary = "Promote or demote a user role (e.g. ROLE_ADMIN, ROLE_MODERATOR, ROLE_USER)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse response = userService.updateUserRole(userId, request.getRole(), currentUser != null ? currentUser.getId() : null);
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", response));
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Administratively delete a user account")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User account successfully deleted by administrator", null));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get system audit logs")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<AuditLogResponse> response = auditLogService.getAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
