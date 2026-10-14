from fastapi import FastAPI

from app.database import test_database_connection
from app.auth.routes import router as auth_router

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


app.include_router(auth_router)
