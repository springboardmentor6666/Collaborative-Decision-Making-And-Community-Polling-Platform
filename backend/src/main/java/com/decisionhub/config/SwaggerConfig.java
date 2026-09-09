package com.decisionhub.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: SwaggerConfig
 * Architecture Tier: Application Configuration (Infrastructure Tier)
 * Package: com.decisionhub.config
 *
 * Purpose:
 *   OpenAPI / Swagger 3 documentation configuration exposing interactive REST API documentation at /swagger-ui.html and /v3/api-docs.
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("DecisionHub API Specification")
                        .version("1.0.0")
                        .description("REST API documentation for DecisionHub collaborative decision-making platform")
                        .contact(new Contact().name("DecisionHub Engineering")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
