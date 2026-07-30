package com.decisionhub.service.impl;

import com.decisionhub.dto.ProfileResponse;
import com.decisionhub.dto.ProfileUpdateRequest;
import com.decisionhub.entity.User;
import com.decisionhub.exception.BadRequestException;
import com.decisionhub.exception.ConflictException;
import com.decisionhub.exception.ResourceNotFoundException;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.ProfileService;
import com.decisionhub.util.AppConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class ProfileServiceImpl implements ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public ProfileResponse getCurrentUserProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Fetching profile for current user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return mapToProfileResponse(user);
    }

    @Override
    public ProfileResponse updateCurrentUserProfile(ProfileUpdateRequest profileUpdateRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Updating profile for current user: {}", email);

        User existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (profileUpdateRequest.getPhone() != null && !profileUpdateRequest.getPhone().isBlank()
                && userRepository.existsOtherUserWithPhone(profileUpdateRequest.getPhone(), existingUser.getId())) {
            throw new ConflictException(AppConstants.USER_PHONE_ALREADY_EXISTS);
        }

        existingUser.setFirstName(profileUpdateRequest.getFirstName());
        existingUser.setLastName(profileUpdateRequest.getLastName());
        existingUser.setPhone(profileUpdateRequest.getPhone());
        existingUser.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(existingUser);
        log.info("Profile updated successfully for user: {}", email);

        return mapToProfileResponse(updatedUser);
    }

    private ProfileResponse mapToProfileResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
