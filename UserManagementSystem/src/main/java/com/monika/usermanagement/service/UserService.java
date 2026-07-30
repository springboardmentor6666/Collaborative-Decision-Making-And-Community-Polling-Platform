package com.monika.usermanagement.service;

import com.monika.usermanagement.dto.UpdateUserRequest;
import com.monika.usermanagement.dto.UserRequest;
import com.monika.usermanagement.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {

    UserResponse createUser(UserRequest userRequest);

    UserResponse getUserById(UUID id);

    Page<UserResponse> getAllUsers(Pageable pageable, String firstName, String lastName, String email);

    UserResponse updateUser(UUID id, UpdateUserRequest updateUserRequest);

    void deleteUser(UUID id);
}