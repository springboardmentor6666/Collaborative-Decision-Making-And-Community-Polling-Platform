package com.decisionhub.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Utility class providing static methods to access current Spring Security context, authenticated user IDs, and roles.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    /**
     * Gets current authenticated UserPrincipal.
     */
    public static Optional<UserPrincipal> getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal userPrincipal) {
            return Optional.of(userPrincipal);
        }
        return Optional.empty();
    }

    /**
     * Gets current authenticated user ID.
     */
    public static Optional<Long> getCurrentUserId() {
        return getCurrentUserPrincipal().map(UserPrincipal::getId);
    }

    /**
     * Gets current authenticated username.
     */
    public static Optional<String> getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.of(authentication.getName());
        }
        return Optional.empty();
    }

    /**
     * Checks if current user has ADMIN role.
     */
    public static boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
