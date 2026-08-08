package com.decisionhub.service;

import com.decisionhub.dto.AuthResponse;
import com.decisionhub.entity.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceOAuthTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    @Test
    void processOAuthLoginLinksExistingLocalAccountByEmail() {
        User existingUser = new User();
        existingUser.setId(21L);
        existingUser.setEmail("oauth@example.com");
        existingUser.setFullName("Existing User");
        existingUser.setPasswordHash("hash");
        existingUser.setProvider("LOCAL");

        when(userRepository.findByProviderAndProviderId("GOOGLE", "google-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("oauth@example.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode(any())).thenReturn("encoded-password");
        when(jwtUtil.generateToken("oauth@example.com")).thenReturn("jwt-token");

        AuthResponse response = userService.processOAuthLogin("GOOGLE", "google-123", "oauth@example.com", "Existing User", "https://avatar.test/pic");

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertNotNull(response.getUser());
        assertEquals("GOOGLE", existingUser.getProvider());
        assertEquals("google-123", existingUser.getProviderId());
        assertEquals("https://avatar.test/pic", existingUser.getProfileImage());
    }
}
