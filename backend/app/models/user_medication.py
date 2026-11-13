from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserMedication(Base):
    __tablename__ = "user_medications"

    user_med_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    medication_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("medications.medication_id"),
        nullable=False
    )

    dosage: Mapped[str | None] = mapped_column(
        String,
        nullable=True
    )

    frequency: Mapped[str | None] = mapped_column(
        String,
        nullable=True
    )

    added_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=True
    )