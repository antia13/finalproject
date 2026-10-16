
from fastapi import APIRouter, HTTPException, Query

from app.services.drug_info_service import search_drug_information

router = APIRouter(
    prefix="/drug-info",
    tags=["Drug Information"]
)


@router.get("/search")
async def get_drug_information(
    name: str = Query(..., min_length=1, max_length=100)
):
    if not name.strip():
        raise HTTPException(
            status_code=400,
            detail="Medication name cannot be empty or contain only spaces"
        )
    
    try:
        return await search_drug_information(name.strip())

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Drug information service is temporarily unavailable"
        )
