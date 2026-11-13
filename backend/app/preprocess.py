"""
DeepGuard Preprocessing Module
===============================
This module provides face detection and cropping utilities for DeepGuard:
1. `extract_face_from_image`: Detects the largest face using OpenCV's built-in
   Haar Cascade, expands the bounding box by a 20% padding margin, crops,
   and resizes the face to 224x224 pixels.
2. `extract_faces_from_video`: Samples evenly spaced frames across a video,
   extracts 224x224 cropped faces from each frame, and returns them as a list.
"""

import os
import sys
import argparse
from pathlib import Path
from typing import List, Optional, Union

import cv2
import cv2.data
import numpy as np

# Load OpenCV's built-in Haar Cascade frontal face detector
CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

if face_cascade.empty():
    print(f"[Warning] Failed to load Haar Cascade from: {CASCADE_PATH}", file=sys.stderr)


def extract_face_from_image(
    image_path: Union[str, Path, np.ndarray],
    padding_ratio: float = 0.2,
    target_size: tuple = (224, 224)
) -> Optional[np.ndarray]:
    """
    Detects the largest face in an image using OpenCV's Haar Cascade classifier,
    applies a padding margin around the detected face bounding box, crops it,
    resizes it to the target dimensions, and returns the cropped face image.

    Args:
        image_path (Union[str, Path, np.ndarray]): Either a filesystem path to an image file,
            or an already loaded OpenCV BGR image array.
        padding_ratio (float): Percentage margin to expand around the face bounding box
            (default is 0.2, representing 20% padding).
        target_size (tuple): Output resolution as (width, height). Default is (224, 224).

    Returns:
        Optional[np.ndarray]: Resized face image (224x224x3) in BGR format, or None if no face is detected.
    """
    # 1. Handle image input: file path or pre-loaded numpy array
    if isinstance(image_path, (str, Path)):
        path_str = str(image_path)
        if not os.path.isfile(path_str):
            print(f"[Warning] Image file not found: {path_str}", file=sys.stderr)
            return None
        image = cv2.imread(path_str)
        if image is None:
            print(f"[Warning] Could not decode image from: {path_str}", file=sys.stderr)
            return None
    elif isinstance(image_path, np.ndarray):
        image = image_path
    else:
        raise TypeError("image_path must be a file path (str, Path) or a numpy.ndarray image.")

    img_h, img_w = image.shape[:2]
    if img_h == 0 or img_w == 0:
        return None

    # 2. Convert to grayscale for Haar Cascade face detection
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 3. Detect faces using Haar Cascade
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
        flags=cv2.CASCADE_SCALE_IMAGE
    )

    # If no face is found, return None
    if len(faces) == 0:
        return None

    # 4. Identify the largest face by bounding box area (w * h)
    largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
    x, y, w, h = largest_face

    # 5. Add 20% padding margin around the face bounding box
    pad_w = int(w * padding_ratio)
    pad_h = int(h * padding_ratio)

    # Clamp coordinates to stay strictly within the original image boundaries
    x1 = max(0, x - pad_w)
    y1 = max(0, y - pad_h)
    x2 = min(img_w, x + w + pad_w)
    y2 = min(img_h, y + h + pad_h)

    # 6. Crop the face region
    cropped_face = image[y1:y2, x1:x2]
    if cropped_face.size == 0 or cropped_face.shape[0] == 0 or cropped_face.shape[1] == 0:
        return None

    # 7. Resize to target dimensions (224x224)
    resized_face = cv2.resize(cropped_face, target_size, interpolation=cv2.INTER_AREA)

    return resized_face


def extract_faces_from_video(
    video_path: Union[str, Path],
    num_frames: int = 15,
    padding_ratio: float = 0.2,
    target_size: tuple = (224, 224)
) -> List[np.ndarray]:
    """
    Extracts evenly spaced frames across a video file, runs face extraction on each
    frame, and returns a list of cropped, resized (224x224) face images.

    Args:
        video_path (Union[str, Path]): Path to the input video file.
        num_frames (int): Number of evenly spaced frames to extract across the video (default: 15).
        padding_ratio (float): Percentage margin around face bounding box (default: 0.2 -> 20%).
        target_size (tuple): Output resolution for faces (default: (224, 224)).

    Returns:
        List[np.ndarray]: List of extracted 224x224 face images (BGR format).
    """
    video_path_str = str(video_path)
    if not os.path.isfile(video_path_str):
        print(f"[Error] Video file not found: {video_path_str}", file=sys.stderr)
        return []

    cap = cv2.VideoCapture(video_path_str)
    if not cap.isOpened():
        print(f"[Error] Failed to open video: {video_path_str}", file=sys.stderr)
        return []

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    # Determine frame indices to sample evenly across the duration
    if total_frames > 0:
        if total_frames <= num_frames:
            # Video is shorter than requested frame count; take every frame
            frame_indices = list(range(total_frames))
        else:
            # Sample `num_frames` uniformly spaced indices
            frame_indices = np.linspace(0, total_frames - 1, num_frames, dtype=int).tolist()
    else:
        # Fallback if frame count cannot be determined from metadata:
        # Read all frames into memory and then downsample
        all_frames = []
        while True:
            ret, frame = cap.read()
            if not ret or frame is None:
                break
            all_frames.append(frame)
        cap.release()

        if len(all_frames) == 0:
            return []

        if len(all_frames) <= num_frames:
            selected_frames = all_frames
        else:
            sample_idxs = np.linspace(0, len(all_frames) - 1, num_frames, dtype=int)
            selected_frames = [all_frames[i] for i in sample_idxs]

        # Extract faces from sampled frames
        face_list = []
        for frame in selected_frames:
            face = extract_face_from_image(frame, padding_ratio=padding_ratio, target_size=target_size)
            if face is not None:
                face_list.append(face)
        return face_list

    # Extract faces from precomputed frame indices
    face_list = []
    for frame_idx in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret or frame is None:
            continue

        face = extract_face_from_image(
            frame,
            padding_ratio=padding_ratio,
            target_size=target_size
        )
        if face is not None:
            face_list.append(face)

    cap.release()
    return face_list


# ==============================================================================
# Standalone Test & Demo Block
# ==============================================================================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="DeepGuard Face Extraction Preprocessor Test Utility"
    )
    parser.add_argument(
        "--image",
        type=str,
        default=None,
        help="Path to an image file to test single-image face extraction."
    )
    parser.add_argument(
        "--video",
        type=str,
        default=None,
        help="Path to a video file to test multi-frame face extraction."
    )
    parser.add_argument(
        "--num-frames",
        type=int,
        default=15,
        help="Number of evenly spaced frames to extract from video (default: 15)."
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="test_output",
        help="Output directory to save extracted face crops (default: test_output)."
    )
    args = parser.parse_args()

    print("=" * 60)
    print(" DeepGuard Preprocessing Module - Self-Test")
    print("=" * 60)
    print(f"[Info] OpenCV Version: {cv2.__version__}")
    print(f"[Info] Haar Cascade Path: {CASCADE_PATH}")
    print(f"[Info] Cascade Loaded: {'Success' if not face_cascade.empty() else 'FAILED'}")

    os.makedirs(args.output_dir, exist_ok=True)

    # Case 1: Image extraction test
    if args.image:
        print(f"\n[Test] Running image extraction on: {args.image}")
        face = extract_face_from_image(args.image)
        if face is not None:
            out_path = os.path.join(args.output_dir, "extracted_face.jpg")
            cv2.imwrite(out_path, face)
            print(f"[Success] Face detected!")
            print(f"          - Resolution: {face.shape[1]}x{face.shape[0]} (Channels: {face.shape[2]})")
            print(f"          - Saved to: {out_path}")
        else:
            print("[Result] No face detected in the provided image.")

    # Case 2: Video extraction test
    elif args.video:
        print(f"\n[Test] Running video extraction on: {args.video} (Target frames: {args.num_frames})")
        faces = extract_faces_from_video(args.video, num_frames=args.num_frames)
        print(f"[Result] Extracted {len(faces)} faces across the video.")
        for idx, face in enumerate(faces):
            out_path = os.path.join(args.output_dir, f"face_frame_{idx + 1:03d}.jpg")
            cv2.imwrite(out_path, face)
        if faces:
            print(f"[Success] Saved {len(faces)} cropped faces to directory: '{args.output_dir}'")

    # Case 3: No arguments provided -> Run quick self-check demo
    else:
        print("\n[Self-Check] No --image or --video specified. Running pipeline validation...")
        
        # Test synthetic image creation
        synthetic_img = np.zeros((400, 400, 3), dtype=np.uint8)
        # Verify function handles non-face images gracefully
        test_result = extract_face_from_image(synthetic_img)
        assert test_result is None, "Synthetic blank image should return None"
        print("[Pass] Graceful handling of image without faces verified (returns None).")

        print("\n[Usage Instructions]")
        print("To test with your own media, run:")
        print("  1. Single Image Face Extraction:")
        print("     python backend/app/preprocess.py --image path/to/sample.jpg")
        print("\n  2. Video 15-Frame Face Extraction:")
        print("     python backend/app/preprocess.py --video path/to/sample.mp4 --num-frames 15")
        print("\nOutput face crops (224x224) will be saved in the 'test_output/' directory.")
        print("=" * 60)

