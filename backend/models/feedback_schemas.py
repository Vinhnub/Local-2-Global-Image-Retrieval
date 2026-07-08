from pydantic import BaseModel, Field
from typing import Optional

class FeedbackCreate(BaseModel):
    query_id: int
    rating: int = Field(ge=1, le=5, description="Số sao đánh giá (1-5)")
    comment: Optional[str] = Field(None, description="Bình luận thêm (không bắt buộc)")
