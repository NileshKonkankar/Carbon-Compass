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
# Stage 2: Serve the Static Assets with Nginx
# ==========================================
FROM nginx:stable-alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration template for envsubst template substitution
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Restrict envsubst to ONLY substitute the PORT environment variable, protecting other Nginx variables (like $uri)
ENV NGINX_ENVSUBST_FILTER=PORT

# Set default fallback port to 80
ENV PORT=80

# Expose port 80 for documentation
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
