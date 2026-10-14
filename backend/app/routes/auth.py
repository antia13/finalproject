from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import hash_password, verify_password, create_access_token
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, Token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.scalar(
        select(User).where(User.email == user_data.email)
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.user_id,
        "username": new_user.username,
        "email": new_user.email
    }


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.scalar(
        select(User).where(User.email == user_data.email)
    )

    if not user or not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(user.user_id)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
