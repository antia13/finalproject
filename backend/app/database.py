import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the .env file")

engine = create_engine(DATABASE_URL)


class Base(DeclarativeBase):
    pass


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_database_connection():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return result.scalar()
