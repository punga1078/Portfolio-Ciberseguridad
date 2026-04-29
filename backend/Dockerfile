# Usamos una imagen oficial y ligera de Python
FROM python:3.11-slim

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos solo los requerimientos primero (Aprovecha el caché de Docker)
COPY requirements.txt .

# Instalamos las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código
COPY . .

# Exponemos el puerto que usa FastAPI
EXPOSE 8000

# Comando para arrancar el servidor (obligamos a que escuche en todas las interfaces con 0.0.0.0)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]