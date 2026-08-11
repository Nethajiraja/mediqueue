# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and install all dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled application code and initial database seed
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/mediqueue_db.json ./mediqueue_db.json

# Expose server port
EXPOSE 3000

# Health check configuration for container monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start full-stack MediQueue server
CMD ["node", "dist/server.cjs"]
