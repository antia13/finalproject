
from fastapi import APIRouter, HTTPException, Query

from app.services.medication_service import search_medications

router = APIRouter(
    prefix="/medications",
    tags=["Medications"]
)


@router.get("/search")
async def medication_search(
    name: str = Query(..., min_length=1, max_length=100)
):
    try:
        results = await search_medications(name)

        return {
            "query": name,
            "count": len(results),
            "medications": results
        }

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Medication search service is temporarily unavailable"
        )
