package com.decisionhub.security;

import com.decisionhub.entity.User;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation loading UserPrincipal for Spring Security authentication.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsServiceImpl implements CustomUserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserPrincipal loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail));

        return UserPrincipal.create(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                user.getRole().getRoleName().name(),
                user.getAccountStatus() == com.decisionhub.common.enums.AccountStatus.ACTIVE,
                user.isEmailVerified()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserPrincipal loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", id));

        return UserPrincipal.create(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                user.getRole().getRoleName().name(),
                user.getAccountStatus() == com.decisionhub.common.enums.AccountStatus.ACTIVE,
                user.isEmailVerified()
        );
    }
}
