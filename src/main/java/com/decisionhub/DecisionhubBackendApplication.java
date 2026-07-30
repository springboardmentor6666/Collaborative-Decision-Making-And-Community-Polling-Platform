package com.decisionhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DecisionhubBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(DecisionhubBackendApplication.class, args);
	}

}
