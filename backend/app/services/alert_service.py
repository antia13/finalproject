
def create_interaction_alert(interaction: dict) -> dict | None:
    """Create an informational alert from a detected interaction."""

    if not interaction.get("interaction_found"):
        return None

    severity = interaction.get("severity", "Unknown")

    if severity == "Major":
        level = "high"
        message = (
            "A major interaction is recorded for this medication "
            "combination. Seek prompt guidance from a pharmacist "
            "or healthcare professional before making medication "
            "decisions."
        )
    elif severity == "Moderate":
        level = "moderate"
        message = (
            "A moderate interaction is recorded for this medication "
            "combination. Consult a pharmacist or healthcare "
            "professional about its significance."
        )
    elif severity == "Minor":
        level = "low"
        message = (
            "A minor interaction is recorded for this medication "
            "combination. Review the information with a healthcare "
            "professional if you have questions."
        )
    else:
        level = "unknown"
        message = (
            "An interaction record was found, but its severity is "
            "unknown. Consult a pharmacist or healthcare professional."
        )

    return {
        "alert_created": True,
        "alert_level": level,
        "severity": severity,
        "interaction_id": interaction.get("interaction_id"),
        "message": message,
        "medical_disclaimer": (
            "This alert is informational and is not a diagnosis. "
            "Do not start, stop, or change medication based only "
            "on this result."
        )
    }
