# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Cài deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Config build
ARG CONFIG=production
# Option A: app chạy ở root "/"
ARG BASE_HREF=/
ARG DEPLOY_URL=/

# Build Angular (chú ý có 2 dấu --)
RUN npm run build -- \
  --configuration=${CONFIG} \
  --base-href ${BASE_HREF} \
  --deploy-url ${DEPLOY_URL}

# ---------- Runtime (nginx) ----------
FROM nginx:1.27-alpine

# Xoá file default
RUN rm -rf /usr/share/nginx/html/*

# Copy toàn bộ dist sang tạm, rồi tự tìm index.html để flatten vào nginx root
COPY --from=builder /app/dist /tmp/dist

# Tìm index.html trong dist (hỗ trợ cả dist/<app> và dist/<app>/browser) rồi copy về root
RUN set -eux; \
    if [ -f /tmp/dist/index.html ]; then \
        cp -r /tmp/dist/* /usr/share/nginx/html/; \
    else \
        target="$(find /tmp/dist -maxdepth 3 -type f -name index.html | head -n1)"; \
        if [ -n "$target" ]; then \
          dir="$(dirname "$target")"; \
          cp -r "$dir"/* /usr/share/nginx/html/; \
        else \
          echo "ERROR: Không tìm thấy index.html trong thư mục dist"; \
          ls -laR /tmp/dist; \
          exit 1; \
        fi; \
    fi

# Nginx config cho SPA (fallback về index.html)
RUN printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  # SPA fallback\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  # Static assets có cache dài\n\
  location ~* \\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ {\n\
    access_log off;\n\
    expires 1y;\n\
    add_header Cache-Control "public";\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
