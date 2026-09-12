package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.UserProfileDTO;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private VoteRepository voteRepository;

    public UserProfileDTO getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        long createdDecisions = decisionRepository.countByUserId(user.getId());
        long votesCast = voteRepository.countByUserId(user.getId());

        return new UserProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getInterests(),
                user.getProfilePicture(),
                createdDecisions,
                votesCast
        );
    }

    public UserProfileDTO updateUserProfile(String username, UserProfileDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getInterests() != null) user.setInterests(dto.getInterests());
        if (dto.getProfilePicture() != null) user.setProfilePicture(dto.getProfilePicture());

        User updated = userRepository.save(user);
        return getUserProfile(updated.getUsername());
    }
}
