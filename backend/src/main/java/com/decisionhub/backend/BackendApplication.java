package com.decisionhub.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
        System.out.println("\n==========================================");
        System.out.println("🚀 DecisionHub Backend is Running!");
        System.out.println("🌐 Server: http://localhost:8080");
        System.out.println("==========================================");
    }

}
