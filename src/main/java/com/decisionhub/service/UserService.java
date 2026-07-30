package com.decisionhub.service;

import com.decisionhub.dto.UpdateUserRequest;
import com.decisionhub.dto.UserRequest;
import com.decisionhub.dto.UserResponse;
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
