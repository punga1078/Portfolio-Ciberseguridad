from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

# Importamos nuestros módulos locales
from . import models, security
from .database import engine, SessionLocal

# Crear las tablas en la DB
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mi Blog Seguro API")

# 🛡️ Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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

# 🛡️ Esquemas de validación (Pydantic)
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# 🚀 NUEVO: Endpoint para registrar un administrador inicial
@app.post("/api/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
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

# 🚀 ACTUALIZADO: Endpoint de Login conectado a PostgreSQL
@app.post("/api/login")
def login(credenciales: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credenciales.email).first()
    
    if not user or not security.verify_password(credenciales.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    # 🚀 NUEVO: Generamos el token JWT guardando el correo del usuario en su interior ("sub" = subject)
    token = security.create_access_token(data={"sub": user.email})
    
    # Devolvemos el token al frontend
    return {
        "mensaje": "Autenticación exitosa", 
        "token": token,
        "token_type": "bearer"
    }