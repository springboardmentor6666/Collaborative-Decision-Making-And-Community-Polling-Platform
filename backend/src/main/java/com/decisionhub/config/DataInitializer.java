package com.decisionhub.config;

import com.decisionhub.common.enums.AccountStatus;
import com.decisionhub.common.enums.AuthProvider;
import com.decisionhub.common.enums.RoleType;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.repository.RoleRepository;
import com.decisionhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing database with default roles and users...");

        Role adminRole = createRoleIfNotFound(RoleType.ROLE_ADMIN, "System Administrator");
        Role moderatorRole = createRoleIfNotFound(RoleType.ROLE_MODERATOR, "Content Moderator");
        Role userRole = createRoleIfNotFound(RoleType.ROLE_USER, "Standard User");

        createUserIfNotFound("admin", "admin@decisionhub.com", "Admin123!", adminRole);
        createUserIfNotFound("moderator", "moderator@decisionhub.com", "Mod123!", moderatorRole);
        createUserIfNotFound("user", "user@decisionhub.com", "User123!", userRole);
        
        log.info("Database initialization completed.");
    }

    private Role createRoleIfNotFound(RoleType roleType, String description) {
        return roleRepository.findByRoleName(roleType)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName(roleType)
                        .description(description)
                        .build()));
    }

    private void createUserIfNotFound(String username, String email, String password, Role role) {
        if (!userRepository.existsByEmail(email) && !userRepository.existsByUsername(username)) {
            User user = User.builder()
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .fullName(username.substring(0, 1).toUpperCase() + username.substring(1) + " User")
                    .role(role)
                    .provider(AuthProvider.LOCAL)
                    .accountStatus(AccountStatus.ACTIVE)
                    .emailVerified(true)
                    .build();
            userRepository.save(user);
            log.info("Created default user: {} with role: {}", username, role.getRoleName());
        }
    }
}
