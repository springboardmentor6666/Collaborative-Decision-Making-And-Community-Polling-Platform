package com.decisionhub.config;

import com.decisionhub.security.JwtFilter;
import com.decisionhub.security.oauth.OAuth2AuthenticationFailureHandler;
import com.decisionhub.security.oauth.OAuth2AuthenticationSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import com.decisionhub.security.LegacyPasswordEncoder;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: SecurityConfig
 * Architecture Tier: Application Configuration (Infrastructure Tier)
 * Package: com.decisionhub.config
 *
 * Purpose:
 *   Spring Security 6 configuration establishing stateless JWT filter chains, public vs protected route authorizations, and CORS filters.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    private final OAuth2AuthenticationFailureHandler oauth2FailureHandler;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtFilter jwtFilter,
                          @Lazy OAuth2AuthenticationSuccessHandler oauth2SuccessHandler,
                          OAuth2AuthenticationFailureHandler oauth2FailureHandler,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtFilter = jwtFilter;
        this.oauth2SuccessHandler = oauth2SuccessHandler;
        this.oauth2FailureHandler = oauth2FailureHandler;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .authorizeHttpRequests(auth -> auth
                // Allow all CORS preflight OPTIONS requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Password change endpoints require active authentication
                .requestMatchers("/api/auth/change-password", "/api/auth/set-password").authenticated()
                .requestMatchers("/api/auth/**", "/oauth2/**", "/login/oauth2/**", "/h2-console/**").permitAll()

                // Public search, activity feed, and documentation
                .requestMatchers("/api/search/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/activities/**").permitAll()
                .requestMatchers("/ws-chat/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()

                // Public platform taxonomy and trends
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/analytics/trends", "/api/analytics/categories").permitAll()

                // Public decisions & polls viewing
                .requestMatchers(HttpMethod.GET, "/api/decisions", "/api/decisions/**").permitAll()
                .requestMatchers("/api/decisions/*/impressions").permitAll()
                .requestMatchers("/api/decisions/*/export/csv").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/polls/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/votes/result/**", "/api/votes/rating-summary/**").permitAll()

                // Public comments, suggestions, and recommendations viewing
                .requestMatchers(HttpMethod.GET, "/api/comments/decision/**", "/api/comments/*/replies").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/suggestions/decision/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/recommendations/decision/**").permitAll()

                // Public communities listing and viewing
                .requestMatchers(HttpMethod.GET, "/api/communities", "/api/communities/*").permitAll()

                // Public file attachment downloads
                .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()

                // All other operations (creation, voting, admin, mutation) require authentication
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json");
                    response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"message\":\"Unauthorized\",\"status\":401}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json");
                    response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"message\":\"Access Denied\",\"status\":403}");
                })
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oauth2SuccessHandler)
                .failureHandler(oauth2FailureHandler)
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new LegacyPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
