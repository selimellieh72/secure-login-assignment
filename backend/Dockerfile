# Step 1: Use an official JDK image (matching your Java 25 requirement)
FROM eclipse-temurin:25-jdk-jammy

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven wrapper and pom.xml first (this caches dependencies)
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Give permission to execute the wrapper
RUN chmod +x mvnw

# Download dependencies (this makes future builds much faster)
RUN ./mvnw dependency:go-offline

# Copy your source code
COPY src ./src

# Tell the container to run your app
# Using 'spring-boot:run' is great for development as it supports hot-reloading better
CMD ["./mvnw", "spring-boot:run"]