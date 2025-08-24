# Multi-stage build following 12 Factor App principles
FROM node:18-alpine AS base

# Install security updates and necessary packages
RUN apk update && apk upgrade && apk add --no-cache \
    dumb-init \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Install dependencies (Factor III: Config)
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production --frozen-lockfile && npm cache clean --force

# Build stage
FROM base AS builder
COPY package*.json ./
RUN npm ci --frozen-lockfile

COPY . .

# Build application (Factor V: Build, release, run)
RUN npm run build

# Production stage (Factor V: Build, release, run)
FROM base AS runner

# Factor XII: Admin processes - Use non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs appuser

# Factor III: Config - Environment variables externalized
ENV NODE_ENV=production
ENV PORT=5000

# Factor VIII: Concurrency - Process model
ENV WEB_CONCURRENCY=1

# Factor VI: Processes - Stateless processes
WORKDIR /app

# Create necessary directories
RUN mkdir -p dist client/dist

# Copy built application
COPY --from=builder --chown=appuser:nodejs /app/dist/public ./client/dist
COPY --from=builder --chown=appuser:nodejs /app/dist/index.js ./dist/
COPY --from=builder --chown=appuser:nodejs /app/shared ./shared
COPY --from=builder --chown=appuser:nodejs /app/package*.json ./
COPY --from=builder --chown=appuser:nodejs /app/tsconfig.json ./
COPY --from=builder --chown=appuser:nodejs /app/drizzle.config.ts ./

# Copy production dependencies
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules

# Factor VII: Port binding - Export services via port binding
EXPOSE $PORT

# Factor XII: Admin processes - Use proper init system
USER appuser

# Factor V: Build, release, run - Single command to start
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]