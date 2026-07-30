package com.monika.usermanagement.service.impl;

import com.monika.usermanagement.dto.ProfileResponse;
import com.monika.usermanagement.dto.ProfileUpdateRequest;
import com.monika.usermanagement.entity.User;
import com.monika.usermanagement.exception.BadRequestException;
import com.monika.usermanagement.exception.ResourceNotFoundException;
import com.monika.usermanagement.mapper.UserMapper;
import com.monika.usermanagement.repository.UserRepository;
import com.monika.usermanagement.service.ProfileService;
import com.monika.usermanagement.util.AppConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class ProfileServiceImpl implements ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Override
    public ProfileResponse getCurrentUserProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Fetching profile for current user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return userMapper.toProfileResponse(user);
    }

    @Override
    public ProfileResponse updateCurrentUserProfile(ProfileUpdateRequest profileUpdateRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Updating profile for current user: {}", email);

        User existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        UUID currentUserId = existingUser.getId();

        if (userRepository.existsByPhone(profileUpdateRequest.getPhone())
                && !existingUser.getPhone().equals(profileUpdateRequest.getPhone())) {
            throw new BadRequestException(AppConstants.USER_PHONE_ALREADY_EXISTS);
        }

        existingUser.setFirstName(profileUpdateRequest.getFirstName());
        existingUser.setLastName(profileUpdateRequest.getLastName());
        existingUser.setPhone(profileUpdateRequest.getPhone());
        existingUser.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(existingUser);
        log.info("Profile updated successfully for user: {}", email);

        return userMapper.toProfileResponse(updatedUser);
    }
}
