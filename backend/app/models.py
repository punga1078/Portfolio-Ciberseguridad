from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False) # 'admin' o 'user'

    # Relación bidireccional
    projects = relationship("Project", back_populates="author")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    content = Column(String, nullable=False) # Almacenará Markdown
    project_type = Column(String, default="writeup") # 'writeup' o 'code'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="projects")