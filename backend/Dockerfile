# ==============================================================================
# DecisionHub - Collaborative Decision-Making & Community Polling Platform
#
# File: backend/Dockerfile
# Architecture Tier: Multi-Stage Production Container Build
#
# Purpose:
#   Stage 1: Compiles and packages Spring Boot 3 Java application using Maven.
#   Stage 2: Runs production executable JAR using minimal Eclipse Temurin JRE 17 runtime.
# ==============================================================================

FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/decisionhub-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS:--XX:MaxRAMPercentage=75.0 -Xmx384m} -jar app.jar"]
