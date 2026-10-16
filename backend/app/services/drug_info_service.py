
import httpx

OPENFDA_LABEL_URL = (
    "https://api.fda.gov/drug/label.json"
)


async def search_drug_information(drug_name: str) -> dict:
    """Retrieve available drug labeling information from openFDA."""

    search_term = drug_name.strip()

    if not search_term:
        return {
            "drug_name": drug_name,
            "found": False,
            "message": "Enter a medication name."
        }

    params = {
        "search": f'openfda.generic_name:"{search_term}"',
        "limit": 1
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            OPENFDA_LABEL_URL,
            params=params
        )

    if response.status_code == 404:
        return {
            "drug_name": search_term,
            "found": False,
            "message": "No matching drug label was found."
        }

    response.raise_for_status()
    data = response.json()

    results = data.get("results", [])

    if not results:
        return {
            "drug_name": search_term,
            "found": False,
            "message": "No matching drug label was found."
        }

    label = results[0]
    openfda = label.get("openfda", {})

    return {
        "drug_name": search_term,
        "found": True,
        "brand_names": openfda.get("brand_name", []),
        "generic_names": openfda.get("generic_name", []),
        "purpose": label.get("purpose", []),
        "indications_and_usage": label.get(
            "indications_and_usage", []
        ),
        "warnings": label.get("warnings", []),
        "adverse_reactions": label.get(
            "adverse_reactions", []
        ),
        "contraindications": label.get(
            "contraindications", []
        ),
        "source": "openFDA drug labeling API"
    }
