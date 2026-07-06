from pydantic import BaseModel, Field
from typing import List, Optional

class RetrievalRequest(BaseModel):
    top_k: int = Field(default=10, ge=1, le=100)
    dataset: Optional[str] = Field(default="roxford5k")

class RetrievedImage(BaseModel):
    image_id: str
    image_path: Optional[str] = None
    image_base64: Optional[str] = None
    score: float

class RetrievalResponse(BaseModel):
    status: str = "success"
    query_id: Optional[int] = None
    query_image_name: str
    results: List[RetrievedImage]
    message: Optional[str] = None
