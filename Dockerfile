FROM node:22-alpine

# better-sqlite3 has no prebuilt binary for musl/alpine, so it must compile from source
RUN apk add --no-cache python3 make g++

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

VOLUME ["/app/database-store"]

CMD ["node", "dist/index.js"]
