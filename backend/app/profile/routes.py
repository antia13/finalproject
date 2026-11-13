
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.auth.security import verify_access_token
from app.database import get_db
from app.models.user import User
from datetime import date

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
    # Personal Information
    username: str = Field(min_length=3, max_length=100)
    email: EmailStr
    date_of_birth: date | None = None

    # Medical Information
    medical_conditions: str | None = None

    # Doctor Information
    doctor_name: str | None = Field(default=None, max_length=150)
    doctor_phone: str | None = Field(default=None, max_length=30)

    # Emergency Contact Information
    emergency_contact_name: str | None = Field(
        default=None,
        max_length=150
    )

    emergency_contact_relationship: str | None = Field(
        default=None,
        max_length=100
    )

    emergency_contact_phone: str | None = Field(
        default=None,
        max_length=30
    )

@router.get("/")
def get_profile(
    user: User = Depends(get_authenticated_user)
):
    return {
        # Personal Information
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "date_of_birth": user.date_of_birth,

        # Medical Information
        "medical_conditions": user.medical_conditions,

        # Doctor Information
        "doctor_name": user.doctor_name,
        "doctor_phone": user.doctor_phone,

        # Emergency Contact Information
        "emergency_contact_name": user.emergency_contact_name,
        "emergency_contact_relationship": user.emergency_contact_relationship,
        "emergency_contact_phone": user.emergency_contact_phone
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
    # Personal Information
    user.date_of_birth = profile_data.date_of_birth

    # Medical Information
    user.medical_conditions = profile_data.medical_conditions

    # Doctor Information
    user.doctor_name = profile_data.doctor_name
    user.doctor_phone = profile_data.doctor_phone

    # Emergency Contact Information
    user.emergency_contact_name = profile_data.emergency_contact_name
    user.emergency_contact_relationship = (
        profile_data.emergency_contact_relationship
    )
    user.emergency_contact_phone = profile_data.emergency_contact_phone

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
