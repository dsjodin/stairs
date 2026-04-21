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

# pnpm deploy resolves all prod deps into a self-contained directory
# with no symlinks, so the runtime image works without the pnpm store
RUN pnpm --filter @stairs/api deploy --prod /deploy/api

FROM node:20-alpine AS runtime
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /deploy/api ./

USER appuser
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
