from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

import os

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")

if not all([POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB]):
    raise ValueError("Faltan variables de entorno para la base de datos (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)")

# Estructura: postgresql://usuario:password@host:puerto/nombre_db
SQLALCHEMY_DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@db:5432/{POSTGRES_DB}"

# El "motor" que maneja la comunicación con Postgres
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# La fábrica de sesiones para nuestras consultas
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# La clase base de la que heredarán nuestros modelos
Base = declarative_base()