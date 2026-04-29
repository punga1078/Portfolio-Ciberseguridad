from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Estructura: postgresql://usuario:password@host:puerto/nombre_db
SQLALCHEMY_DATABASE_URL = "postgresql://admin:superpassword@db:5432/blog_seguro"

# El "motor" que maneja la comunicación con Postgres
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# La fábrica de sesiones para nuestras consultas
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# La clase base de la que heredarán nuestros modelos
Base = declarative_base()