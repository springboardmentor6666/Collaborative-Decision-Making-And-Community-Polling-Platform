package com.decisionhub.backend.service;

import com.decisionhub.backend.entity.Role;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminAccountBootstrapTest {

    @Test
    void shouldCreateAdminUserWhenMissing() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

        when(userRepository.findByEmail("admin@decisionhub.local")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Admin@123")).thenReturn("encoded-admin-password");

        AdminAccountBootstrap bootstrap = new AdminAccountBootstrap(
                userRepository,
                passwordEncoder,
                "DecisionHub Admin",
                "admin@decisionhub.local",
                "Admin@123"
        );

        bootstrap.bootstrap();

        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldPromoteExistingUserToAdminRole() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

        User existingUser = User.builder()
                .id(7L)
                .name("Existing User")
                .email("admin@decisionhub.local")
                .password("old-password")
                .role(Role.USER)
                .build();

        when(userRepository.findByEmail("admin@decisionhub.local")).thenReturn(Optional.of(existingUser));

        AdminAccountBootstrap bootstrap = new AdminAccountBootstrap(
                userRepository,
                passwordEncoder,
                "DecisionHub Admin",
                "admin@decisionhub.local",
                "Admin@123"
        );

        bootstrap.bootstrap();

        assertEquals(Role.ADMIN, existingUser.getRole());
        verify(userRepository).save(existingUser);
    }
}
