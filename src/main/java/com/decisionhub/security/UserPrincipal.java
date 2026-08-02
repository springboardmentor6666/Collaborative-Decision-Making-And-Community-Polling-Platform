package com.decisionhub.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

/**
 * Custom UserDetails & OAuth2User implementation wrapping authenticated user state for Spring Security.
 */
@Getter
@AllArgsConstructor
@Builder
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String username;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean active;
    private final boolean emailVerified;

    public static UserPrincipal create(Long id, String username, String email, String password, String roleName, boolean active, boolean emailVerified) {
        String authority = roleName.startsWith("ROLE_") ? roleName.toUpperCase() : "ROLE_" + roleName.toUpperCase();
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(authority));
        return UserPrincipal.builder()
                .id(id)
                .username(username)
                .email(email)
                .password(password)
                .authorities(authorities)
                .active(active)
                .emailVerified(emailVerified)
                .build();
    }



    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
