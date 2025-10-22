# -------- Stage 1: Build (compile TypeScript) --------
FROM node:20-alpine AS builder
WORKDIR /app

# 1) Cài deps (dùng package-lock để cache tốt)
COPY package*.json ./
RUN npm ci --omit=dev=false

# 2) Copy source và build
COPY . .
# Nếu scripts có "build": "tsc" hoặc "ng build" tương ứng BE, cứ gọi:
RUN npm run build

# -------- Stage 2: Runtime (nhẹ, chỉ cần artifcat đã build) --------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 3) Chỉ cài deps production
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# 4) Copy dist để chạy
COPY --from=builder /app/dist ./dist

# 5) Expose & start (đảm bảo entry dist khớp với src/app.ts trong README)
EXPOSE 3000
CMD ["node", "dist/app.js"]
