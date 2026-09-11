package com.decisionhub.service;

import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.UserRequest;

import com.decisionhub.dto.response.DecisionResponse;
import com.decisionhub.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

public interface UserService {

    UserResponse getUserById(Long id);

    UserResponse getUserByUsername(String username);

    UserResponse updateProfile(Long userId, UserRequest request);

    void deleteUser(Long userId);

    UserResponse updateUserStatus(Long userId, com.decisionhub.common.enums.AccountStatus status, String reason);

    PagedResponse<UserResponse> getAllUsers(Pageable pageable);

    UserResponse createAdminUser(com.decisionhub.dto.request.CreateAdminUserRequest request, Long requestingAdminId);

    UserResponse updateUserRole(Long userId, com.decisionhub.common.enums.RoleType newRole, Long requestingAdminId);

    void saveDecision(Long userId, Long decisionId);

    void unsaveDecision(Long userId, Long decisionId);

    PagedResponse<DecisionResponse> getSavedDecisions(Long userId, Pageable pageable);

    void changePassword(Long userId, com.decisionhub.dto.request.ChangePasswordRequest request);

    com.decisionhub.dto.response.UserPreferencesResponse getPreferences(Long userId);

    com.decisionhub.dto.response.UserPreferencesResponse updatePreferences(Long userId, com.decisionhub.dto.request.UserPreferencesRequest request);

    com.decisionhub.dto.response.UserDataExportResponse exportUserData(Long userId);
}
