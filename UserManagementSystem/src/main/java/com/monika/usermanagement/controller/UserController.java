package com.monika.usermanagement.controller;

import com.monika.usermanagement.dto.UpdateUserRequest;
import com.monika.usermanagement.dto.UserRequest;
import com.monika.usermanagement.dto.UserResponse;
import com.monika.usermanagement.response.ApiResponse;
import com.monika.usermanagement.service.UserService;
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
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse> createUser(@Valid @RequestBody UserRequest userRequest) {
        log.info("REST request to create user: {}", userRequest.getEmail());
        UserResponse userResponse = userService.createUser(userRequest);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("User created successfully")
                        .data(userResponse)
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getUserById(@PathVariable UUID id) {
        log.info("REST request to get user : {}", id);
        UserResponse userResponse = userService.getUserById(id);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("User retrieved successfully")
                        .data(userResponse)
                        .build(),
                HttpStatus.OK
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String email) {

        log.info("REST request to get all users with pagination and search");

        Sort sorting = Sort.by(Sort.Direction.fromString(sort[1]), sort[0]);
        Pageable pageable = PageRequest.of(page, size, sorting);

        Page<UserResponse> users = userService.getAllUsers(pageable, firstName, lastName, email);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Users retrieved successfully")
                        .data(users)
                        .build(),
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateUser(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest updateUserRequest) {
        log.info("REST request to update user : {}", id);
        UserResponse userResponse = userService.updateUser(id, updateUserRequest);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("User updated successfully")
                        .data(userResponse)
                        .build(),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable UUID id) {
        log.info("REST request to delete user : {}", id);
        userService.deleteUser(id);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("User deleted successfully")
                        .data(null)
                        .build(),
                HttpStatus.OK
        );
    }
}