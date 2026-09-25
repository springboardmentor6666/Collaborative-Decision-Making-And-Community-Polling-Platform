package com.decisionhub.backend.service;

import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
    private final UserRepository users;
    public CurrentUserService(UserRepository users) { this.users = users; }
    public User get() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName()))
            throw new AccessDeniedException("Authentication is required");
        return users.findByEmail(auth.getName()).orElseThrow(() -> new AccessDeniedException("User account was not found"));
    }
}
