from fastapi import FastAPI

from app.database import test_database_connection
from app.auth.routes import router as auth_router
<<<<<<< HEAD
from app.medications.routes import router as medication_router
from app.interactions.routes import router as interaction_router
from app.drug_info.routes import router as drug_info_router
from app.profile.routes import router as profile_router
from app.alerts.routes import router as alert_router
=======
>>>>>>> 7e5c60799465a71038c34171682412c1987d72a5

app = FastAPI(
    title="Health Application API",
    description="Backend API for the Health Application",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "Health Application API is running"
    }


@app.get("/database-test")
def database_test():
    result = test_database_connection()

    return {
        "database_connection": "successful",
        "test_result": result
    }

<<<<<<< HEAD

app.include_router(auth_router)
app.include_router(medication_router)
app.include_router(interaction_router)
app.include_router(drug_info_router)
app.include_router(profile_router)
app.include_router(alert_router)

=======
app.include_router(auth_router)
>>>>>>> 7e5c60799465a71038c34171682412c1987d72a5
