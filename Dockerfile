# ==============================================================================
# DecisionHub - Collaborative Decision-Making & Community Polling Platform
#
# File: Dockerfile (Root)
# Architecture Tier: Root Multi-Stage Production Container Build for Cloud Platforms
#
# Purpose:
#   Allows Render, Railway, Fly.io, and other cloud providers to deploy the
#   Spring Boot backend directly from repository root with zero configuration.
# ==============================================================================

FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/decisionhub-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS:--XX:+UseSerialGC -Xss512k -XX:MaxRAMPercentage=70.0 -Xmx320m} -jar app.jar"]
