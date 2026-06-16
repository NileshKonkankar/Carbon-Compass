# ==========================================
# Stage 1: Build the React Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies using clean install
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the production assets
RUN npm run build

# ==========================================
# Stage 2: Serve the Static Assets with Caddy
# ==========================================
FROM caddy:2-alpine

# Set writeable directories for Caddy config/data inside serverless read-only runtimes
ENV XDG_CONFIG_HOME=/tmp/caddy-config
ENV XDG_DATA_HOME=/tmp/caddy-data

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/caddy

# Copy custom Caddyfile configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port 8080 for documentation
EXPOSE 8080
