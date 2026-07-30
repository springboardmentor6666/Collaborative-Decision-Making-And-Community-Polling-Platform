package com.decisionhub.service.impl;

import com.decisionhub.dto.UpdateUserRequest;
import com.decisionhub.dto.UserRequest;
import com.decisionhub.dto.UserResponse;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.exception.BadRequestException;
import com.decisionhub.exception.ConflictException;
import com.decisionhub.exception.ResourceNotFoundException;
import com.decisionhub.repository.RoleRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.UserService;
import com.decisionhub.util.AppConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserResponse createUser(UserRequest userRequest) {
        log.info("Creating new user with email: {}", userRequest.getEmail());

        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new ConflictException(AppConstants.USER_ALREADY_EXISTS);
        }

        if (userRequest.getPhone() != null && !userRequest.getPhone().isBlank()
                && userRepository.existsByPhone(userRequest.getPhone())) {
            throw new ConflictException(AppConstants.USER_PHONE_ALREADY_EXISTS);
        }

        User user = new User();
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setEmail(userRequest.getEmail());
        user.setPhone(userRequest.getPhone());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setProvider(AppConstants.PROVIDER_LOCAL);
        user.setEnabled(true);
        user.setAccountLocked(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.ROLE_NOT_FOUND));
        user.setRoles(Collections.singletonList(userRole));

        User savedUser = userRepository.save(user);
        log.info("User created successfully with id: {}", savedUser.getId());

        return mapToUserResponse(savedUser);
    }

    @Override
    public UserResponse getUserById(UUID id) {
        log.info("Fetching user with id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
        return mapToUserResponse(user);
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable, String firstName, String lastName, String email) {
        log.info("Fetching users with pagination and search");
        Page<User> userPage = userRepository.searchUsers(
                firstName != null && !firstName.isBlank() ? firstName : null,
                lastName != null && !lastName.isBlank() ? lastName : null,
                email != null && !email.isBlank() ? email : null,
                pageable
        );
        return userPage.map(this::mapToUserResponse);
    }

    @Override
    public UserResponse updateUser(UUID id, UpdateUserRequest updateUserRequest) {
        log.info("Updating user with id: {}", id);
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));

        if (userRepository.existsByEmailAndIdNot(updateUserRequest.getEmail(), id)) {
            throw new ConflictException(AppConstants.USER_ALREADY_EXISTS);
        }

        if (updateUserRequest.getPhone() != null && !updateUserRequest.getPhone().isBlank()
                && userRepository.existsByPhoneAndIdNot(updateUserRequest.getPhone(), id)) {
            throw new ConflictException(AppConstants.USER_PHONE_ALREADY_EXISTS);
        }

        existingUser.setFirstName(updateUserRequest.getFirstName());
        existingUser.setLastName(updateUserRequest.getLastName());
        existingUser.setEmail(updateUserRequest.getEmail());
        existingUser.setPhone(updateUserRequest.getPhone());
        existingUser.setUpdatedAt(LocalDateTime.now());

        if (updateUserRequest.getPassword() != null && !updateUserRequest.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(updateUserRequest.getPassword()));
        }

        User updatedUser = userRepository.save(existingUser);
        log.info("User updated successfully with id: {}", updatedUser.getId());

        return mapToUserResponse(updatedUser);
    }

    @Override
    public void deleteUser(UUID id) {
        log.info("Deleting user with id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
        userRepository.delete(user);
        log.info("User deleted successfully with id: {}", id);
    }

    private UserResponse mapToUserResponse(User user) {
        Set<String> roles = user.getRoles() != null ?
                user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()) :
                Collections.emptySet();

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .provider(user.getProvider())
                .enabled(user.getEnabled())
                .accountLocked(user.getAccountLocked())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
