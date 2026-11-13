"""
DeepGuard Model Inference & Explainability Module
=================================================
This module defines the `DeepfakeDetector` class which:
1. Loads an EfficientNet-B0 backbone (from `timm`) configured for binary
   classification (Index 0 = Real, Index 1 = Fake).
2. Automatically assigns computation to Apple Silicon GPU (`mps`), NVIDIA GPU
   (`cuda`), or falls back to `cpu`.
3. Loads custom fine-tuned weights if present at `backend/weights/deepguard_effnet.pth`,
   or gracefully falls back to default pretrained ImageNet weights with a warning.
4. Generates visual explainability heatmaps using PyTorch Grad-CAM on `model.conv_head`,
   encoded as Base64 PNG data URLs for direct frontend rendering.
5. Provides single-face (`predict_face`) and multi-frame video (`predict_video_faces`)
   prediction workflows.
"""

import os
# Configure Matplotlib cache directory to a writable location to avoid sandbox warnings
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")

import base64
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import cv2
import numpy as np
from PIL import Image
import timm
import torch
import torch.nn as nn
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

# Configure module logger
logger = logging.getLogger("DeepGuard.Model")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Standard ImageNet normalization parameters
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


class DeepfakeDetector:
    """
    EfficientNet-B0 based deepfake detector with Grad-CAM explainability.
    """

    def __init__(self, weights_path: Optional[Union[str, Path]] = None) -> None:
        """
        Initializes the model, selects target device, and loads weights.

        Args:
            weights_path (Optional[Union[str, Path]]): Optional path to custom weights.
                Defaults to 'backend/weights/deepguard_effnet.pth'.
        """
        # 1. Automatic device selection: MPS (Apple Silicon), CUDA, or CPU
        if torch.backends.mps.is_available():
            self.device = torch.device("mps")
        elif torch.cuda.is_available():
            self.device = torch.device("cuda")
        else:
            self.device = torch.device("cpu")
        logger.info("Using device: %s", self.device)

        # 2. Resolve weights file path
        if weights_path is not None:
            resolved_weights = Path(weights_path).resolve()
        else:
            # Check relative to backend root: backend/weights/deepguard_effnet.pth
            current_dir = Path(__file__).resolve().parent  # backend/app
            backend_dir = current_dir.parent               # backend
            resolved_weights = backend_dir / "weights" / "deepguard_effnet.pth"

        # 3. Initialize EfficientNet-B0 architecture (binary classification: 0=Real, 1=Fake)
        custom_weights_loaded = False
        if resolved_weights.is_file():
            logger.info("Found custom weights at '%s'. Loading...", resolved_weights)
            try:
                self.model = timm.create_model("efficientnet_b0", pretrained=False, num_classes=2)
                state_dict = torch.load(resolved_weights, map_location=self.device)
                self.model.load_state_dict(state_dict)
                custom_weights_loaded = True
                logger.info("Successfully loaded custom weights from '%s'.", resolved_weights)
            except Exception as exc:
                logger.warning(
                    "Failed to load custom weights from '%s' (%s). Falling back to pretrained weights.",
                    resolved_weights, exc
                )

        if not custom_weights_loaded:
            logger.warning(
                "Custom weights not found at '%s'. Falling back to default pretrained ImageNet weights for testing.",
                resolved_weights
            )
            try:
                self.model = timm.create_model("efficientnet_b0", pretrained=True, num_classes=2)
            except Exception as exc:
                logger.warning(
                    "Failed to download/load pretrained ImageNet weights (%s). Initializing model with default weights.",
                    exc
                )
                self.model = timm.create_model("efficientnet_b0", pretrained=False, num_classes=2)

        self.model.to(self.device)
        self.model.eval()

        # Target layer for Grad-CAM is the final convolutional layer of EfficientNet
        self.target_layer = self.model.conv_head

    @staticmethod
    def classify_score(fake_prob: float) -> str:
        """
        Classifies a fake probability percentage into a user-facing verdict.

        Args:
            fake_prob (float): Fake probability percentage in range [0.0, 100.0].

        Returns:
            str: "Likely Real" (< 35.0), "Inconclusive" (35.0 to 65.0), or "Likely Fake" (> 65.0).
        """
        if fake_prob < 35.0:
            return "Likely Real"
        elif fake_prob <= 65.0:
            return "Inconclusive"
        else:
            return "Likely Fake"

    def predict_face(self, face_bgr_np: np.ndarray) -> Dict[str, Any]:
        """
        Runs inference and Grad-CAM explainability on a single cropped face image.

        Args:
            face_bgr_np (np.ndarray): 224x224 BGR face image (from OpenCV).

        Returns:
            Dict[str, Any]:
                - fake_probability (float): Fake probability rounded to 2 decimal places.
                - verdict (str): Categorical verdict ("Likely Real", "Inconclusive", "Likely Fake").
                - heatmap_base64 (str): Base64 PNG data URL string of the Grad-CAM visualization.
        """
        if not isinstance(face_bgr_np, np.ndarray) or face_bgr_np.size == 0:
            raise ValueError("Input face_bgr_np must be a non-empty numpy array.")

        # Ensure input dimensions are 224x224
        if face_bgr_np.shape[:2] != (224, 224):
            face_bgr_np = cv2.resize(face_bgr_np, (224, 224), interpolation=cv2.INTER_AREA)

        # 1. Convert BGR to RGB and float32 in range [0, 1]
        face_rgb = cv2.cvtColor(face_bgr_np, cv2.COLOR_BGR2RGB)
        rgb_float = face_rgb.astype(np.float32) / 255.0

        # 2. Normalize using standard ImageNet mean and standard deviation
        norm_img = (rgb_float - IMAGENET_MEAN) / IMAGENET_STD

        # 3. Convert to PyTorch tensor (1, 3, 224, 224) on target device
        tensor_img = (
            torch.from_numpy(norm_img.transpose(2, 0, 1))
            .unsqueeze(0)
            .to(self.device)
        )

        # 4. Forward inference to compute Fake probability (index 1)
        with torch.no_grad():
            logits = self.model(tensor_img)
            probs = torch.softmax(logits, dim=1)
            fake_prob = float(probs[0, 1].item()) * 100.0

        verdict = self.classify_score(fake_prob)

        # 5. Generate Grad-CAM heatmap targeting index 1 (Fake class)
        targets = [ClassifierOutputTarget(1)]
        heatmap_base64 = ""

        try:
            with GradCAM(model=self.model, target_layers=[self.target_layer]) as cam:
                grayscale_cam = cam(input_tensor=tensor_img, targets=targets)
                cam_mask = grayscale_cam[0, :]
                cam_overlay_rgb = show_cam_on_image(rgb_float, cam_mask, use_rgb=True)

            # Convert RGB overlay to BGR for OpenCV encoding
            cam_overlay_bgr = cv2.cvtColor(cam_overlay_rgb, cv2.COLOR_RGB2BGR)
            success, buffer = cv2.imencode(".png", cam_overlay_bgr)
            if success:
                b64_str = base64.b64encode(buffer.tobytes()).decode("utf-8")
                heatmap_base64 = f"data:image/png;base64,{b64_str}"
        except Exception as exc:
            logger.error("Grad-CAM generation failed: %s", exc)

        return {
            "fake_probability": round(fake_prob, 2),
            "verdict": verdict,
            "heatmap_base64": heatmap_base64,
        }

    def predict_video_faces(self, faces_list: List[np.ndarray]) -> Dict[str, Any]:
        """
        Runs inference across multiple sampled face crops from a video, computing aggregate
        statistics and retaining the most significant Grad-CAM heatmap.

        Args:
            faces_list (List[np.ndarray]): List of 224x224 BGR cropped face arrays.

        Returns:
            Dict[str, Any]:
                - fake_probability (float): Average fake probability across analyzed frames.
                - verdict (str): Final aggregate classification verdict.
                - heatmap_base64 (str): Grad-CAM heatmap of the frame with the highest fake score.
                - frames_analyzed (int): Number of successfully analyzed face frames.
        """
        if not faces_list:
            return {
                "fake_probability": 0.0,
                "verdict": "Inconclusive",
                "heatmap_base64": "",
                "frames_analyzed": 0,
            }

        probabilities = []
        highest_fake_prob = -1.0
        best_heatmap_b64 = ""

        for face in faces_list:
            if face is None or not isinstance(face, np.ndarray) or face.size == 0:
                continue

            result = self.predict_face(face)
            prob = result["fake_probability"]
            probabilities.append(prob)

            if prob > highest_fake_prob:
                highest_fake_prob = prob
                best_heatmap_b64 = result["heatmap_base64"]

        if not probabilities:
            return {
                "fake_probability": 0.0,
                "verdict": "Inconclusive",
                "heatmap_base64": "",
                "frames_analyzed": 0,
            }

        avg_fake_prob = float(np.mean(probabilities))
        final_verdict = self.classify_score(avg_fake_prob)

        return {
            "fake_probability": round(avg_fake_prob, 2),
            "verdict": final_verdict,
            "heatmap_base64": best_heatmap_b64,
            "frames_analyzed": len(probabilities),
        }


# ==============================================================================
# Standalone Test & Demo Block
# ==============================================================================
if __name__ == "__main__":
    print("=" * 65)
    print(" DeepGuard DeepfakeDetector - Self-Test & Verification")
    print("=" * 65)

    detector = DeepfakeDetector()

    # Generate synthetic 224x224 BGR test face pattern
    test_face = np.full((224, 224, 3), 120, dtype=np.uint8)
    # Draw simple facial feature placeholders
    cv2.circle(test_face, (112, 112), 70, (210, 180, 150), -1)  # Face contour
    cv2.circle(test_face, (85, 95), 10, (50, 50, 50), -1)       # Left eye
    cv2.circle(test_face, (139, 95), 10, (50, 50, 50), -1)      # Right eye
    cv2.ellipse(test_face, (112, 145), (25, 12), 0, 0, 180, (40, 40, 180), 3)  # Mouth

    print("\n[Test 1] Single Face Prediction:")
    res_single = detector.predict_face(test_face)
    print(f"  - Fake Probability: {res_single['fake_probability']}%")
    print(f"  - Verdict:          {res_single['verdict']}")
    print(f"  - Heatmap Data URL: {res_single['heatmap_base64'][:45]}... (Length: {len(res_single['heatmap_base64'])})")

    assert "fake_probability" in res_single
    assert "verdict" in res_single
    assert res_single["heatmap_base64"].startswith("data:image/png;base64,")

    print("\n[Test 2] Multi-Frame Video Faces Prediction:")
    test_frames = [test_face, np.fliplr(test_face)]
    res_video = detector.predict_video_faces(test_frames)
    print(f"  - Analyzed Frames:  {res_video['frames_analyzed']}")
    print(f"  - Avg Fake Prob:    {res_video['fake_probability']}%")
    print(f"  - Verdict:          {res_video['verdict']}")
    print(f"  - Heatmap Data URL: {res_video['heatmap_base64'][:45]}... (Length: {len(res_video['heatmap_base64'])})")

    assert res_video["frames_analyzed"] == 2
    assert "verdict" in res_video
    assert res_video["heatmap_base64"].startswith("data:image/png;base64,")

    print("\n[Test 3] Empty Video Frames Handling:")
    res_empty = detector.predict_video_faces([])
    print(f"  - Empty Frames Analyzed: {res_empty['frames_analyzed']}")
    print(f"  - Empty Result Verdict:  {res_empty['verdict']}")
    assert res_empty["frames_analyzed"] == 0

    print("\n" + "=" * 65)
    print(" ALL TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)

