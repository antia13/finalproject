from fastapi import FastAPI

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