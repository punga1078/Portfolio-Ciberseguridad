from sqlalchemy import Column, Integer, String
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # unique=True evita correos duplicados a nivel de base de datos
    email = Column(String, unique=True, index=True, nullable=False)
    # NUNCA guardamos contraseñas en texto plano, por eso la columna se llama así
    hashed_password = Column(String, nullable=False)