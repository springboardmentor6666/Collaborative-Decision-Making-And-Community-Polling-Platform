# ==============================================================================
# DecisionHub - Collaborative Decision-Making & Community Polling Platform
#
# File: frontend/Dockerfile
# Architecture Tier: Multi-Stage Production Web Container
#
# Purpose:
#   Stage 1: Installs dependencies and builds optimized static assets using Vite 5.
#   Stage 2: Serves SPA bundle via alpine Nginx web server with gzip and reverse proxy.
# ==============================================================================

# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
