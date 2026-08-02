package com.decisionhub.service.impl;

import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.UserRequest;

import com.decisionhub.dto.response.DecisionResponse;
import com.decisionhub.dto.response.UserResponse;

import com.decisionhub.entity.Decision;
import com.decisionhub.entity.SavedDecision;
import com.decisionhub.entity.User;

import com.decisionhub.exception.DuplicateException;
import com.decisionhub.exception.EntityNotFoundException;

import com.decisionhub.mapper.DecisionMapper;
import com.decisionhub.mapper.UserMapper;

import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.SavedDecisionRepository;

import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final DecisionRepository decisionRepository;

    private final SavedDecisionRepository savedDecisionRepository;
    private final UserMapper userMapper;

    private final DecisionMapper decisionMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", id));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User", "username", username));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        if (request.getBio() != null) user.setBio(request.getBio());

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<UserResponse> users = userRepository.findAll(pageable).map(userMapper::toResponse);
        return PagedResponse.fromPage(users);
    }



    @Override
    @Transactional
    public void saveDecision(Long userId, Long decisionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));

        if (savedDecisionRepository.existsByUserUserIdAndDecisionDecisionId(userId, decisionId)) {
            throw new DuplicateException("Decision is already saved.");
        }

        savedDecisionRepository.save(SavedDecision.builder().user(user).decision(decision).build());
    }

    @Override
    @Transactional
    public void unsaveDecision(Long userId, Long decisionId) {
        savedDecisionRepository.deleteByUserUserIdAndDecisionDecisionId(userId, decisionId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DecisionResponse> getSavedDecisions(Long userId, Pageable pageable) {
        Page<DecisionResponse> page = savedDecisionRepository.findByUserUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(saved -> decisionMapper.toResponse(saved.getDecision()));
        return PagedResponse.fromPage(page);
    }
}
