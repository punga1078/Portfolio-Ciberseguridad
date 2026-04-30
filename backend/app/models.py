from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base

project_tags = Table(
    "project_tags",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id")),
    Column("tag_id", Integer, ForeignKey("tags.id"))
)

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    
    projects = relationship("Project", secondary=project_tags, back_populates="tags")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False) # 'admin' o 'user'

    # Relación bidireccional
    projects = relationship("Project", back_populates="author")
    comments = relationship("Comment", back_populates="author")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    content = Column(String, nullable=False) # Almacenará Markdown
    project_type = Column(String, default="writeup") # 'writeup' o 'code'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="projects")
    comments = relationship("Comment", back_populates="project", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=project_tags, back_populates="projects")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    author_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))

    author = relationship("User", back_populates="comments")
    project = relationship("Project", back_populates="comments")