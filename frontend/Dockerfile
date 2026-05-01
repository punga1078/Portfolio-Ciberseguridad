# ETAPA 1: Construcción (Usamos Node)
FROM node:20-alpine AS builder
WORKDIR /app
# Copiamos los archivos de dependencias
COPY package*.json ./
RUN npm install --legacy-peer-deps
# Copiamos el código y compilamos la versión optimizada
COPY . .
# Recibimos el modo (development o staging)
ARG MODE=development
# Compilamos usando el archivo .env correspondiente
RUN npm run build -- --mode $MODE

# ETAPA 2: Producción (Usamos Nginx)
FROM nginx:alpine
# Copiamos la configuración personalizada de Nginx para soportar React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copiamos solo los archivos estáticos ya compilados desde la etapa 1
COPY --from=builder /app/dist /usr/share/nginx/html
# Exponemos el puerto estándar de web
EXPOSE 80
# Arrancamos Nginx
CMD ["nginx", "-g", "daemon off;"]