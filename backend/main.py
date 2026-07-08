from fastapi import FastAPI
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.routes.api import api_router

load_dotenv()
SERVER_IP = os.getenv("SERVER_IP")
PORT_IP = int(os.getenv("PORT_IP"))

from contextlib import asynccontextmanager
from backend.services.retrieval_service import retrieval_service

from backend.core.database import Base, engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo Database Tables
    Base.metadata.create_all(bind=engine)
    
    # Khởi tạo models khi ứng dụng bắt đầu
    retrieval_service._load_models_and_databases()
    yield

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/", tags=["Home"])
    def read_root():
        return {"message": f"Welcome to {settings.PROJECT_NAME}"}

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=SERVER_IP, port=PORT_IP, reload=True, log_config="backend/logging.yaml", log_level="debug")
