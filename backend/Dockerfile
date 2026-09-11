# Stage 1: Build Application with Maven & Temurin JDK 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Distroless / Alpine JRE 21 Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root system group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

USER appuser

COPY --from=build /app/target/decisionhub-backend-*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
