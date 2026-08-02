package com.decisionhub.security;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Service interface extending Spring Security UserDetailsService for loading user authentication state.
 */
public interface CustomUserDetailsService extends UserDetailsService {

    /**
     * Loads UserPrincipal by user ID.
     */
    UserPrincipal loadUserById(Long id);

    /**
     * Loads UserPrincipal by username or email.
     */
    @Override
    UserPrincipal loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException;
}
