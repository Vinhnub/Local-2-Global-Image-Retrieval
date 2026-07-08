from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from backend.controllers.retrieval_controller import retrieval_controller
from backend.models.schemas import RetrievalResponse
from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.domain import User

router = APIRouter()

@router.post(
    "/retrieve", 
    response_model=RetrievalResponse,
    responses={
        200: {"description": "Successful retrieval"},
        400: {"description": "Invalid input file"},
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden - limit reached"},
        500: {"description": "System error during feature extraction"}
    }
)
async def retrieve_images(
    file: UploadFile = File(...),
    dataset: str = Form("roxford5k"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await retrieval_controller.handle_retrieval(
        file=file, 
        dataset=dataset,
        db=db,
        current_user=current_user
    )
