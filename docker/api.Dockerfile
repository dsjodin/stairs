FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@8

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/calc/package.json ./packages/calc/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

COPY tsconfig.base.json ./
COPY packages/calc ./packages/calc
COPY apps/api ./apps/api
RUN pnpm --filter calc build && pnpm --filter api build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup

# Copy the full node_modules (virtual store + root symlinks)
COPY --from=builder /app/node_modules ./node_modules
# Copy per-package node_modules for workspace isolation
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
# Copy package manifests needed for module resolution
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
# Copy calc with its dist and node_modules so zod resolves from packages/calc/dist/types.js
COPY --from=builder /app/packages/calc/package.json ./packages/calc/
COPY --from=builder /app/packages/calc/node_modules ./packages/calc/node_modules
COPY --from=builder /app/packages/calc/dist ./packages/calc/dist
# Copy API compiled output
COPY --from=builder /app/apps/api/dist ./apps/api/dist

USER appuser
ENV NODE_ENV=production
EXPOSE 3011
CMD ["node", "apps/api/dist/index.js"]
