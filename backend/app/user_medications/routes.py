from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.medication import Medication
from app.models.user_medication import UserMedication
from app.profile.routes import get_authenticated_user


router = APIRouter(
    prefix="/user-medications",
    tags=["My Medications"]
)

class UserMedicationCreate(BaseModel):
    medication_id: int = Field(gt=0)
    dosage: str | None = Field(default=None, max_length=255)
    frequency: str | None = Field(default=None, max_length=255)


@router.get("/")
def get_my_medications(
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    try:
        statement = (
            select(UserMedication, Medication)
            .join(
                Medication,
                UserMedication.medication_id == Medication.medication_id
            )
            .where(UserMedication.user_id == user.user_id)
            .order_by(UserMedication.added_at.desc())
        )

        results = db.execute(statement).all()

        return {
            "medications": [
                {
                    "user_med_id": user_med.user_med_id,
                    "medication_id": medication.medication_id,
                    "drug_name": medication.drug_name,
                    "generic_name": medication.generic_name,
                    "brand_name": medication.brand_name,
                    "dosage": user_med.dosage,
                    "frequency": user_med.frequency,
                    "added_at": user_med.added_at
                }
                for user_med, medication in results
            ]
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve saved medications"
        )

@router.post("/", status_code=201)
def add_my_medication(
    medication_data: UserMedicationCreate,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    # Verify that the medication exists
    medication = db.get(
        Medication,
        medication_data.medication_id
    )

    if not medication:
        raise HTTPException(
            status_code=404,
            detail="Medication not found"
        )

    # Prevent the same medication from being added twice
    existing_medication = db.scalar(
        select(UserMedication).where(
            UserMedication.user_id == user.user_id,
            UserMedication.medication_id == medication_data.medication_id
        )
    )

    if existing_medication:
        raise HTTPException(
            status_code=409,
            detail="This medication is already in your list"
        )

    # Create the saved medication record
    new_medication = UserMedication(
        user_id=user.user_id,
        medication_id=medication_data.medication_id,
        dosage=medication_data.dosage,
        frequency=medication_data.frequency
    )

    try:
        db.add(new_medication)
        db.commit()
        db.refresh(new_medication)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to save medication"
        )

    return {
        "message": "Medication added successfully",
        "user_med_id": new_medication.user_med_id,
        "medication_id": medication.medication_id,
        "drug_name": medication.drug_name,
        "dosage": new_medication.dosage,
        "frequency": new_medication.frequency
    }

@router.delete("/{user_med_id}")
def delete_my_medication(
    user_med_id: int,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    # Find the saved medication belonging to this user
    saved_medication = db.scalar(
        select(UserMedication).where(
            UserMedication.user_med_id == user_med_id,
            UserMedication.user_id == user.user_id
        )
    )

    if not saved_medication:
        raise HTTPException(
            status_code=404,
            detail="Medication not found in your list"
        )

    # Remove the medication from the user's personal list
    try:
        db.delete(saved_medication)
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to remove medication"
        )

    return {
        "message": "Medication removed successfully"
    }