package com.decisionhub.controller;

import com.decisionhub.dto.UpdateUserRequest;
import com.decisionhub.dto.UserRequest;
import com.decisionhub.dto.UserResponse;
import com.decisionhub.response.ApiResponse;
import com.decisionhub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User management endpoints for CRUD operations")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @GetMapping
    @Operation(summary = "Get all users", description = "Returns a paginated list of users with optional search")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved user list")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> getAllUsers(
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field and direction (e.g., createdAt,desc)", example = "createdAt,desc")
            @RequestParam(defaultValue = "createdAt,desc") String[] sort,
            @Parameter(description = "Filter by first name (optional)", example = "John")
            @RequestParam(required = false) String firstName,
            @Parameter(description = "Filter by last name (optional)", example = "Doe")
            @RequestParam(required = false) String lastName,
            @Parameter(description = "Filter by email (optional)", example = "john@example.com")
            @RequestParam(required = false) String email) {

        log.info("REST request to get all users with pagination and search");

        Sort sorting = Sort.by(Sort.Direction.fromString(sort.length > 1 ? sort[1] : "desc"), sort[0]);
        Pageable pageable = PageRequest.of(page, size, sorting);

        Page<UserResponse> users = userService.getAllUsers(pageable, firstName, lastName, email);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("Users retrieved successfully").data(users).build(),
                HttpStatus.OK
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Returns a single user by their unique ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User found")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    @PreAuthorize("hasRole('ROLE_ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse> getUserById(
            @Parameter(description = "UUID of the user to retrieve", required = true)
            @PathVariable UUID id) {
        log.info("REST request to get user : {}", id);
        UserResponse userResponse = userService.getUserById(id);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("User found").data(userResponse).build(),
                HttpStatus.OK
        );
    }

    @PostMapping
    @Operation(summary = "Create a new user", description = "Creates a new user with the provided details")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User created successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error or user already exists")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "User already exists")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> createUser(@Valid @RequestBody UserRequest userRequest) {
        log.info("REST request to create user: {}", userRequest.getEmail());
        UserResponse userResponse = userService.createUser(userRequest);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("User created successfully").data(userResponse).build(),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing user", description = "Updates user details for the given ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User updated successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email or phone already exists")
    @PreAuthorize("hasRole('ROLE_ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse> updateUser(
            @Parameter(description = "UUID of the user to update", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest updateUserRequest) {
        log.info("REST request to update user: {}", id);
        UserResponse userResponse = userService.updateUser(id, updateUserRequest);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("User updated successfully").data(userResponse).build(),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user", description = "Deletes the user with the given ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User deleted successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> deleteUser(
            @Parameter(description = "UUID of the user to delete", required = true)
            @PathVariable UUID id) {
        log.info("REST request to delete user: {}", id);
        userService.deleteUser(id);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("User deleted successfully").data(null).build(),
                HttpStatus.OK
        );
    }
}
