package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.UpdateProfileRequest;
import com.decisionhub.backend.dto.UserProfileResponse;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.exception.CustomException;
import com.decisionhub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;

    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        return toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        if (req.getFullName() != null) {
            user.setFullName(req.getFullName());
        }
        if (req.getInterests() != null) {
            user.setInterests(req.getInterests());
        }
        if (req.getProfilePicture() != null) {
            user.setProfilePicture(req.getProfilePicture());
        }

        User updated = userRepository.save(user);
        return toProfileResponse(updated);
    }

    private UserProfileResponse toProfileResponse(User user) {
        UserProfileResponse res = new UserProfileResponse();
        res.setId(user.getId());
        res.setUsername(user.getUsername());
        res.setEmail(user.getEmail());
        res.setFullName(user.getFullName());
        res.setProfilePicture(user.getProfilePicture());
        res.setRole(user.getRole());
        res.setInterests(user.getInterests());
        res.setCreatedAt(user.getCreatedAt());
        return res;
    }
}
