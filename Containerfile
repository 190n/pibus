FROM node:18-alpine AS tsc
WORKDIR /app
COPY package.json package-lock.json tsconfig.json config.d.ts ./
RUN mkdir -p src
COPY src ./src/
RUN npm ci
RUN npx tsc

FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json run.sh ./
COPY --from=tsc /app/dist ./dist
RUN npm ci --omit dev
HEALTHCHECK --interval=30s --timeout=1s --start-period=5s --retries=3 CMD [ "sh", "-c", "stat $PIBUS_DIR/index.html" ]
ENTRYPOINT [ "./run.sh" ]
