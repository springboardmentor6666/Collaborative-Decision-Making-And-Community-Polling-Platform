package com.decisionhub.security;

import com.decisionhub.entity.User;
import com.decisionhub.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        String rawRole = user.getRole() != null ? user.getRole().trim().toUpperCase() : "USER";
        String cleanRole = rawRole.startsWith("ROLE_") ? rawRole.substring(5) : rawRole;
        java.util.List<SimpleGrantedAuthority> authorities = java.util.List.of(
                new SimpleGrantedAuthority("ROLE_" + cleanRole),
                new SimpleGrantedAuthority(cleanRole)
        );

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                authorities
        );
    }
}
