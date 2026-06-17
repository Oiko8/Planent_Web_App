# =========================================
# Stage 1: Build the Spring Boot Application
# =========================================
ARG MAVEN_VERSION=3.9.6-eclipse-temurin-21-alpine
FROM maven:${MAVEN_VERSION} AS builder

WORKDIR /app

# Copy the pom.xml and lombok.config first
COPY pom.xml ./
COPY lombok.config ./

# Fetch dependencies
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B

# Copy the rest of the source code
COPY src ./src

# Build the Spring Boot application
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests


# =========================================
# Stage 2: Serve the application
# =========================================
FROM mcr.microsoft.com/openjdk/jdk:21-ubuntu AS runner

WORKDIR /app

# Copy the built .jar file from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the backend port mapped from docker-compose
ARG BACKEND_PORT
ENV BACKEND_PORT=$BACKEND_PORT
EXPOSE ${BACKEND_PORT}

# Start the Spring Boot application, forcing it to bind to the injected port
CMD ["sh", "-c", "java -jar app.jar --server.port=${BACKEND_PORT}"]