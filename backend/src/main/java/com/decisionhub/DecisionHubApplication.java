package com.decisionhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: DecisionHubApplication
 * Architecture Tier: Application Entry Point (Root)
 * Package: com.decisionhub
 *
 * Purpose:
 *   Main application bootstrapping class for the DecisionHub Spring Boot microservice. Configures component scanning, enables asynchronous processing, scheduling, and JPA auditing.
 */
@SpringBootApplication
@EnableScheduling
public class DecisionHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(DecisionHubApplication.class, args);
    }
}
