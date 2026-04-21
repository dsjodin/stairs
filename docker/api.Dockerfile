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
RUN npm install -g pnpm@8 \
    && addgroup -S appgroup \
    && adduser -S appuser -G appgroup

# Let pnpm install set up its own symlinks and virtual store in-place
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/calc/package.json ./packages/calc/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output after install so the symlinks are already in place
COPY --from=builder /app/packages/calc/dist ./packages/calc/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

USER appuser
ENV NODE_ENV=production
EXPOSE 3011
CMD ["node", "apps/api/dist/index.js"]
