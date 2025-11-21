# 1. Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
# Copy package files first (better caching)
COPY frontend/package.json frontend/package-lock.json* ./
# Install dependencies
RUN npm ci
# Copy source code
COPY frontend ./
# Build Next.js app
RUN npm run build

# 2. Run Stage (Production)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built artifacts from the builder stage
COPY --from=builder /app/public ./public
# We need the .next folder to run the app
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose Port 3000
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start Command
CMD ["node", "server.js"]

