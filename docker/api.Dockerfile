FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@8

COPY package.json pnpm-workspace.yaml ./
COPY packages/calc/package.json ./packages/calc/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

COPY packages/calc ./packages/calc
COPY apps/api ./apps/api
RUN pnpm --filter calc build && pnpm --filter api build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/calc/dist ./packages/calc/dist
COPY --from=builder /app/packages/calc/package.json ./packages/calc/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

USER appuser
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
