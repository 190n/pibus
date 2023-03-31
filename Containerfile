FROM node:18-alpine AS tsc
WORKDIR /app
COPY package.json package-lock.json tsconfig.json config.js config.d.ts ./
RUN mkdir -p src
COPY src ./src/
RUN npm ci
RUN npx tsc

FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json config.js run.sh ./
COPY --from=tsc /app/dist ./dist
RUN npm ci --omit dev
ENTRYPOINT [ "./run.sh" ]
