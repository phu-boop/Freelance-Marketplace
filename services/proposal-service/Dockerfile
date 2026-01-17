# Base stage
FROM node:20-alpine AS base
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy pre-installed node_modules from host (bypasses network issues)
COPY node_modules ./node_modules

# Copy source code
COPY . .

# Build stage
FROM base AS build
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy built assets and dependencies
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

EXPOSE 3003
CMD ["node", "dist/src/main.js"]
