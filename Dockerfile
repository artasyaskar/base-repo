# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production

# Build client
WORKDIR /app/client
RUN npm ci && npm run build

# Production stage
FROM node:18-alpine AS production

# Install gcc for C compilation
RUN apk add --no-cache gcc musl-dev

# Create app directory
WORKDIR /app

# Copy package.json and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built client
COPY --from=builder /app/client/build ./client/build

# Copy server code
COPY server/ ./server/

# Create temp directory for compiler
RUN mkdir -p ./server/temp && chmod 777 ./server/temp

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "server/index.js"]
