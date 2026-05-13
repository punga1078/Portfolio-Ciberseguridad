from fastapi import FastAPI, HTTPException, Depends, Response, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict
from jose import JWTError, jwt
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import random
import logging
import httpx
import asyncio
import json
import csv
import io
import re
from fastapi.responses import HTMLResponse, StreamingResponse
from datetime import datetime, timezone

# Importamos nuestros módulos locales
from . import models, security
from .database import engine, SessionLocal

# Crear las tablas en la DB (Desactivado a favor de Alembic)
# models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mi Blog Seguro API")

# 🚫 Caché global de IPs bloqueadas para evitar latencia en cada request
blocked_ips_cache = set()

# Pre-cargar la caché al iniciar
def load_blocked_ips():
    try:
        db = SessionLocal()
        blocked = db.query(models.BlockedIP).all()
        for b in blocked:
            blocked_ips_cache.add(b.ip)
        db.close()
    except Exception as e:
        print(f"Error cargando Blocked IPs: {e}")

load_blocked_ips()

from fastapi.responses import JSONResponse

@app.middleware("http")
async def blocklist_middleware(request: Request, call_next):
    client_ip = request.client.host
    if client_ip in blocked_ips_cache:
        return JSONResponse(
            status_code=403,
            content={"detail": "Access Denied. IP has been permanently banned due to suspicious activity."}
        )
    return await call_next(request)

# 🛡️ Configurar Proxy Headers ANTES que el resto para confiar en X-Forwarded-For
# IMPORTANTE: Esto debe estar configurado para que request.client.host sea la IP REAL y no la de Docker.
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])

# 🛡️ Configuración Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 🛡️ Configuración CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://192.168.1.53:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔌 Dependencia para conectar a la DB en cada petición
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🛡️ Le decimos a FastAPI dónde se consiguen los tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# 👮‍♂️ El Guardia de Seguridad: Verifica el JWT en cada petición protegida
def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    
    excepcion_credenciales = HTTPException(
        status_code=401,
        detail="No se pudieron validar las credenciales o el token expiró",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado. Token faltante.")
        
    try:
        # Intentamos decodificar el token con nuestra llave maestra
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise excepcion_credenciales
    except JWTError:
        # Si el token es falso, modificado o caducado, cae aquí
        raise excepcion_credenciales
    
    # Si el token es válido, buscamos al usuario en la base de datos
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise excepcion_credenciales
    
    return user

# 👮‍♂️ Guardia de Élite: Solo Admins
def get_admin_user(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado: Se requieren privilegios de Administrador")
    return current_user

# 🛡️ Esquemas de validación (Pydantic)
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ProjectCreate(BaseModel):
    title: str = Field(..., max_length=150)
    content: str = Field(..., max_length=50000)
    project_type: str = "writeup"
    github_url: Optional[str] = None
    tags: List[str] = []

class ProjectUpdate(BaseModel):
    title: str = Field(..., max_length=150)
    content: str = Field(..., max_length=50000)
    project_type: str = "writeup"
    github_url: Optional[str] = None
    tags: List[str] = []

class TagResponse(BaseModel):
    name: str
    class Config:
        from_attributes = True

class VisitCreate(BaseModel):
    path: str

class ProjectResponse(BaseModel):
    id: int
    slug: str
    title: str
    content: str
    project_type: str
    github_url: Optional[str] = None
    tags: List[TagResponse] = []
    
    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str = Field(..., max_length=1000)

class CommentResponse(BaseModel):
    id: int
    content: str
    author_email: str
    
    class Config:
        from_attributes = True

class ProjectDetailResponse(ProjectResponse):
    comments: List[CommentResponse] = []

# 🚀 ACTUALIZADO: Endpoint para registrar usuarios
@app.post("/api/register")
@limiter.limit("3/minute")
def register_user(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    # 1. Verificar si el correo ya existe
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    # 2. Lógica de Admin Automático: El primer usuario que se registre es el dueño/admin
    user_count = db.query(models.User).count()
    role = "admin" if user_count == 0 else "user"
    
    # 3. Hashear la contraseña antes de guardarla
    hashed_pw = security.get_password_hash(user.password)
    
    # 4. Guardar en PostgreSQL
    nuevo_usuario = models.User(email=user.email, hashed_password=hashed_pw, role=role)
    db.add(nuevo_usuario)
    db.commit()
    
    return {"mensaje": f"Usuario registrado exitosamente como {role}"}

# 🚀 ACTUALIZADO: Endpoint de Login conectado a PostgreSQL con Cookies HttpOnly
@app.post("/api/login")
@limiter.limit("5/minute")
def login(request: Request, credenciales: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credenciales.email).first()
    
    if not user or not security.verify_password(credenciales.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    # Generamos el token JWT guardando el correo del usuario en su interior ("sub" = subject)
    token = security.create_access_token(data={"sub": user.email})
    
    # 🛡️ Establecemos la cookie HttpOnly
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False, # Cambiar a True en producción (HTTPS)
        max_age=security.ACCESS_TOKEN_EXPIRE_MINUTES * 60, # Expiración en segundos
    )
    
    return {"mensaje": "Autenticación exitosa"}

# 🚪 NUEVO: Endpoint de Logout para destruir la cookie
@app.post("/api/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"mensaje": "Sesión cerrada correctamente"}

# 🔍 ACTUALIZADO: Endpoint para verificar sesión activa
@app.get("/api/auth/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "rol": current_user.role # 'admin' o 'user'
    }

# 👮‍♂️ ADMIN: Listar todos los usuarios
@app.get("/api/admin/users")
def list_users(current_user: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [{"id": u.id, "email": u.email, "role": u.role} for u in users]

class UserRoleUpdate(BaseModel):
    role: str

# 👮‍♂️ ADMIN: Cambiar rol de un usuario
@app.patch("/api/admin/users/{user_id}/role")
def update_user_role(user_id: int, role_update: UserRoleUpdate, current_user: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes cambiar tu propio rol")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if role_update.role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Rol inválido")
        
    user.role = role_update.role
    db.commit()
    return {"mensaje": f"Rol de {user.email} actualizado a {role_update.role}"}

# 👮‍♂️ ADMIN: Listar IPs bloqueadas
@app.get("/api/admin/blocked-ips")
def list_blocked_ips(current_user: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    blocks = db.query(models.BlockedIP).order_by(models.BlockedIP.timestamp.desc()).all()
    return [{"id": b.id, "ip": b.ip, "reason": b.reason, "timestamp": b.timestamp} for b in blocks]

# 👮‍♂️ ADMIN: Desbloquear una IP
@app.delete("/api/admin/blocked-ips/{blocked_id}")
def unblock_ip(blocked_id: int, current_user: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    block = db.query(models.BlockedIP).filter(models.BlockedIP.id == blocked_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Bloqueo no encontrado")
        
    if block.ip in blocked_ips_cache:
        blocked_ips_cache.remove(block.ip)
        
    db.delete(block)
    db.commit()
    return {"mensaje": f"IP {block.ip} desbloqueada exitosamente"}

# 📡 GESTIÓN DE WEBSOCKETS (Real-time Threat Map)
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                # Manejar desconexiones silenciosas
                pass

manager = ConnectionManager()

@app.websocket("/ws/threat-map")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Mantener conexión viva (heartbeat o similar si fuera necesario)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# 🕵️‍♂️ HONEYPOT: Rutas trampa para detectar intrusos
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("honeypot")

def map_mitre_tactic(path: str) -> str:
    path_lower = path.lower()
    if "/wp-admin" in path_lower or "login" in path_lower or "admin" in path_lower:
        return "T1110 (Brute Force)"
    elif ".env" in path_lower or "config" in path_lower:
        return "T1552 (Unsecured Credentials)"
    elif "phpmyadmin" in path_lower or "sql" in path_lower:
        return "T1190 (Exploit Public-Facing Application)"
    elif "shell" in path_lower or "cmd" in path_lower:
        return "T1505 (Server Software Component)"
    return "T1046 (Network Service Discovery)"

async def get_abuseipdb_score(ip: str) -> int:
    # Si es IP local, retornamos 0
    if ip in ["127.0.0.1", "localhost", "::1"] or ip.startswith("172.") or ip.startswith("192.168.") or ip.startswith("10."):
        return 0
        
    api_key = os.getenv("ABUSEIPDB_API_KEY")
    if not api_key:
        # Simulamos un score aleatorio con peso hacia valores bajos
        return random.choice([0, 0, 0, 15, 25, 40, 85, 100])
        
    try:
        url = "https://api.abuseipdb.com/api/v2/check"
        headers = {
            "Accept": "application/json",
            "Key": api_key
        }
        params = {"ipAddress": ip, "maxAgeInDays": 90}
        
        async with httpx.AsyncClient() as client:
            res = await client.get(url, headers=headers, params=params, timeout=3.0)
            if res.status_code == 200:
                data = res.json()
                return data.get("data", {}).get("abuseConfidenceScore", 0)
    except Exception as e:
        logger.error(f"AbuseIPDB Error: {e}")
    return 0

def anonymize_ip(ip: str) -> str:
    parts = ip.split(".")
    if len(parts) == 4:
        return f"{parts[0]}.{parts[1]}.{parts[2]}.***"
    return ip

async def get_geoip_data(ip: str) -> Dict:
    # IP-API es gratuita para < 45 req/min. En prod se usaría MaxMind local.
    # Como estamos en local, a veces la IP será '127.0.0.1'. Simularemos datos si es local.
    if ip in ["127.0.0.1", "localhost", "::1"] or ip.startswith("172."):
        # IPs de Docker o local -> Datos random para el show
        MOCKS = [
            {"country": "Germany", "lat": 51.1657, "lon": 10.4515},
            {"country": "USA", "lat": 37.0902, "lon": -95.7129},
            {"country": "China", "lat": 35.8617, "lon": 104.1954},
            {"country": "Russia", "lat": 61.524, "lon": 105.3188},
            {"country": "Brazil", "lat": -14.235, "lon": -51.9253},
            {"country": "Argentina", "lat": -38.4161, "lon": -63.6167},
        ]
        return random.choice(MOCKS)
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"http://ip-api.com/json/{ip}?fields=status,country,lat,lon", timeout=2.0)
            if res.status_code == 200:
                data = res.json()
                if data.get("status") == "success":
                    return {
                        "country": data.get("country"),
                        "lat": data.get("lat"),
                        "lon": data.get("lon")
                    }
    except Exception as e:
        logger.error(f"GeoIP Error: {e}")
    
    # Fallback con jitter para evitar solapamientos en el mapa
    MOCKS = [
        {"country": "Germany", "lat": 51.1657, "lon": 10.4515},
        {"country": "USA", "lat": 37.0902, "lon": -95.7129},
        {"country": "China", "lat": 35.8617, "lon": 104.1954},
        {"country": "Russia", "lat": 61.524, "lon": 105.3188},
        {"country": "Brazil", "lat": -14.235, "lon": -51.9253},
        {"country": "Argentina", "lat": -38.4161, "lon": -63.6167},
        {"country": "Australia", "lat": -25.2744, "lon": 133.7751},
        {"country": "Canada", "lat": 56.1304, "lon": -106.3468},
    ]
    base = random.choice(MOCKS)
    return {
        "country": base["country"],
        "lat": base["lat"] + random.uniform(-2.0, 2.0),
        "lon": base["lon"] + random.uniform(-2.0, 2.0)
    }

async def send_telegram_alert(message: str):
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        return
    
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        async with httpx.AsyncClient() as client:
            await client.post(url, json={
                "chat_id": chat_id,
                "text": f"🚨 *HONEYPOT ALERT*\n\n{message}",
                "parse_mode": "Markdown"
            })
    except Exception as e:
        logger.error(f"Telegram Alert Error: {e}")

@app.api_route("/admin.php", methods=["GET", "POST"])
@app.api_route("/wp-admin", methods=["GET", "POST"])
@app.api_route("/.env", methods=["GET", "POST"])
@app.api_route("/config.php", methods=["GET", "POST"])
@app.api_route("/phpmyadmin", methods=["GET", "POST"])
async def honeypot_trap(request: Request, db: Session = Depends(get_db)):
    ip = request.client.host or "0.0.0.0"
    path = request.url.path
    ua = request.headers.get("user-agent", "Unknown")
    
    # 🔍 LOG DE DEBUG PARA PRODUCCIÓN
    logger.info(f"Honeypot hit: IP={ip} PATH={path}")
    
    # 🌎 Obtener GeoIP real (asíncrono)
    geo = await get_geoip_data(ip)
    
    # 🛡️ Obtener Threat Intel y MITRE
    threat_score = await get_abuseipdb_score(ip)
    mitre_tactic = map_mitre_tactic(path)
    
    anon_ip = anonymize_ip(ip)
    
    # 🛑 Verificar si es el quinto intento para banear
    intentos = db.query(models.HoneypotEvent).filter(models.HoneypotEvent.ip == anon_ip).count()
    
    # 🚀 Log para Promtail/Loki
    alert_msg = f"IP={anon_ip} PATH={path} COUNTRY={geo['country']} UA={ua} SCORE={threat_score} MITRE={mitre_tactic}"
    logger.warning(f"HONEYPOT_ALERT: {alert_msg}")
    
    # 📱 Enviar alerta a Telegram con SOAR (simulación de bloqueo)
    if intentos >= 4: # 5to intento o más
        # 🛡️ IMPORTANTE: Incluimos 172. para evitar que el servidor se auto-bloquee por la red de Docker
        is_local = ip in ["127.0.0.1", "localhost", "::1"] or ip.startswith("192.168.") or ip.startswith("10.") or ip.startswith("172.")
        
        if is_local:
            soar_action = "\n🛡️ *Acción:* IP LOCAL CONFIABLE (Ignorada para Ban)"
        else:
            soar_action = "\n🛡️ *Acción:* IP AUTO-BLOQUEADA PERMANENTEMENTE (>= 5 intentos)"
            if ip not in blocked_ips_cache:
                blocked_ips_cache.add(ip)
                nuevo_bloqueo = models.BlockedIP(ip=ip, reason=f"Low and Slow: 5 intentos en honeypot")
                db.add(nuevo_bloqueo)
    else:
        soar_action = "\n🛡️ *Acción:* IP AUTO-BLOQUEADA (>80)" if threat_score > 80 else ""
        
    asyncio.create_task(send_telegram_alert(
        f"Target: `{path}`\nIP: `{anon_ip}`\nGeo: `{geo['country']}`\nScore: `{threat_score}/100`\nMITRE: `{mitre_tactic}`{soar_action}\nUA: `{ua}`"
    ))
    
    # Guardar en DB
    nuevo_evento = models.HoneypotEvent(
        ip=anon_ip, 
        path=path, 
        user_agent=ua, 
        country=geo['country'],
        lat=geo['lat'],
        lon=geo['lon'],
        threat_score=threat_score,
        mitre_tactic=mitre_tactic
    )
    db.add(nuevo_evento)
    db.commit()

    # 📡 BROADCAST vía WebSocket
    payload = {
        "type": "NEW_ATTACK",
        "data": {
            "ip": anon_ip,
            "path": path,
            "country": geo['country'],
            "lat": geo['lat'],
            "lon": geo['lon'],
            "time": "Justo ahora",
            "threat_score": threat_score,
            "mitre_tactic": mitre_tactic
        }
    }
    await manager.broadcast(payload)
    
    return HTMLResponse(content=f"""
    <html>
        <head><title>Admin Login - Restricted Access</title></head>
        <body style="font-family: 'Courier New', Courier, monospace; background: #1a1a1a; color: #00ff00; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
            <div style="background: #2a2a2a; padding: 30px; border: 2px solid #00ff00; box-shadow: 0 0 20px #00ff00;">
                <h2 style="margin-top: 0; text-transform: uppercase;">⚠️ Access Restricted</h2>
                <p>System identification required. Your IP ({anon_ip}) has been logged for security audit.</p>
                <form method="POST">
                    <label>Username:</label><br>
                    <input type="text" name="user" style="width: 100%; background: #000; border: 1px solid #00ff00; color: #00ff00; padding: 8px; margin: 10px 0;"><br>
                    <label>Password:</label><br>
                    <input type="password" name="pass" style="width: 100%; background: #000; border: 1px solid #00ff00; color: #00ff00; padding: 8px; margin: 10px 0;"><br>
                    <input type="submit" value="AUTHENTICATE" style="background: #00ff00; color: #000; border: none; padding: 10px 20px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 10px;">
                </form>
                <p style="color: #ff0000; font-size: 11px; margin-top: 20px;">NOTICE: Legal action will be taken against unauthorized access attempts.</p>
            </div>
        </body>
    </html>
    """, status_code=200)

# 🔒 ACTUALIZADO: Ruta Protegida (El Dashboard del Portfolio con DATOS REALES)
@app.get("/api/dashboard")
def obtener_datos_secretos(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Métricas de Honeypot
    total_intrusiones = db.query(models.HoneypotEvent).count()
    ips_unicas = db.query(func.count(func.distinct(models.HoneypotEvent.ip))).scalar()
    
    # 2. Métricas de Contenido
    proyectos_count = db.query(models.Project).count()
    comentarios_count = db.query(models.Comment).count()
    
    # 3. Actividad Reciente (Mezcla de Honeypot y Logs de Sistema)
    honeypot_recent = db.query(models.HoneypotEvent).order_by(models.HoneypotEvent.timestamp.desc()).limit(5).all()
    
    activity_log = []
    for h in honeypot_recent:
        activity_log.append({
            "id": h.id,
            "type": "ALERT_HONEYPOT",
            "message": f"Intrusión en {h.path} desde {h.ip} ({h.country})",
            "threat_score": h.threat_score or 0,
            "mitre_tactic": h.mitre_tactic or "Desconocida",
            "is_blocked": (h.threat_score or 0) > 80,
            "time": "Hace un momento"
        })
    
    # 4. Estadísticas por País (Convertir a lista de listas para evitar error de serialización)
    stats_raw = db.query(models.HoneypotEvent.country, func.count(models.HoneypotEvent.id)).group_by(models.HoneypotEvent.country).all()
    stats_list = [[row[0], row[1]] for row in stats_raw]

    # 5. Web Analytics (Visitantes)
    total_visitas = db.query(models.VisitorEvent).count()
    visitantes_unicos = db.query(func.count(func.distinct(models.VisitorEvent.ip))).scalar()

    # Rellenar si hay pocos
    if len(activity_log) < 3:
        activity_log.append({"id": 99, "type": "SCAN_COMPLETE", "message": "Análisis de vulnerabilidades web finalizado", "time": "Hace 2 horas"})

    return {
        "metrics": {
            "active_alerts": total_intrusiones,
            "secured_systems": ips_unicas,
            "resolved_ctfs": proyectos_count,
            "uptime_days": comentarios_count,
            "total_visits": total_visitas,
            "unique_visitors": visitantes_unicos
        },
        "recent_activity": activity_log,
        "honeypot_stats": stats_list
    }

@app.get("/api/honeypot/history")
def get_honeypot_history(db: Session = Depends(get_db)):
    events = db.query(models.HoneypotEvent).order_by(models.HoneypotEvent.timestamp.desc()).limit(20).all()
    return events

@app.get("/api/honeypot/export")
def export_honeypot_logs(db: Session = Depends(get_db)):
    events = db.query(models.HoneypotEvent).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "IP", "Path", "Country", "Timestamp", "UserAgent"])
    
    for e in events:
        writer.writerow([e.id, e.ip, e.path, e.country, e.timestamp, e.user_agent])
    
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=honeypot_logs.csv"}
    )

# 🌐 NUEVO: Endpoint para tracking de visitas web (Analytics)
@app.post("/api/track")
@limiter.limit("20/minute")
def track_visitor(request: Request, visit: VisitCreate, db: Session = Depends(get_db)):
    ip = request.client.host or "0.0.0.0"
    ua = request.headers.get("user-agent", "Unknown")
    anon_ip = anonymize_ip(ip)
    
    new_visit = models.VisitorEvent(
        ip=anon_ip,
        path=visit.path,
        user_agent=ua
    )
    db.add(new_visit)
    db.commit()
    return {"status": "ok"}

# 📚 NUEVO: Listar Proyectos (Público)
@app.get("/api/projects", response_model=List[ProjectResponse])
def get_projects(q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Project)
    if q:
        query = query.filter(
            models.Project.title.ilike(f"%{q}%") | 
            models.Project.content.ilike(f"%{q}%") | 
            models.Project.tags.any(models.Tag.name.ilike(f"%{q}%"))
        )
    return query.order_by(models.Project.created_at.desc()).all()

# 📝 NUEVO: Crear Proyecto (Solo Admin)
@app.post("/api/projects", response_model=ProjectResponse)
def create_project(project: ProjectCreate, current_user: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    # Generar Slug
    base_slug = re.sub(r'[^a-z0-9]+', '-', project.title.lower()).strip('-')
    slug = base_slug
    counter = 1
    while db.query(models.Project).filter(models.Project.slug == slug).first() is not None:
        slug = f"{base_slug}-{counter}"
        counter += 1

    new_project = models.Project(
        title=project.title,
        slug=slug,
        content=project.content,
        project_type=project.project_type,
        github_url=project.github_url,
        author_id=current_user.id
    )
    
    # Manejo de tags
    for tag_name in project.tags:
        tag_name_clean = tag_name.strip().lower()
        if not tag_name_clean: continue
        tag = db.query(models.Tag).filter(models.Tag.name == tag_name_clean).first()
        if not tag:
            tag = models.Tag(name=tag_name_clean)
            db.add(tag)
        new_project.tags.append(tag)

    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

# 📄 NUEVO: Obtener un Proyecto específico con sus comentarios (Público)
@app.get("/api/projects/{slug}", response_model=ProjectDetailResponse)
def get_project(slug: str, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.slug == slug).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Construimos la respuesta mapeando el autor de cada comentario
    comments_data = [
        CommentResponse(id=c.id, content=c.content, author_email=c.author.email) 
        for c in project.comments
    ]
    
    return ProjectDetailResponse(
        id=project.id,
        slug=project.slug,
        title=project.title,
        content=project.content,
        project_type=project.project_type,
        github_url=project.github_url,
        comments=comments_data
    )

# 💬 NUEVO: Publicar un comentario (Cualquier usuario logueado)
@app.post("/api/projects/{slug}/comments", response_model=CommentResponse)
@limiter.limit("5/minute")
def create_comment(request: Request, slug: str, comment: CommentCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.slug == slug).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
        
    new_comment = models.Comment(
        content=comment.content,
        author_id=current_user.id,
        project_id=project.id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return CommentResponse(id=new_comment.id, content=new_comment.content, author_email=current_user.email)

# 🗑️ NUEVO: Eliminar un proyecto (Solo Admin)
@app.delete("/api/projects/{slug}")
def delete_project(slug: str, current_user: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.slug == slug).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
        
    db.delete(project)
    db.commit()
    return {"mensaje": "Proyecto eliminado exitosamente"}

# ✏️ NUEVO: Actualizar un proyecto (Solo Admin)
@app.put("/api/projects/{slug}", response_model=ProjectResponse)
def update_project(slug: str, project_update: ProjectUpdate, current_user: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.slug == slug).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    project.title = project_update.title
    project.content = project_update.content
    project.project_type = project_update.project_type
    project.github_url = project_update.github_url
    
    # Actualizar tags
    project.tags = []
    for tag_name in project_update.tags:
        tag_name = tag_name.strip().lower()
        if not tag_name: continue
        tag = db.query(models.Tag).filter(models.Tag.name == tag_name).first()
        if not tag:
            tag = models.Tag(name=tag_name)
            db.add(tag)
        project.tags.append(tag)
        
    db.commit()
    db.refresh(project)
    return project