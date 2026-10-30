from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session

from app.database import get_db
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


@router.get("/lookup")
def lookup_medication(
    name: str = Query(..., min_length=1, max_length=100),
    db: Session = Depends(get_db)
):
    from sqlalchemy import text

    query = text("""
        SELECT medication_id, drug_name, generic_name, brand_name
        FROM public.medications
        WHERE LOWER(TRIM(drug_name)) = LOWER(TRIM(:name))
           OR LOWER(TRIM(generic_name)) = LOWER(TRIM(:name))
           OR LOWER(TRIM(brand_name)) = LOWER(TRIM(:name))
    """)

    results = db.execute(
        query,
        {"name": name.strip()}
    ).mappings().all()

    if len(results) == 0:
        raise HTTPException(
            status_code=404,
            detail="Medication not found in the local interaction database."
        )

    if len(results) > 1:
        raise HTTPException(
            status_code=409,
            detail="Multiple matching medications found. A more specific selection is needed."
        )

    return dict(results[0])

