from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.auth_schemas import UserCreate, UserResponse, Token, ChangePasswordRequest, ProUpgradeRequest
from backend.models.domain import User
from backend.controllers.auth_controller import auth_controller

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    return auth_controller.register_user(db, user_data)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return auth_controller.login_user(db, form_data)

@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return auth_controller.change_password(db, current_user, data)

@router.post("/upgrade-pro", response_model=UserResponse)
def upgrade_to_pro(
    data: ProUpgradeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Nâng cấp tài khoản hiện tại lên gói Pro (mặc định 30 ngày).
    Trong môi trường thực tế, API này nên được gọi thông qua webhook của cổng thanh toán.
    """
    return auth_controller.upgrade_to_pro(db, current_user, data.days)
