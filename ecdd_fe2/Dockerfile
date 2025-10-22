# -------- Stage 1: Build Angular --------
FROM node:20-alpine AS builder
WORKDIR /app

# 1) Cài deps
COPY package*.json ./
RUN npm ci

# 2) Copy code & build production
COPY . .
# Nếu package.json có script "build": "ng build --configuration production"
RUN npm run build

# -------- Stage 2: Nginx serve static --------
FROM nginx:1.27-alpine

# 3) Copy artifact sang Nginx web root (đường dẫn dist có thể là dist/<projectName>)
COPY --from=builder /app/dist /usr/share/nginx/html

# 4) SPA fallback để Angular route hoạt động (refresh không 404)
RUN printf 'server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
