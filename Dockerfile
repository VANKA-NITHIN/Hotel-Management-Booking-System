# Build stage
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies
# This caches the dependencies layer unless pom.xml changes
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port the app runs on
EXPOSE 8080

# Set timezone and other basic envs
ENV TZ=UTC

# Run as non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
RUN chown -R spring:spring /app
USER spring:spring

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
