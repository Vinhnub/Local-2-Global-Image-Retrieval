from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from backend.models.schemas import RetrievedImage

class QueryHistoryItem(BaseModel):
    id: int
    image_path: str
    top_k_requested: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class QueryHistoryDetail(QueryHistoryItem):
    results: List[RetrievedImage] = []
    feedback_rating: Optional[int] = None
    feedback_comment: Optional[str] = None
