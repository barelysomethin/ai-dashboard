FROM node:18-alpine

RUN apk add --no-cache openssl1.1-compat

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy Prisma schema first to generate Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 5000

# Push DB migrations, seed initial data, and run Express server
CMD ["sh", "-c", "npx prisma db push && node src/db/seed.js && node src/server.js"]
