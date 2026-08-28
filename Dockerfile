# Multi-language Online IDE Container for Render, Docker, and Cloud Run
FROM node:20-bullseye-slim

# Install C (gcc), C++ (g++), Java (openjdk-17-jdk-headless), Python3, and build utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    openjdk-17-jdk-headless \
    python3 \
    python3-pip \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME and ensure all binaries are on PATH
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:${PATH}"

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install npm dependencies
RUN npm ci || npm install

# Copy application source code
COPY . .

# Build Vite frontend & bundle Node Express server
RUN npm run build

# Expose container port
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

# Start production server
CMD ["node", "dist/server.cjs"]
