FROM node:18-alpine

# Install system dependencies including OpenSSL compatibility library for Prisma
RUN apk add --no-cache openssl openssl1.1-compat libc6-compat

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy sub-project package files
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies across all directories
RUN npm install
RUN npm install --prefix client
RUN npm install --prefix server

# Copy the rest of the application files
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=server/prisma/schema.prisma

# Build Vite client static files
RUN npm run build --prefix client

# Setup and seed the SQLite database at build time
RUN npx prisma db push --schema=server/prisma/schema.prisma --accept-data-loss
RUN node server/src/db/seed.js

EXPOSE 3000

# Set environment variables for production serving
ENV NODE_ENV=production
ENV PORT=3000

# Start the application using the server entrypoint
CMD ["node", "server/src/server.js"]
