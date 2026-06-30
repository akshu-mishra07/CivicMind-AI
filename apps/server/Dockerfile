FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --workspace=apps/server

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY . .
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/server

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 civicmind
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/package.json ./package.json
USER civicmind
EXPOSE 5000
CMD ["node", "dist/app.js"]
