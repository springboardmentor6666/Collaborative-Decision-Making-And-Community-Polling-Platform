package com.decisionhub.config;

import com.decisionhub.entity.User;
import com.decisionhub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Ensures the admin user account exists with a valid BCrypt password hash on startup.
 * Fixes placeholder hashes from seed data (e.g. '$2a$10$hash_admin') that prevent admin login.
 */
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: AdminUserInitializer
 * Architecture Tier: Application Configuration (Infrastructure Tier)
 * Package: com.decisionhub.config
 *
 * Purpose:
 *   Application startup hook (CommandLineRunner) that ensures an administrator user exists with a properly hashed BCrypt password.
 */
@Component
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${APP_ADMIN_EMAIL:admin@decisionhub.com}")
    private String adminEmail;

    @Value("${APP_ADMIN_PASSWORD:admin123}")
    private String adminPassword;

    public AdminUserInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            userRepository.findByEmail(adminEmail).ifPresent(admin -> {
                String currentHash = admin.getPasswordHash();
                // If hash is null, empty, a placeholder, or not a valid BCrypt hash, fix it
                if (currentHash == null || currentHash.isBlank()
                        || (!currentHash.startsWith("$2a$") && !currentHash.startsWith("$2b$") && !currentHash.startsWith("$2y$"))
                        || currentHash.length() < 59) {
                    String validHash = passwordEncoder.encode(adminPassword);
                    admin.setPasswordHash(validHash);
                    userRepository.save(admin);
                    logger.info("Admin user '{}' password hash was invalid/placeholder — updated with valid BCrypt hash.", adminEmail);
                }
            });
        } catch (Exception e) {
            logger.warn("AdminUserInitializer: Could not verify admin account — {}", e.getMessage());
        }
    }
}
