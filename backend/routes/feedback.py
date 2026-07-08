from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.domain import User
from backend.models.feedback_schemas import FeedbackCreate
from backend.controllers.feedback_controller import feedback_controller

router = APIRouter()

@router.post("/submit")
def submit_feedback(
    feedback_data: FeedbackCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return feedback_controller.submit_feedback(db, current_user, feedback_data)
