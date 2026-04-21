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
COPY apps/web ./apps/web
RUN pnpm --filter calc build && pnpm --filter web build

FROM nginx:alpine AS runtime
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

EXPOSE 80
