package com.decisionhub.service;

import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.UserRequest;

import com.decisionhub.dto.response.DecisionResponse;
import com.decisionhub.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {

    UserResponse getUserById(Long id);

    UserResponse getUserByUsername(String username);

    UserResponse updateProfile(Long userId, UserRequest request);

    void deleteUser(Long userId);

    PagedResponse<UserResponse> getAllUsers(Pageable pageable);



    void saveDecision(Long userId, Long decisionId);

    void unsaveDecision(Long userId, Long decisionId);

    PagedResponse<DecisionResponse> getSavedDecisions(Long userId, Pageable pageable);
}
