package com.monika.usermanagement.controller;

import com.monika.usermanagement.dto.AssignRoleRequest;
import com.monika.usermanagement.dto.AssignRoleResponse;
import com.monika.usermanagement.dto.RoleRequest;
import com.monika.usermanagement.dto.RoleResponse;
import com.monika.usermanagement.response.ApiResponse;
import com.monika.usermanagement.service.RoleService;
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
public class RoleController {

    private static final Logger log = LoggerFactory.getLogger(RoleController.class);

    @Autowired
    private RoleService roleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createRole(@Valid @RequestBody RoleRequest roleRequest) {
        log.info("REST request to create role: {}", roleRequest.getName());
        RoleResponse roleResponse = roleService.createRole(roleRequest);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Role created successfully")
                        .data(roleResponse)
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllRoles() {
        log.info("REST request to get all roles");
        List<RoleResponse> roles = roleService.getAllRoles();
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Roles retrieved successfully")
                        .data(roles)
                        .build(),
                HttpStatus.OK
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getRoleById(@PathVariable UUID id) {
        log.info("REST request to get role : {}", id);
        RoleResponse roleResponse = roleService.getRoleById(id);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Role retrieved successfully")
                        .data(roleResponse)
                        .build(),
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateRole(@PathVariable UUID id, @Valid @RequestBody RoleRequest roleRequest) {
        log.info("REST request to update role : {}", id);
        RoleResponse roleResponse = roleService.updateRole(id, roleRequest);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Role updated successfully")
                        .data(roleResponse)
                        .build(),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteRole(@PathVariable UUID id) {
        log.info("REST request to delete role : {}", id);
        roleService.deleteRole(id);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Role deleted successfully")
                        .data(null)
                        .build(),
                HttpStatus.OK
        );
    }

    @PostMapping("/assign-to-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> assignRoleToUser(@Valid @RequestBody AssignRoleRequest assignRoleRequest) {
        log.info("REST request to assign role {} to user {}", assignRoleRequest.getRoleName(), assignRoleRequest.getUserId());
        AssignRoleResponse response = roleService.assignRoleToUser(assignRoleRequest);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Role assigned to user successfully")
                        .data(response)
                        .build(),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/remove-from-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> removeRoleFromUser(@Valid @RequestBody AssignRoleRequest assignRoleRequest) {
        log.info("REST request to remove role {} from user {}", assignRoleRequest.getRoleName(), assignRoleRequest.getUserId());
        roleService.removeRoleFromUser(assignRoleRequest);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Role removed from user successfully")
                        .data(null)
                        .build(),
                HttpStatus.OK
        );
    }
}