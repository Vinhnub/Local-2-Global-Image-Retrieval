from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.models.domain import User
from backend.models.auth_schemas import UserCreate, ChangePasswordRequest
from backend.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    def register(self, db: Session, user_data: UserCreate):
        existing_user = db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Tên đăng nhập đã tồn tại")
        
        hashed_password = get_password_hash(user_data.password)
        new_user = User(username=user_data.username, password_hash=hashed_password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    def authenticate_user(self, db: Session, username: str, password: str):
        user = db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Sai tên đăng nhập hoặc mật khẩu",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    def change_password(self, db: Session, user: User, data: ChangePasswordRequest):
        if not verify_password(data.old_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Mật khẩu cũ không chính xác")
        
        user.password_hash = get_password_hash(data.new_password)
        db.commit()
        return {"detail": "Đổi mật khẩu thành công"}

    def upgrade_to_pro(self, db: Session, user: User, days: int):
        from datetime import datetime, timedelta
        
        user.is_pro = True
        
        # Nếu đã là pro và còn hạn, thì cộng thêm ngày. Nếu hết hạn hoặc chưa phải pro, thì tính từ hôm nay.
        now = datetime.utcnow()
        if user.pro_expire_date and user.pro_expire_date > now:
            user.pro_expire_date = user.pro_expire_date + timedelta(days=days)
        else:
            user.pro_expire_date = now + timedelta(days=days)
            
        db.commit()
        db.refresh(user)
        return user

auth_service = AuthService()
