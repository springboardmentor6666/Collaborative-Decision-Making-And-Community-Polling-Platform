package com.decisionhub.service.impl;

import com.decisionhub.common.enums.AuthProvider;
import com.decisionhub.dto.request.ChangePasswordRequest;
import com.decisionhub.dto.request.UserPreferencesRequest;
import com.decisionhub.dto.response.UserDataExportResponse;
import com.decisionhub.dto.response.UserPreferencesResponse;
import com.decisionhub.dto.response.UserResponse;
import com.decisionhub.entity.User;
import com.decisionhub.entity.UserPreference;
import com.decisionhub.exception.BusinessException;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.mapper.DecisionMapper;
import com.decisionhub.mapper.UserMapper;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.SavedDecisionRepository;
import com.decisionhub.repository.UserPreferenceRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private DecisionRepository decisionRepository;
    @Mock
    private SavedDecisionRepository savedDecisionRepository;
    @Mock
    private CommunityRepository communityRepository;
    @Mock
    private CommunityMemberRepository communityMemberRepository;
    @Mock
    private UserPreferenceRepository userPreferenceRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserMapper userMapper;
    @Mock
    private DecisionMapper decisionMapper;

    @InjectMocks
    private UserServiceImpl userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .userId(1L)
                .fullName("John Doe")
                .username("johndoe")
                .email("john@example.com")
                .password("encoded_old_password")
                .provider(AuthProvider.LOCAL)
                .build();
    }

    @Test
    @DisplayName("getUserById - Success")
    void getUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        UserResponse response = UserResponse.builder().userId(1L).username("johndoe").build();
        when(userMapper.toResponse(sampleUser)).thenReturn(response);

        UserResponse result = userService.getUserById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("johndoe");
    }

    @Test
    @DisplayName("getUserById - Not Found")
    void getUserById_NotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("changePassword - Success")
    void changePassword_Success() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("oldPassword123")
                .newPassword("NewSecurePassword!123")
                .confirmPassword("NewSecurePassword!123")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("oldPassword123", "encoded_old_password")).thenReturn(true);
        when(passwordEncoder.matches("NewSecurePassword!123", "encoded_old_password")).thenReturn(false);
        when(passwordEncoder.encode("NewSecurePassword!123")).thenReturn("encoded_new_password");

        userService.changePassword(1L, request);

        assertThat(sampleUser.getPassword()).isEqualTo("encoded_new_password");
        verify(userRepository).save(sampleUser);
        verify(notificationService).sendNotification(eq(1L), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("changePassword - Passwords Mismatch")
    void changePassword_Mismatch() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("oldPassword123")
                .newPassword("NewSecurePassword!123")
                .confirmPassword("DifferentPassword!123")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        assertThatThrownBy(() -> userService.changePassword(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("do not match");
    }

    @Test
    @DisplayName("changePassword - Incorrect Current Password")
    void changePassword_IncorrectCurrentPassword() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("wrongPassword")
                .newPassword("NewSecurePassword!123")
                .confirmPassword("NewSecurePassword!123")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongPassword", "encoded_old_password")).thenReturn(false);

        assertThatThrownBy(() -> userService.changePassword(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Current password is incorrect");
    }

    @Test
    @DisplayName("getPreferences - Return Existing")
    void getPreferences_Existing() {
        UserPreference pref = UserPreference.builder()
                .id(10L)
                .user(sampleUser)
                .emailDigest("DAILY")
                .defaultVotingMode("PUBLIC")
                .timezone("America/New_York")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userPreferenceRepository.findByUserUserId(1L)).thenReturn(Optional.of(pref));

        UserPreferencesResponse response = userService.getPreferences(1L);

        assertThat(response).isNotNull();
        assertThat(response.getTimezone()).isEqualTo("America/New_York");
        assertThat(response.getEmailDigest()).isEqualTo("DAILY");
    }

    @Test
    @DisplayName("updatePreferences - Success")
    void updatePreferences_Success() {
        UserPreference pref = UserPreference.builder()
                .id(10L)
                .user(sampleUser)
                .emailDigest("DAILY")
                .defaultVotingMode("PUBLIC")
                .timezone("UTC")
                .build();

        UserPreferencesRequest request = UserPreferencesRequest.builder()
                .emailDigest("WEEKLY")
                .defaultVotingMode("ANONYMOUS")
                .timezone("Asia/Kolkata")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userPreferenceRepository.findByUserUserId(1L)).thenReturn(Optional.of(pref));
        when(userPreferenceRepository.save(any(UserPreference.class))).thenAnswer(i -> i.getArgument(0));

        UserPreferencesResponse response = userService.updatePreferences(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getEmailDigest()).isEqualTo("WEEKLY");
        assertThat(response.getDefaultVotingMode()).isEqualTo("ANONYMOUS");
        assertThat(response.getTimezone()).isEqualTo("Asia/Kolkata");
    }

    @Test
    @DisplayName("exportUserData - Success")
    void exportUserData_Success() {
        UserPreference pref = UserPreference.builder()
                .id(10L)
                .user(sampleUser)
                .emailDigest("DAILY")
                .defaultVotingMode("PUBLIC")
                .timezone("UTC")
                .build();

        UserResponse userResponse = UserResponse.builder().userId(1L).username("johndoe").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userMapper.toResponse(sampleUser)).thenReturn(userResponse);
        when(userPreferenceRepository.findByUserUserId(1L)).thenReturn(Optional.of(pref));
        when(decisionRepository.countByCreatedByUserId(1L)).thenReturn(5L);
        when(savedDecisionRepository.countByUserUserId(1L)).thenReturn(12L);
        when(communityMemberRepository.countByUserUserIdAndStatus(eq(1L), any())).thenReturn(3L);

        UserDataExportResponse export = userService.exportUserData(1L);

        assertThat(export).isNotNull();
        assertThat(export.getProfile().getUsername()).isEqualTo("johndoe");
        assertThat(export.getTotalCreatedDecisions()).isEqualTo(5L);
        assertThat(export.getTotalSavedDecisions()).isEqualTo(12L);
        assertThat(export.getTotalCommunitiesJoined()).isEqualTo(3L);
    }
}
