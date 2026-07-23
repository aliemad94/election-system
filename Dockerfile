# ---- Stage 1: Build ----
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL (required by Prisma)
RUN apt-get update -qq && apt-get install -y -qq openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js standalone
RUN npm run build

# ---- Stage 2: Production ----
FROM node:20-slim AS runner

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apt-get update -qq && apt-get install -y -qq openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma schema and seed for runtime
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Install bcryptjs and prisma for seed and push at runtime
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
RUN npm install --omit=dev bcryptjs prisma@6.11.1 @prisma/client@6.11.1

# Copy generated Prisma Client (must be done after npm install to avoid overwriting)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Create startup script - with validation for required env vars and smart seed
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Validate required environment variables' >> /app/start.sh && \
    echo 'if [ -z "$JWT_SECRET" ]; then' >> /app/start.sh && \
    echo '  echo "FATAL: JWT_SECRET environment variable is required"' >> /app/start.sh && \
    echo '  echo "Generate one with: openssl rand -base64 48"' >> /app/start.sh && \
    echo '  exit 1' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "Deploying database migrations..."' >> /app/start.sh && \
    echo 'DATABASE_URL=[REDACTED]" npx prisma migrate deploy' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Smart seed: only create users if they do not exist (never overwrite passwords)' >> /app/start.sh && \
    echo 'echo "Checking if seed is needed..."' >> /app/start.sh && \
    echo 'node -e "' >> /app/start.sh && \
    echo '  const {PrismaClient} = require(\"@prisma/client\");' >> /app/start.sh && \
    echo '  const p = new PrismaClient();' >> /app/start.sh && \
    echo '  p.user.findFirst({where:{role:\"ADMIN\"}})' >> /app/start.sh && \
    echo '    .then(u => {' >> /app/start.sh && \
    echo '      if (!u) {' >> /app/start.sh && \
    echo '        console.log(\"No admin user found, running seed...\");' >> /app/start.sh && \
    echo '        return require(\"./prisma/seed.core.js\").seedCore().then(() => p.\$disconnect());' >> /app/start.sh && \
    echo '      } else {' >> /app/start.sh && \
    echo '        console.log(\"Users exist, skipping seed (passwords preserved).\");' >> /app/start.sh && \
    echo '        return p.\$disconnect();' >> /app/start.sh && \
    echo '      }' >> /app/start.sh && \
    echo '    })' >> /app/start.sh && \
    echo '    .catch(e => { console.error(\"Seed check failed:\", e.message); p.\$disconnect(); });' >> /app/start.sh && \
    echo '" || echo "Seed check completed"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "Starting server..."' >> /app/start.sh && \
    echo 'exec node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh && chown nextjs:nodejs /app/start.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/start.sh"]

