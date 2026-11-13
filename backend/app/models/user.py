from datetime import date, datetime

from sqlalchemy import DateTime, String, Text, Date
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base



class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    username: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    date_of_birth: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )

    medical_conditions: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    doctor_name: Mapped[str | None] = mapped_column(
        String(150), nullable=True
    )

    doctor_phone: Mapped[str | None] = mapped_column(
        String(30), nullable=True
    )

    emergency_contact_name: Mapped[str | None] = mapped_column(
        String(150), nullable=True
    )

    emergency_contact_relationship: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )

    emergency_contact_phone: Mapped[str | None] = mapped_column(
        String(30), nullable=True
    )