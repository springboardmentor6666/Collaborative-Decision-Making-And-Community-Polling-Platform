# 🚀 DecisionHub – Enterprise Backend API

**DecisionHub** is a full-stack collaborative decision-making and community polling platform built using Java 21, Spring Boot 3.3.2, Spring Security 6, PostgreSQL, and Clean Architecture principles.

---

## 🛠️ Technology Stack

- **Core Framework:** Java 21, Spring Boot 3.3.2
- **Security & Auth:** Spring Security 6, JWT (HMAC-SHA512), OAuth2 Google Login, BCrypt
- **Database & Persistence:** PostgreSQL, Spring Data JPA, Hibernate ORM, Flyway Migrations
- **API Documentation:** Springdoc OpenAPI 3.0 / Swagger UI
- **Mappers & DTOs:** MapStruct 1.5.5, Lombok
- **Export Engines:** OpenPDF (PDF Reports), Apache POI (Excel `.xlsx` Spreadsheets)
- **CI/CD:** GitHub Actions

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Java 21 JDK
- PostgreSQL 14+

### 2. Configure Database
Make sure PostgreSQL is running and update your application properties with your database credentials if needed.

### 3. Run Application
You can run the application directly from your IDE, or using Maven if installed:
```bash
mvn spring-boot:run
```

### 4. Interactive API Documentation
Access the Swagger UI at:
```text
http://localhost:8080/swagger-ui.html
```

---

## 🏛️ Package Architecture Overview

- `com.decisionhub.config`: Spring Security, CORS, JWT, OpenAPI, JPA Audit configurations.
- `com.decisionhub.entity`: PostgreSQL JPA entities with base auditing and soft-delete support.
- `com.decisionhub.repository`: Spring Data JPA Repositories & Specifications.
- `com.decisionhub.service`: Business logic interfaces & transactional implementations.
- `com.decisionhub.controller`: REST API Controllers with Bean Validation.
- `com.decisionhub.exception`: Custom business exceptions & GlobalExceptionHandler.
- `com.decisionhub.security`: JWT token generation, UserPrincipal, and Google OAuth2 handlers.
