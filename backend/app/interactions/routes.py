
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.interaction_service import check_interaction

router = APIRouter(
    prefix="/interactions",
    tags=["Drug Interactions"]
)


@router.get("/check")
def check_medication_interaction(
    medication1_id: int = Query(..., gt=0),
    medication2_id: int = Query(..., gt=0),
    db: Session = Depends(get_db)
):
    if medication1_id == medication2_id:
        raise HTTPException(
            status_code=400,
            detail="Select two different medication IDs"
        )
    try:
        return check_interaction(
            db,
            medication1_id,
            medication2_id
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to check medication interactions right now"
        )
