package com.decisionhub.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("DecisionHub Backend API")
                        .description("DecisionHub Backend API with Google OAuth2 Login and JWT Authentication")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("DecisionHub")
                                .email("support@decisionhub.com")))
                .servers(List.of(new Server()
                        .url("http://localhost:8080")
                        .description("Development Server")))
                .security(List.of(new SecurityRequirement().addList("bearerAuth")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT Bearer token in the format: Bearer <token>")))
                .tags(List.of(
                        new Tag().name("Authentication").description("Authentication endpoints including login, register, and OAuth2"),
                        new Tag().name("Users").description("User management endpoints for CRUD operations"),
                        new Tag().name("Roles").description("Role management endpoints for system roles"),
                        new Tag().name("Profile").description("User profile management endpoints"),
                        new Tag().name("Password").description("Password reset and management endpoints"),
                        new Tag().name("OAuth").description("OAuth2 authentication endpoints for Google login")
                ));
    }
}