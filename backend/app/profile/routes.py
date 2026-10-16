
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import verify_access_token
from app.database import get_db
from app.models.user import User

router = APIRouter(
    prefix="/profile",
    tags=["User Profile"]
)

bearer_scheme = HTTPBearer()


def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    try:
        user_id = verify_access_token(credentials.credentials)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    try:
        user = db.get(User, user_id)
    except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to retrieve user profile right now"
            )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


class ProfileUpdate(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    email: EmailStr


@router.get("/")
def get_profile(
    user: User = Depends(get_authenticated_user)
):
    return {
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email
    }


@router.put("/")
def update_profile(
    profile_data: ProfileUpdate,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    existing_user = db.scalar(
        select(User).where(
            User.email == profile_data.email,
            User.user_id != user.user_id
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered to another user"
        )

    user.username = profile_data.username
    user.email = str(profile_data.email)

    try:
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update profile"
        )

    return {
        "message": "Profile updated successfully",
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email
    }
