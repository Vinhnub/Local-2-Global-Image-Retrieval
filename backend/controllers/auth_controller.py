from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from backend.models.auth_schemas import UserCreate, ChangePasswordRequest
from backend.services.auth_service import auth_service
from backend.core.security import create_access_token
from backend.models.domain import User

class AuthController:
    def register_user(self, db: Session, user_data: UserCreate):
        return auth_service.register(db, user_data)

    def login_user(self, db: Session, form_data: OAuth2PasswordRequestForm):
        user = auth_service.authenticate_user(db, form_data.username, form_data.password)
        access_token = create_access_token(data={"sub": user.username})
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": user
        }

    def change_password(self, db: Session, current_user: User, data: ChangePasswordRequest):
        return auth_service.change_password(db, current_user, data)

    def upgrade_to_pro(self, db: Session, current_user: User, days: int):
        return auth_service.upgrade_to_pro(db, current_user, days)

auth_controller = AuthController()
