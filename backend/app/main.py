"""
DeepGuard FastAPI Application
=============================
REST API backend providing deepfake detection, explainability, and history tracking.
"""

import os
# Configure Matplotlib cache directory to a writable location to avoid sandbox warnings
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")

import base64
import logging
import shutil
import sys
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List, Optional

import cv2
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Add backend directory to sys.path to support execution from any directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from app.database import ScanRecord, get_db, init_db
    from app.model import DeepfakeDetector
    from app.preprocess import extract_face_from_image, extract_faces_from_video
except ImportError:
    from backend.app.database import ScanRecord, get_db, init_db
    from backend.app.model import DeepfakeDetector
    from backend.app.preprocess import extract_face_from_image, extract_faces_from_video

# Configure application logging
logger = logging.getLogger("DeepGuard.API")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Global model instance
detector: Optional[DeepfakeDetector] = None


def get_detector() -> DeepfakeDetector:
    """
    Returns the singleton instance of DeepfakeDetector, initializing it if necessary.
    """
    global detector
    if detector is None:
        logger.info("Initializing global DeepfakeDetector instance...")
        detector = DeepfakeDetector()
        logger.info("DeepfakeDetector ready.")
    return detector


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager to handle application startup and shutdown events.
    """
    logger.info("DeepGuard Backend starting up...")
    # Initialize SQLite database tables
    init_db()
    logger.info("SQLite database initialized successfully.")
    # Eagerly load model on startup
    get_detector()
    yield
    logger.info("DeepGuard Backend shutting down...")


# Initialize FastAPI application
app = FastAPI(
    title="DeepGuard API",
    description="Deepfake Detection & Grad-CAM Visual Explainability Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS middleware allowing all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------------------
# Pydantic Response Schemas
# ------------------------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


class ImageAnalysisResponse(BaseModel):
    id: int
    filename: str
    media_type: str
    fake_probability: float
    verdict: str
    frames_analyzed: int = 1
    original_face_base64: str
    heatmap_base64: str
    created_at: str


class VideoAnalysisResponse(BaseModel):
    id: int
    filename: str
    media_type: str
    fake_probability: float
    verdict: str
    frames_analyzed: int
    original_face_base64: str
    heatmap_base64: str
    created_at: str


class HistoryRecordResponse(BaseModel):
    id: int
    filename: str
    media_type: str
    fake_probability: float
    verdict: str
    frames_analyzed: int
    created_at: Optional[str] = None


# ------------------------------------------------------------------------------
# Helper Utilities
# ------------------------------------------------------------------------------
def encode_bgr_to_base64_png(bgr_image: Any) -> str:
    """
    Encodes an OpenCV BGR numpy image into a Base64 PNG data URL string.
    """
    success, buffer = cv2.imencode(".png", bgr_image)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to encode image to PNG format."
        )
    b64_str = base64.b64encode(buffer.tobytes()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"


# ------------------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------------------
@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check endpoint",
    tags=["System"]
)
def health_check() -> Dict[str, Any]:
    """
    Health check returning API status and confirmation that the model is loaded.
    """
    active_detector = get_detector()
    return {
        "status": "ok",
        "model_loaded": active_detector is not None
    }


@app.post(
    "/analyze/image",
    response_model=ImageAnalysisResponse,
    summary="Analyze uploaded image for deepfakes",
    tags=["Analysis"]
)
async def analyze_image(
    file: UploadFile = File(..., description="Image file (.jpg, .png, etc.)"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Analyzes an uploaded image:
    1. Extracts and crops the dominant face (with 20% margin, resized to 224x224).
    2. Runs deepfake classification using EfficientNet-B0.
    3. Generates Grad-CAM visual explainability heatmap.
    4. Persists the analysis result in SQLite database.
    5. Returns classification metrics and Base64-encoded visual assets.
    """
    active_detector = get_detector()
    filename = file.filename or "uploaded_image.jpg"
    suffix = Path(filename).suffix or ".jpg"

    # Save uploaded file to a temporary location for OpenCV reading
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            temp_path = tmp_file.name

        # Extract 224x224 cropped face
        face_crop = extract_face_from_image(temp_path)
        if face_crop is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No face detected in the uploaded image. Please provide a clear image containing a human face."
            )

        # Run inference and Grad-CAM generation
        pred = active_detector.predict_face(face_crop)

        # Encode the original cropped face as Base64 PNG
        original_face_b64 = encode_bgr_to_base64_png(face_crop)

        # Persist record in SQLite
        record = ScanRecord(
            filename=filename,
            media_type="image",
            fake_probability=pred["fake_probability"],
            verdict=pred["verdict"],
            frames_analyzed=1
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "id": record.id,
            "filename": record.filename,
            "media_type": record.media_type,
            "fake_probability": record.fake_probability,
            "verdict": record.verdict,
            "frames_analyzed": record.frames_analyzed,
            "original_face_base64": original_face_b64,
            "heatmap_base64": pred["heatmap_base64"],
            "created_at": record.created_at.isoformat() if record.created_at else ""
        }

    finally:
        # Guarantee cleanup of temporary file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.warning("Failed to remove temp file '%s': %s", temp_path, e)


@app.post(
    "/analyze/video",
    response_model=VideoAnalysisResponse,
    summary="Analyze uploaded video for deepfakes",
    tags=["Analysis"]
)
async def analyze_video(
    file: UploadFile = File(..., description="Video file (.mp4, .avi, .mov, etc.)"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Analyzes an uploaded video:
    1. Samples 15 evenly spaced frames across video duration.
    2. Extracts and crops detected faces in each frame.
    3. Runs inference across all extracted faces and aggregates fake probabilities.
    4. Selects the Grad-CAM heatmap of the frame with highest fake score.
    5. Persists the analysis record in SQLite.
    6. Returns combined analysis, frame count, and Base64 visual assets.
    """
    active_detector = get_detector()
    filename = file.filename or "uploaded_video.mp4"
    suffix = Path(filename).suffix or ".mp4"

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            temp_path = tmp_file.name

        # Extract faces from 15 evenly spaced video frames
        faces = extract_faces_from_video(temp_path, num_frames=15)
        if not faces:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No faces detected in the uploaded video. Please ensure the video contains clear, visible faces."
            )

        # Run multi-frame inference and select best Grad-CAM
        pred = active_detector.predict_video_faces(faces)

        # Encode representative (first) face as Base64 PNG
        original_face_b64 = encode_bgr_to_base64_png(faces[0])

        # Persist record in SQLite
        record = ScanRecord(
            filename=filename,
            media_type="video",
            fake_probability=pred["fake_probability"],
            verdict=pred["verdict"],
            frames_analyzed=pred["frames_analyzed"]
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "id": record.id,
            "filename": record.filename,
            "media_type": record.media_type,
            "fake_probability": record.fake_probability,
            "verdict": record.verdict,
            "frames_analyzed": record.frames_analyzed,
            "original_face_base64": original_face_b64,
            "heatmap_base64": pred["heatmap_base64"],
            "created_at": record.created_at.isoformat() if record.created_at else ""
        }

    finally:
        # Guarantee cleanup of temporary file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.warning("Failed to remove temp file '%s': %s", temp_path, e)


@app.get(
    "/history",
    response_model=List[HistoryRecordResponse],
    summary="Get recent scan history",
    tags=["History"]
)
def get_history(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    Returns the 20 most recent scan records ordered by creation timestamp descending.
    """
    records = (
        db.query(ScanRecord)
        .order_by(ScanRecord.created_at.desc())
        .limit(20)
        .all()
    )
    return [rec.to_dict() for rec in records]
