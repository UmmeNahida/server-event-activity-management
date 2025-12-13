#!/usr/bin/env bash
# exit on error
set -o errexit

# 1️⃣ Install dependencies
npm install

# 2️⃣ Generate Prisma client (needed for TS compile)
npx prisma generate

# 3️⃣ Compile TypeScript to dist/
npm run build

# 4️⃣ Apply database migrations
npx prisma migrate deploy
