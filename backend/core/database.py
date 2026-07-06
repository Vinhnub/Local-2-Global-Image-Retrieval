from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from pathlib import Path

# Thư mục chứa CSDL
BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "local.db"

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_FILE}"

# Sử dụng tham số connect_args={"check_same_thread": False} vì SQLite cho phép multi-thread trong FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
