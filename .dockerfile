# --- 1. Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code and build
COPY . .
RUN npm run build

# --- 2. Production Stage ---
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only necessary files from builder
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built dist folder from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
