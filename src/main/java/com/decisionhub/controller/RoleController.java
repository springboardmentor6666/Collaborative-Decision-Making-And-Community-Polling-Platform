package com.decisionhub.controller;

import com.decisionhub.dto.AssignRoleRequest;
import com.decisionhub.dto.AssignRoleResponse;
import com.decisionhub.dto.RoleRequest;
import com.decisionhub.dto.RoleResponse;
import com.decisionhub.response.ApiResponse;
import com.decisionhub.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
@Tag(name = "Roles", description = "Role management endpoints for system roles")
public class RoleController {

    private static final Logger log = LoggerFactory.getLogger(RoleController.class);

    @Autowired
    private RoleService roleService;

    @PostMapping
    @Operation(summary = "Create a new role", description = "Creates a new role with the provided name and description")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Role created successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Role already exists")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> createRole(@Valid @RequestBody RoleRequest roleRequest) {
        log.info("REST request to create role: {}", roleRequest.getName());
        RoleResponse roleResponse = roleService.createRole(roleRequest);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("Role created successfully").data(roleResponse).build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    @Operation(summary = "Get all roles", description = "Returns a list of all roles in the system")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved role list")
    public ResponseEntity<ApiResponse> getAllRoles() {
        log.info("REST request to get all roles");
        List<RoleResponse> roles = roleService.getAllRoles();
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("Roles retrieved successfully").data(roles).build(),
                HttpStatus.OK
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get role by ID", description = "Returns a single role by its unique ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Role found")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Role not found")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> getRoleById(
            @Parameter(description = "UUID of the role to retrieve", required = true)
            @PathVariable UUID id) {
        log.info("REST request to get role : {}", id);
        RoleResponse roleResponse = roleService.getRoleById(id);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("Role found").data(roleResponse).build(),
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing role", description = "Updates role details for the given ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Role updated successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Role not found")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Role name already exists")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> updateRole(
            @Parameter(description = "UUID of the role to update", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody RoleRequest roleRequest) {
        log.info("REST request to update role : {}", id);
        RoleResponse roleResponse = roleService.updateRole(id, roleRequest);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("Role updated successfully").data(roleResponse).build(),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a role", description = "Deletes the role with the given ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Role deleted successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Role not found")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> deleteRole(
            @Parameter(description = "UUID of the role to delete", required = true)
            @PathVariable UUID id) {
        log.info("REST request to delete role: {}", id);
        roleService.deleteRole(id);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("Role deleted successfully").data(null).build(),
                HttpStatus.OK
        );
    }

    @PostMapping("/assign-to-user")
    @Operation(summary = "Assign a role to a user", description = "Assigns an existing role to a user by user ID and role name")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Role assigned to user successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request or already assigned")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User or role not found")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> assignRoleToUser(@Valid @RequestBody AssignRoleRequest assignRoleRequest) {
        log.info("REST request to assign role {} to user {}", assignRoleRequest.getRoleName(), assignRoleRequest.getUserId());
        AssignRoleResponse response = roleService.assignRoleToUser(assignRoleRequest);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("Role assigned to user successfully").data(response).build(),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/remove-from-user")
    @Operation(summary = "Remove a role from a user", description = "Removes an existing role from a user by user ID and role name")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Role removed from user successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request or role not assigned")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User or role not found")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> removeRoleFromUser(@Valid @RequestBody AssignRoleRequest assignRoleRequest) {
        log.info("REST request to remove role {} from user {}", assignRoleRequest.getRoleName(), assignRoleRequest.getUserId());
        roleService.removeRoleFromUser(assignRoleRequest);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("Role removed from user successfully").data(null).build(),
                HttpStatus.OK
        );
    }
}
