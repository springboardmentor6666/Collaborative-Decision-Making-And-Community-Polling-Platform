package com.decisionhub.service.impl;

import com.decisionhub.common.enums.AccountStatus;
import com.decisionhub.common.enums.AuthProvider;
import com.decisionhub.common.enums.RoleType;
import com.decisionhub.dto.request.AuthRequest;
import com.decisionhub.dto.request.GoogleAuthRequest;
import com.decisionhub.dto.request.RegisterRequest;
import com.decisionhub.dto.response.AuthResponse;
import com.decisionhub.dto.response.UserResponse;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.exception.DuplicateException;
import com.decisionhub.exception.UnauthorizedException;
import com.decisionhub.mapper.UserMapper;
import com.decisionhub.repository.BlacklistedTokenRepository;
import com.decisionhub.repository.RoleRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.UserPrincipal;
import com.decisionhub.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private UserMapper userMapper;
    @Mock
    private BlacklistedTokenRepository blacklistedTokenRepository;
    @Mock
    private com.decisionhub.service.AuditLogService auditLogService;

    @InjectMocks
    private AuthServiceImpl authService;

    private Role userRole;
    private User user;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        userRole = Role.builder()
                .roleId(1L)
                .roleName(RoleType.ROLE_USER)
                .description("Standard User Role")
                .build();

        user = User.builder()
                .userId(1L)
                .fullName("Test User")
                .username("testuser")
                .email("test@decisionhub.com")
                .password("encoded_pass")
                .role(userRole)
                .provider(AuthProvider.LOCAL)
                .accountStatus(AccountStatus.ACTIVE)
                .emailVerified(false)
                .build();

        userResponse = UserResponse.builder()
                .userId(1L)
                .fullName("Test User")
                .username("testuser")
                .email("test@decisionhub.com")
                .provider(AuthProvider.LOCAL)
                .accountStatus(AccountStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Should register new user successfully")
    void register_Success() {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Test User")
                .username("testuser")
                .email("test@decisionhub.com")
                .password("password123")
                .build();

        when(userRepository.existsByUsernameIncludingDeleted("testuser")).thenReturn(false);
        when(userRepository.existsByEmailIncludingDeleted("test@decisionhub.com")).thenReturn(false);
        when(roleRepository.findByRoleName(RoleType.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(userMapper.toEntity(request)).thenReturn(user);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(userResponse);

        UserResponse result = authService.register(request);

        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("testuser");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateException when username is taken")
    void register_DuplicateUsername_ThrowsException() {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Test User")
                .username("testuser")
                .email("test@decisionhub.com")
                .password("password123")
                .build();

        when(userRepository.existsByUsernameIncludingDeleted("testuser")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateException.class)
                .hasMessageContaining("Username 'testuser' is already taken");
    }

    @Test
    @DisplayName("Should login user successfully and return tokens")
    void login_Success() {
        AuthRequest request = AuthRequest.builder()
                .usernameOrEmail("testuser")
                .password("password123")
                .build();

        UserPrincipal principal = UserPrincipal.create(1L, "testuser", "test@decisionhub.com", "encoded_pass", "ROLE_USER", true, false);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(jwtTokenProvider.generateAccessToken(principal)).thenReturn("mock_access_token");
        when(jwtTokenProvider.generateRefreshToken(principal)).thenReturn("mock_refresh_token");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(userResponse);

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("mock_access_token");
        assertThat(response.getRefreshToken()).isEqualTo("mock_refresh_token");
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when invalid Google token is provided")
    void googleLogin_InvalidToken_ThrowsUnauthorizedException() {
        GoogleAuthRequest request = GoogleAuthRequest.builder()
                .idToken("invalid_fake_token_12345")
                .build();

        assertThatThrownBy(() -> authService.googleLogin(request))
                .isInstanceOf(UnauthorizedException.class);
    }
}
