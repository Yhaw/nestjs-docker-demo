FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# # --- 2. Production Stage ---
# # CHANGED: Use Node 20
# FROM node:20-alpine

# WORKDIR /usr/src/app

# COPY package*.json ./
# RUN npm ci --omit=dev
# COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]