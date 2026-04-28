from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

app = FastAPI(title="Mi Blog Seguro API")

# 🛡️ Configuración de CORS (Seguridad)
# Solo permitimos peticiones desde el servidor de Vite local
origenes_permitidos = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

# 🛡️ Modelo de validación de entrada (Evita inyecciones)
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@app.post("/api/login")
def login(credenciales: LoginRequest):
    # Dummy login temporal (Pronto lo conectaremos a Postgres)
    if credenciales.email == "admin@dominio.com" and credenciales.password == "supersegura":
        return {"mensaje": "Autenticación exitosa", "token": "aqui-ira-el-jwt"}
    
    # Práctica Blue Team: Mensaje genérico para no revelar si falló el usuario o la clave
    raise HTTPException(status_code=401, detail="Credenciales inválidas")