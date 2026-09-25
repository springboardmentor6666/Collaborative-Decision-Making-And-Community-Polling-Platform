package com.decisionhub.backend.service;

import com.decisionhub.backend.entity.Role;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Optional;

@Component
public class AdminAccountBootstrap {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminName;
    private final String adminEmail;
    private final String adminPassword;

    public AdminAccountBootstrap(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.name:DecisionHub Admin}") String adminName,
            @Value("${app.admin.email:admin@decisionhub.local}") String adminEmail,
            @Value("${app.admin.password:Admin@123}") String adminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminName = adminName;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @PostConstruct
    public void bootstrap() {
        String normalizedEmail = adminEmail == null ? "" : adminEmail.trim();

        if (normalizedEmail.isBlank()) {
            return;
        }

        String email = normalizedEmail.toLowerCase(Locale.ROOT);
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();

            if (existingUser.getRole() != Role.ADMIN) {
                existingUser.setRole(Role.ADMIN);
            }

            if (existingUser.getName() == null || existingUser.getName().isBlank()) {
                existingUser.setName(adminName);
            }

            if (existingUser.getPassword() == null || existingUser.getPassword().isBlank() ||
                    !passwordEncoder.matches(adminPassword, existingUser.getPassword())) {
                existingUser.setPassword(passwordEncoder.encode(adminPassword));
            }

            userRepository.save(existingUser);
            return;
        }

        User adminUser = User.builder()
                .name(adminName)
                .email(email)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .build();

        userRepository.save(adminUser);
    }
}
