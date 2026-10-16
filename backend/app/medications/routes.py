
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
    if not name.strip():
        raise HTTPException(
            status_code=400,
            detail="Medication name cannot be empty or contain only spaces"
        )

    try:
        results = await search_medications(name.strip())

        return {
            "query": name.strip(),
            "count": len(results),
            "medications": results
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Medication search service is temporarily unavailable"
        )

