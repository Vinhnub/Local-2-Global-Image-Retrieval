from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.domain import User
from backend.models.history_schemas import QueryHistoryItem, QueryHistoryDetail
from backend.controllers.history_controller import history_controller

router = APIRouter()

@router.get("/", response_model=List[QueryHistoryItem])
def get_my_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Lấy danh sách các lần truy vấn ảnh trước đây của tài khoản.
    """
    return history_controller.get_user_history(db, current_user, limit, skip)

@router.get("/{query_id}", response_model=QueryHistoryDetail)
def get_my_query_detail(
    query_id: int,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Xem chi tiết kết quả trả về của một lần truy vấn cụ thể.
    """
    return history_controller.get_query_detail(db, current_user, query_id)
