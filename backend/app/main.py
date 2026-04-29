from fastapi import FastAPI, HTTPException, Depends, Response, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Importamos nuestros módulos locales
from . import models, security
from .database import engine, SessionLocal

# Crear las tablas en la DB
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mi Blog Seguro API")

# 🛡️ Configuración Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 🛡️ Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://192.168.1.53:5173"],
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
    title: str
    content: str
    project_type: str = "writeup"

class ProjectResponse(BaseModel):
    id: int
    title: str
    content: str
    project_type: str
    
    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    content: str
    author_email: str
    
    class Config:
        from_attributes = True

class ProjectDetailResponse(ProjectResponse):
    comments: List[CommentResponse] = []

# 🚀 NUEVO: Endpoint para registrar un administrador inicial
@app.post("/api/register")
@limiter.limit("3/minute")
def register_user(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    # 1. Verificar si el correo ya existe
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    # 2. Hashear la contraseña antes de guardarla
    hashed_pw = security.get_password_hash(user.password)
    
    # 3. Guardar en PostgreSQL
    nuevo_usuario = models.User(email=user.email, hashed_password=hashed_pw)
    db.add(nuevo_usuario)
    db.commit()
    
    return {"mensaje": "Usuario creado exitosamente"}

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

# 🔍 NUEVO: Endpoint para verificar sesión activa (Usado por React Router)
@app.get("/api/auth/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "rol": "Administrador Security"
    }

# 🔒 ACTUALIZADO: Ruta Protegida (El Dashboard del Portfolio)
@app.get("/api/dashboard")
def obtener_datos_secretos(current_user: models.User = Depends(get_current_user)):
    # Datos mockeados de Ciberseguridad para el UI Premium
    return {
        "metrics": {
            "active_alerts": 3,
            "resolved_ctfs": 42,
            "secured_systems": 15,
            "uptime_days": 128
        },
        "recent_activity": [
            {"id": 1, "type": "LOGIN_SUCCESS", "message": f"Acceso concedido a {current_user.email}", "time": "Justo ahora"},
            {"id": 2, "type": "SCAN_COMPLETE", "message": "Análisis de vulnerabilidades web finalizado sin hallazgos", "time": "Hace 2 horas"},
            {"id": 3, "type": "ALERT_RESOLVED", "message": "Intento de fuerza bruta mitigado por Rate Limiting", "time": "Hace 5 horas"},
        ]
    }

# 📚 NUEVO: Listar Proyectos (Público)
@app.get("/api/projects", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).order_by(models.Project.created_at.desc()).all()

# 📝 NUEVO: Crear Proyecto (Solo Admin)
@app.post("/api/projects", response_model=ProjectResponse)
def create_project(project: ProjectCreate, current_user: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    new_project = models.Project(
        title=project.title,
        content=project.content,
        project_type=project.project_type,
        author_id=current_user.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

# 📄 NUEVO: Obtener un Proyecto específico con sus comentarios (Público)
@app.get("/api/projects/{project_id}", response_model=ProjectDetailResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Construimos la respuesta mapeando el autor de cada comentario
    comments_data = [
        CommentResponse(id=c.id, content=c.content, author_email=c.author.email) 
        for c in project.comments
    ]
    
    return ProjectDetailResponse(
        id=project.id,
        title=project.title,
        content=project.content,
        project_type=project.project_type,
        comments=comments_data
    )

# 💬 NUEVO: Publicar un comentario (Cualquier usuario logueado)
@app.post("/api/projects/{project_id}/comments", response_model=CommentResponse)
@limiter.limit("5/minute")
def create_comment(request: Request, project_id: int, comment: CommentCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
        
    new_comment = models.Comment(
        content=comment.content,
        author_id=current_user.id,
        project_id=project_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return CommentResponse(id=new_comment.id, content=new_comment.content, author_email=current_user.email)

# 🗑️ NUEVO: Eliminar un proyecto (Solo Admin)
@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, current_user: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
        
    db.delete(project)
    db.commit()
    return {"mensaje": "Proyecto eliminado exitosamente"}