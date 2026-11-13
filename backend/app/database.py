"""
DeepGuard Database Module
=========================
SQLite database setup using SQLAlchemy ORM to persist detection scan history.
"""

import os
from datetime import datetime
from typing import Any, Dict, Generator

from sqlalchemy import Column, DateTime, Float, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# SQLite Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./deepguard.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ScanRecord(Base):
    """
    SQLAlchemy model representing an analyzed media scan record.
    """
    __tablename__ = "scan_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String, nullable=False)
    media_type = Column(String, nullable=False)  # "image" or "video"
    fake_probability = Column(Float, nullable=False)
    verdict = Column(String, nullable=False)     # "Likely Real", "Inconclusive", "Likely Fake"
    frames_analyzed = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        """
        Serializes the model instance to a JSON-compatible dictionary.
        """
        return {
            "id": self.id,
            "filename": self.filename,
            "media_type": self.media_type,
            "fake_probability": round(self.fake_probability, 2),
            "verdict": self.verdict,
            "frames_analyzed": self.frames_analyzed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


def init_db() -> None:
    """
    Initializes database tables defined in metadata.
    """
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a scoped SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

