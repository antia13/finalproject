<<<<<<< HEAD
﻿from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import (
    create_access_token,
    hash_password,
    verify_password,
    verify_access_token
)
=======
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import hash_password, verify_password, create_access_token
>>>>>>> 7e5c60799465a71038c34171682412c1987d72a5
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, Token

<<<<<<< HEAD
=======
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.security import verify_access_token

>>>>>>> 7e5c60799465a71038c34171682412c1987d72a5
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

<<<<<<< HEAD
bearer_scheme = HTTPBearer()

=======
>>>>>>> 7e5c60799465a71038c34171682412c1987d72a5

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.scalar(
        select(User).where(User.email == user_data.email)
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered"
        )

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )

<<<<<<< HEAD
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to register user right now"
        )
=======
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
>>>>>>> 7e5c60799465a71038c34171682412c1987d72a5

    return {
        "message": "User registered successfully",
        "user_id": new_user.user_id,
        "username": new_user.username,
<<<<<<< HEAD
        "email": new_user.email
    }


@router.post("/login", response_model=Token)
def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
=======
        "email": new_user.email,
    }

@router.post(
    "/login",
    response_model=Token,
)

def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    # Find the user by email
>>>>>>> 7e5c60799465a71038c34171682412c1987d72a5
    user = db.scalar(
        select(User).where(User.email == user_data.email)
    )

<<<<<<< HEAD
    if not user or not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

=======
    # Reject invalid email/password combinations
    if not user or not verify_password(
        user_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create a JWT containing the user's ID
>>>>>>> 7e5c60799465a71038c34171682412c1987d72a5
    access_token = create_access_token(user.user_id)

    return {
        "access_token": access_token,
<<<<<<< HEAD
        "token_type": "bearer"
    }

=======
        "token_type": "bearer",
    }

bearer_scheme = HTTPBearer()

>>>>>>> 7e5c60799465a71038c34171682412c1987d72a5

@router.get("/me")
def get_current_user(
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

    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return {
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email
<<<<<<< HEAD
    }
=======
    }
>>>>>>> 7e5c60799465a71038c34171682412c1987d72a5
