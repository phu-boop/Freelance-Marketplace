# Base stage for dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache python3 make g++
RUN npm install --legacy-peer-deps
COPY . .

# Build stage
FROM base AS build
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

EXPOSE 3006
CMD ["node", "dist/main.js"]
