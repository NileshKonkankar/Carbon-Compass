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
# Stage 2: Serve the Static Assets with Node.js
# ==========================================
FROM node:20-alpine

WORKDIR /app

# Copy built static assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy the lightweight static server script
COPY --from=builder /app/server.js ./server.js

# Declare default PORT environment variable and expose port
ENV PORT=8080
EXPOSE 8080

# Run the unprivileged Node server
CMD ["node", "server.js"]
