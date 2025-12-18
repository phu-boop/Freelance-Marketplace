# Base stage for dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build stage
FROM base AS build
RUN chmod +x node_modules/.bin/nest && ./node_modules/.bin/nest build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/.env ./

EXPOSE 3010
CMD ["node", "dist/main.js"]
