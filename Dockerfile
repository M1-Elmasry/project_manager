FROM node:20-alpine AS base

# Stage1: The Builder
FROM base AS builder

RUN apk add --no-cache gcompat
WORKDIR /app

COPY package*.json tsconfig.json src ./

RUN npm ci && npm run build && npm prune --production

# Stage2: The Runner
FROM base AS runner

LABEL maintainer="Davenchy <firon1222@gmail.com>"
LABEL description="Project Manager Backend"

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 hono
RUN apk add --no-cache curl

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json
COPY --chown=hono:nodejs ./swagger.yaml /app/swagger.yaml

USER hono
ENV  SERVER_HOST=0.0.0.0
EXPOSE 5000

CMD ["npm", "start"]
