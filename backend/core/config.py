import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Local-2-Global Image Retrieval API"
    API_V1_STR: str = "/api/v1"
    
    # Thư mục lưu trữ ảnh tải lên (nếu cần)
    UPLOAD_DIR: str = "uploads"
    
    # Có thể thêm các cấu hình mô hình ở đây
    MODEL_WEIGHTS_DIR: str = "weights"

    class Config:
        case_sensitive = True

# Khởi tạo settings global
settings = Settings()

# Đảm bảo thư mục upload tồn tại
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
