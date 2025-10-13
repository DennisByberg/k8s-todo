# Multi-stage build for smaller production image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY frontend/ .

# Build the application (creates .next folder with standalone output)
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy standalone server and dependencies
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy public folder if it exists (optional)
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Start production server using standalone output
CMD ["node", "server.js"]