# ============================================================
# Stage 1: BUILD — Compile the Spring Boot app with Maven
# ============================================================
# Uses full JDK image with Maven support to build the project.
# The Maven wrapper (mvnw) downloads Maven automatically.
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# -- Layer 1: Copy only dependency-resolution files first.
#    Docker caches this layer so dependencies aren't re-downloaded
#    on every code change — only when pom.xml changes.
COPY pom.xml ./
COPY .mvn .mvn
COPY mvnw ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

# -- Layer 2: Copy source code and build the JAR.
#    This layer rebuilds only when source code changes.
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ============================================================
# Stage 2: RUN — Lightweight production image
# ============================================================
# Uses JRE-only Alpine image (~80MB vs ~400MB for full JDK).
# Contains ONLY the compiled JAR — no source code, no Maven,
# no build tools. This is what actually runs on Render.
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy ONLY the built JAR from the builder stage
COPY --from=builder /app/target/hospital-intelligence-0.0.1-SNAPSHOT.jar app.jar

# Switch to non-root user
USER appuser

# Render injects PORT as an environment variable (default: 8080)
ENV PORT=8080

# Expose the port (documentation — Render uses PORT env var)
EXPOSE ${PORT}

# JVM tuning flags for containers:
#   -XX:+UseContainerSupport  → respects container memory limits
#   -XX:MaxRAMPercentage=75   → uses 75% of available RAM (good for free tier)
#   -Djava.security.egd       → faster startup (non-blocking random)
#   -Dserver.port=${PORT}     → binds to Render's dynamic PORT
CMD ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar app.jar"]
