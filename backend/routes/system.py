from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
def get_system_status():
    return {"status": "running", "models_loaded": True}
