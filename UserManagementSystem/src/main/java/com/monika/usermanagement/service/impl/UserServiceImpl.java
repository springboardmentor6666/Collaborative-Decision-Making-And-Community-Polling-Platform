package com.monika.usermanagement.service.impl;

import com.monika.usermanagement.dto.UpdateUserRequest;
import com.monika.usermanagement.dto.UserRequest;
import com.monika.usermanagement.dto.UserResponse;
import com.monika.usermanagement.entity.Role;
import com.monika.usermanagement.entity.User;
import com.monika.usermanagement.exception.BadRequestException;
import com.monika.usermanagement.exception.ResourceNotFoundException;
import com.monika.usermanagement.mapper.UserMapper;
import com.monika.usermanagement.repository.RoleRepository;
import com.monika.usermanagement.repository.UserRepository;
import com.monika.usermanagement.service.UserService;
import com.monika.usermanagement.util.AppConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserResponse createUser(UserRequest userRequest) {
        log.info("Creating new user with email: {}", userRequest.getEmail());

        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new BadRequestException(AppConstants.USER_ALREADY_EXISTS);
        }

        if (userRequest.getPhone() != null && userRepository.existsByPhone(userRequest.getPhone())) {
            throw new BadRequestException(AppConstants.USER_PHONE_ALREADY_EXISTS);
        }

        User user = userMapper.toEntity(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setPhone(userRequest.getPhone());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setEnabled(true);
        user.setAccountLocked(false);

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.ROLE_NOT_FOUND));
        user.setRoles(java.util.Collections.singletonList(userRole));

        User savedUser = userRepository.save(user);
        log.info("User created successfully with id: {}", savedUser.getId());

        return userMapper.toResponse(savedUser);
    }

    @Override
    public UserResponse getUserById(UUID id) {
        log.info("Fetching user with id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
        return userMapper.toResponse(user);
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
        return userPage.map(userMapper::toResponse);
    }

    @Override
    public UserResponse updateUser(UUID id, UpdateUserRequest updateUserRequest) {
        log.info("Updating user with id: {}", id);
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));

        if (userRepository.existsByEmailAndIdNot(updateUserRequest.getEmail(), id)) {
            throw new BadRequestException(AppConstants.USER_ALREADY_EXISTS);
        }

        if (updateUserRequest.getPhone() != null && userRepository.existsByPhoneAndIdNot(updateUserRequest.getPhone(), id)) {
            throw new BadRequestException(AppConstants.USER_PHONE_ALREADY_EXISTS);
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

        return userMapper.toResponse(updatedUser);
    }

    @Override
    public void deleteUser(UUID id) {
        log.info("Deleting user with id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.USER_NOT_FOUND));
        userRepository.delete(user);
        log.info("User deleted successfully with id: {}", id);
    }
}