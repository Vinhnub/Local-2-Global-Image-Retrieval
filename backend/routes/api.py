from fastapi import APIRouter
from backend.routes import retrieval, system, auth, feedback, history

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

api_router.include_router(
    retrieval.router,
    prefix="/retrieval",
    tags=["Image Retrieval"]
)

api_router.include_router(
    history.router,
    prefix="/history",
    tags=["History"]
)

api_router.include_router(
    feedback.router,
    prefix="/feedback",
    tags=["Feedback"]
)

api_router.include_router(
    system.router,
    prefix="/system",
    tags=["System"]
)
