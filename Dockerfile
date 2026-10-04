FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY data/ ./data/
COPY site/ ./site/
COPY scripts/ ./scripts/
COPY assets/ ./assets/
RUN npm run build

FROM node:22-alpine
ENV HOST=0.0.0.0 PORT=8080
WORKDIR /app
COPY package.json ./
COPY scripts/serve.mjs ./scripts/serve.mjs
COPY --from=builder /app/_site ./_site
EXPOSE 8080
USER node
CMD ["npm", "start"]
