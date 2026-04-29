from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from jose import JWTError, jwt

# Importamos nuestros módulos locales
from . import models, security
from .database import engine, SessionLocal

# Crear las tablas en la DB
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mi Blog Seguro API")

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
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    excepcion_credenciales = HTTPException(
        status_code=401,
        detail="No se pudieron validar las credenciales o el token expiró",
        headers={"WWW-Authenticate": "Bearer"},
    )
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

# 🔒 NUEVO: Ruta Protegida (El Dashboard del Portfolio)
@app.get("/api/dashboard")
def obtener_datos_secretos(current_user: models.User = Depends(get_current_user)):
    # Si el código llega hasta aquí, significa que el guardia (get_current_user) aprobó el token
    return {
        "mensaje": f"¡Bienvenido a la bóveda, {current_user.email}!",
        "datos_secretos": "Aquí irán los proyectos privados de tu Portfolio",
        "rol": "Administrador"
    }