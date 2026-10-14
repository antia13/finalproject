
from sqlalchemy import text
from sqlalchemy.orm import Session

def check_interaction(
    db: Session,
    medication1_id: int,
    medication2_id: int
):
    query = text("""
        SELECT
            interaction_id,
            medication_id_1,
            medication_id_2,
            severity,
            description
        FROM public.interactions
        WHERE (
            medication_id_1 = :med1
            AND medication_id_2 = :med2
        )
        OR (
            medication_id_1 = :med2
            AND medication_id_2 = :med1
        )
        LIMIT 1
    """)

    result = db.execute(
        query,
        {"med1": medication1_id, "med2": medication2_id}
    ).mappings().first()

    if result is None:
        return {
            "interaction_found": False,
            "message": (
                "No matching interaction was found in the "
                "local DDInter dataset. This does not confirm "
                "that the combination is safe."
            )
        }

    return {
        "interaction_found": True,
        "interaction_id": result["interaction_id"],
        "medication_id_1": result["medication_id_1"],
        "medication_id_2": result["medication_id_2"],
        "severity": result["severity"],
        "description": result["description"]
    }

