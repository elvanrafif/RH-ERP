FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first — Docker caches this layer
# npm install hanya jalan ulang kalau package.json / package-lock.json berubah
COPY package.json package-lock.json ./

RUN npm ci --prefer-offline

# Copy source setelah install
COPY . .

RUN npm run build

# Stage 2: serve dengan nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
