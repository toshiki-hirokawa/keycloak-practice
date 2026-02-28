FROM docker.io/oven/bun:latest

WORKDIR /app

COPY shared/demo-server/package.json .
COPY shared/demo-server/bun.lock .
COPY shared/demo-server/tsconfig.json .
RUN bun install --frozen-lockfile

COPY shared/demo-server/src ./src

EXPOSE 8081

CMD ["bun", "run", "src/index.tsx"]
