
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.interaction_service import check_interaction
from app.services.alert_service import create_interaction_alert

router = APIRouter(prefix="/alerts", tags=["Emergency Alerts"])


@router.get("/check-interaction")
def check_interaction_alert(
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
        interaction = check_interaction(
            db,
            medication1_id,
            medication2_id
        )

        alert = create_interaction_alert(interaction)

        return {
            "interaction": interaction,
            "alert": alert
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Unable to check medication interactions and create an alert right now"
        )