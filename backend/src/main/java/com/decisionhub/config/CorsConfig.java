package com.decisionhub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Cross-Origin Resource Sharing (CORS) security configuration.
 * Dynamically binds allowed origins from application properties or environment variables.
 */
@Configuration
public class CorsConfig {

    @Value("${application.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        List<String> resolvedOrigins = allowedOrigins.stream()
                .flatMap(origin -> Arrays.stream(origin.split(",")))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();

        configuration.setAllowedOrigins(resolvedOrigins.isEmpty() ? List.of("http://localhost:3000", "http://localhost:5173") : resolvedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
