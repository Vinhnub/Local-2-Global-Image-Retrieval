from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.models.domain import User, QueryHistory
from backend.models.history_schemas import QueryHistoryItem, QueryHistoryDetail
from backend.models.schemas import RetrievedImage
import os
import base64
from pathlib import Path

# Cần tham chiếu BASE_DIR để đọc lại ảnh base64 nếu muốn
script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = script_dir.parent.parent

class HistoryController:
    def get_user_history(self, db: Session, current_user: User, limit: int = 50, skip: int = 0):
        queries = db.query(QueryHistory).filter(QueryHistory.user_id == current_user.id).order_by(QueryHistory.created_at.desc()).offset(skip).limit(limit).all()
        return queries

    def get_query_detail(self, db: Session, current_user: User, query_id: int):
        query = db.query(QueryHistory).filter(QueryHistory.id == query_id).first()
        if not query:
            raise HTTPException(status_code=404, detail="Không tìm thấy lịch sử query này")
        if query.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Không có quyền truy cập query này")
            
        results = []
        dataset_name = "roxford5k" # Mặc định theo code cũ, có thể lưu dataset vào QueryHistory nếu sau này mở rộng
        
        for result in query.results:
            img_name = result.result_image_id
            img_path = BASE_DIR / "data" / "datasets" / dataset_name / "jpg" / f"{img_name}.jpg"
            img_base64 = None
            if img_path.exists():
                try:
                    with open(img_path, "rb") as image_file:
                        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                        img_base64 = f"data:image/jpeg;base64,{encoded_string}"
                except Exception:
                    pass
                    
            results.append(
                RetrievedImage(
                    image_id=img_name,
                    image_path=f"/static/dataset/{img_name}.jpg",
                    image_base64=img_base64,
                    score=result.score
                )
            )
            
        # Sort results by rank
        results.sort(key=lambda x: -x.score)
        
        detail = QueryHistoryDetail(
            id=query.id,
            image_path=query.image_path,
            top_k_requested=query.top_k_requested,
            created_at=query.created_at,
            results=results,
            feedback_rating=query.feedback.rating if query.feedback else None,
            feedback_comment=query.feedback.comment if query.feedback else None
        )
        return detail

history_controller = HistoryController()
