from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.services.retrieval_service import retrieval_service
from backend.models.schemas import RetrievalResponse
from backend.models.domain import User, QueryHistory

NUM_QUERY_FOR_PRO = 30
NUM_QUERY_FOR_FREE = 10

class RetrievalController:
    async def handle_retrieval(self, file: UploadFile, dataset: str, db: Session, current_user: User) -> RetrievalResponse:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Invalid image file.")
            
        # Kiểm tra giới hạn tuỳ theo hạng tài khoản
        is_pro = current_user.is_pro
        if is_pro and current_user.pro_expire_date and current_user.pro_expire_date < datetime.utcnow():
            is_pro = False # Hết hạn Pro
            
        top_k = NUM_QUERY_FOR_PRO if is_pro else NUM_QUERY_FOR_FREE
        max_queries_per_day = 1000000 if is_pro else NUM_QUERY_FOR_FREE
        # Đếm số query trong ngày hôm nay
        today = datetime.utcnow().date()
        start_of_day = datetime(today.year, today.month, today.day)
        queries_today = db.query(QueryHistory).filter(
            QueryHistory.user_id == current_user.id,
            QueryHistory.created_at >= start_of_day
        ).count()
        
        if queries_today >= max_queries_per_day:
            raise HTTPException(status_code=403, detail="Bạn đã đạt giới hạn số lần tìm kiếm trong ngày.")
            
        try:
            return await retrieval_service.process_image_retrieval(
                file=file, 
                top_k=top_k, 
                dataset=dataset,
                db=db,
                current_user=current_user
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

retrieval_controller = RetrievalController()
