
import httpx


RXNORM_API_URL = "https://rxnav.nlm.nih.gov/REST/drugs.json"


async def search_medications(query: str) -> list[dict]:
    """Search for medications using the RxNorm API."""

    search_term = query.strip()

    if not search_term:
        return []

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            RXNORM_API_URL,
            params={"name": search_term}
        )
        response.raise_for_status()
        data = response.json()

    groups = data.get("drugGroup", {}).get("conceptGroup", []) or []

    medications = []
    seen_ids = set()

    for group in groups:
        concepts = group.get("conceptProperties", []) or []

        for concept in concepts:
            rxcui = concept.get("rxcui")
            name = concept.get("name")

            if not rxcui or not name or rxcui in seen_ids:
                continue

            seen_ids.add(rxcui)

            medications.append({
                "rxcui": rxcui,
                "name": name,
                "type": concept.get("tty"),
                "synonym": concept.get("synonym"),
                "prescribable_name": concept.get("psn")
            })

    return medications
