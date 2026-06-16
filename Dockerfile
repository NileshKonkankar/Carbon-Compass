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
# Stage 2: Serve the Static Assets with Nginx (Fail-Safe Port Binding)
# ==========================================
FROM nginx:stable-alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our full custom Nginx configuration as a template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Set default fallback port to 8080
ENV PORT=8080

# Expose port 8080 for documentation
EXPOSE 8080

# Replace PORT_PLACEHOLDER with $PORT and run Nginx using writeable configuration in /tmp to ensure compatibility with read-only & non-root hosts
CMD ["/bin/sh", "-c", "sed \"s/PORT_PLACEHOLDER/${PORT:-8080}/g\" /etc/nginx/nginx.conf.template > /tmp/nginx.conf && exec nginx -c /tmp/nginx.conf"]
