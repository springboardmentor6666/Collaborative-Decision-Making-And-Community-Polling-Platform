package com.decisionhub.config;

import com.decisionhub.common.enums.AccountStatus;
import com.decisionhub.common.enums.AuthProvider;
import com.decisionhub.common.enums.RoleType;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.entity.UserPreference;
import com.decisionhub.repository.RoleRepository;
import com.decisionhub.repository.UserPreferenceRepository;
import com.decisionhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;

/**
 * Production-ready Initial Administrator Seeder.
 *
 * Reads admin credentials safely from environment variables (never hardcoded in source code).
 * If ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD are provided, it idempotently creates
 * or promotes the administrator account with BCrypt password hashing.
 */
@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class InitialAdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${application.initial-admin.enabled:true}")
    private boolean enabled;

    @Value("${application.initial-admin.email:admin@decisionhub.com}")
    private String adminEmail;

    @Value("${application.initial-admin.password:Admin123!}")
    private String adminPassword;

    @Value("${application.initial-admin.username:admin}")
    private String adminUsername;

    @Value("${application.initial-admin.full-name:System Administrator}")
    private String adminFullName;

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled) {
            log.debug("Initial admin seeder is disabled.");
            return;
        }

        if (!StringUtils.hasText(adminEmail) || !StringUtils.hasText(adminPassword)) {
            log.info("No ADMIN_INITIAL_EMAIL or ADMIN_INITIAL_PASSWORD provided. Skipping initial admin seeding.");
            return;
        }

        String normalizedEmail = adminEmail.trim().toLowerCase();
        String normalizedUsername = StringUtils.hasText(adminUsername) ? adminUsername.trim() : "admin";

        Optional<User> existingByEmail = userRepository.findByEmail(normalizedEmail);
        if (existingByEmail.isPresent()) {
            User existing = existingByEmail.get();
            if (existing.getRole() != null && RoleType.ROLE_ADMIN.equals(existing.getRole().getRoleName())) {
                log.info("Administrator account with email '{}' already exists. Skipping creation.", normalizedEmail);
            } else {
                Role adminRole = getOrCreateAdminRole();
                existing.setRole(adminRole);
                userRepository.save(existing);
                log.info("Existing user with email '{}' was safely promoted to ROLE_ADMIN.", normalizedEmail);
            }
            return;
        }

        // Avoid username collisions if username already taken by another account
        String finalUsername = normalizedUsername;
        if (userRepository.existsByUsername(finalUsername)) {
            finalUsername = normalizedUsername + "_" + (System.currentTimeMillis() % 1000);
        }

        Role adminRole = getOrCreateAdminRole();

        User adminUser = User.builder()
                .username(finalUsername)
                .email(normalizedEmail)
                .fullName(StringUtils.hasText(adminFullName) ? adminFullName.trim() : "System Administrator")
                .password(passwordEncoder.encode(adminPassword.trim()))
                .role(adminRole)
                .provider(AuthProvider.LOCAL)
                .accountStatus(AccountStatus.ACTIVE)
                .emailVerified(true)
                .build();

        User savedAdmin = userRepository.save(adminUser);

        // Initialize user preferences
        userPreferenceRepository.save(UserPreference.builder()
                .user(savedAdmin)
                .build());

        log.info("Successfully provisioned initial administrator account (username: '{}', email: '{}').",
                savedAdmin.getUsername(), savedAdmin.getEmail());
    }

    private Role getOrCreateAdminRole() {
        return roleRepository.findByRoleName(RoleType.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName(RoleType.ROLE_ADMIN)
                        .description("Super Administrator Access Role")
                        .build()));
    }
}
