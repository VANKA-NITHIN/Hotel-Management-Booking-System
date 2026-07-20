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
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port the app runs on
EXPOSE 8080

# Set timezone and other basic envs
ENV TZ=UTC

# Install python3 for emergency log serving
RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*

# Run as non-root user for security
RUN groupadd -r spring && useradd -r -g spring spring
RUN chown -R spring:spring /app
USER spring:spring

USER root
RUN echo '#!/bin/bash\n\
java -Xmx300m -jar app.jar > app.log 2>&1\n\
EXIT_CODE=$?\n\
if [ $EXIT_CODE -ne 0 ]; then\n\
  echo "Spring Boot failed with exit code $EXIT_CODE. Starting Python HTTP Server..." >> app.log\n\
  python3 -m http.server ${PORT:-8080}\n\
fi\n\
' > /app/start.sh
RUN chmod +x /app/start.sh
RUN chown spring:spring /app/start.sh app.log || true

USER spring:spring

# Run the application using the wrapper
ENTRYPOINT ["/bin/bash", "/app/start.sh"]
