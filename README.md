# 🛡️ Cybersecurity Portfolio & SOC Dashboard

![Status](https://img.shields.io/badge/Status-Active-success.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)

Bienvenido a mi **Portafolio de Ciberseguridad y Dashboard SOC**. Este proyecto no es solo un portafolio personal, sino una infraestructura segura completa diseñada para demostrar habilidades en DevSecOps, monitoreo y desarrollo Full-Stack.

## ✨ Características Principales

- 🔐 **Autenticación Segura:** Sistema de login seguro con JWT y contraseñas hasheadas (Bcrypt).
- 🗺️ **"Pew Pew" Threat Map:** Mapa interactivo de amenazas en tiempo real utilizando WebSockets y D3.
- 📊 **SOC Dashboard:** Panel administrativo protegido para gestión de proyectos e incidentes.
- 📝 **Proyectos Dinámicos:** Gestor de contenido integrado que renderiza proyectos en Markdown (con soporte seguro contra XSS).
- 🔒 **Infraestructura Segura:** Configurado con doble SSL (HTTP a HTTPS), Nginx hardening y mitigación de vulnerabilidades ZAP.
- 📡 **Monitoreo (Honeypot/Logs):** Integración con Promtail para recolectar logs y enviarlos a un sistema centralizado (Grafana/Loki).

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19** + **Vite** para máxima velocidad.
- **Tailwind CSS 4** + **Framer Motion** para diseño moderno y animaciones fluidas.
- **React Simple Maps / D3** para visualización de mapas y amenazas.
- **React Markdown / Rehype Sanitize** para renderizado seguro de artículos.

### Backend
- **FastAPI** (Python) para una API REST ultrarrápida y documentación interactiva.
- **PostgreSQL 15** + **SQLAlchemy** para persistencia de datos.
- **Passlib & Python-Jose** para el manejo criptográfico y JWT.

### Infraestructura (DevSecOps)
- **Docker & Docker Compose** para contenedores aislados.
- **Nginx** como Proxy Inverso con SSL/TLS.
- **Promtail** para la recolección de logs en tiempo real.

## 🚀 Despliegue en VPS (Docker)

El proyecto está dockerizado para un despliegue rápido y reproducible.

### 1. Clonar el repositorio
```bash
git clone https://github.com/punga1078/Portfolio-Ciberseguridad.git
cd Portfolio-Ciberseguridad
```

### 2. Configurar Entorno
Crea un archivo `.env` en la raíz del proyecto basándote en un template (o usa tus propias credenciales):
```env
# Ejemplo de variables
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_password
POSTGRES_DB=portfolio_db
DATABASE_URL=postgresql://tu_usuario:tu_password@db/portfolio_db
SECRET_KEY=tu_secreto_jwt
```

### 3. Levantar los Servicios
Asegúrate de tener certificados SSL en `frontend/ssl/` si tienes configurado HTTPS estricto. Luego ejecuta:
```bash
docker-compose up -d --build
```

Esto levantará los siguientes servicios:
- `blog-db` (Postgres)
- `blog-backend` (FastAPI)
- `blog-frontend` (Nginx + React)
- `promtail_agent` (Monitoreo)

## 🛡️ Seguridad Implementada
- **Headers de Seguridad Nginx:** (HSTS, X-Frame-Options, X-Content-Type-Options, CSP).
- **Protección XSS:** Sanitización exhaustiva en entradas de usuario y renderizado de Markdown.
- **ZAP Scans:** Vulnerabilidades de seguridad mitigadas durante el desarrollo.

---
*Desarrollado para la comunidad de Ciberseguridad.* 🚀
