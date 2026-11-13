from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Medication(Base):
    __tablename__ = "medications"

    medication_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    drug_name: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    generic_name: Mapped[str | None] = mapped_column(
        String,
        nullable=True
    )

    brand_name: Mapped[str | None] = mapped_column(
        String,
        nullable=True
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )