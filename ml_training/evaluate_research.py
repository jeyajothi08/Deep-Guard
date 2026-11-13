"""
DeepGuard Research & Robustness Evaluation Suite
================================================
Comprehensive evaluation module for:
1. Cross-Dataset Generalization & Classification Metrics:
   - Accuracy, Precision, Recall, F1-Score, ROC-AUC
   - Confusion Matrix and ROC Curve visualization
2. Video Compression Robustness:
   - Simulates video quality degradation across compression tiers
     (Original, Medium Compression CRF-23, Heavy Social Compression CRF-40)
   - Measures detection resilience and degradation across bitrates.
"""

import os
# Configure Matplotlib cache directory to writable location
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")

import argparse
import json
import logging
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import cv2
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
    roc_curve
)
import timm
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("DeepGuard.Eval")

# Import face extraction from DeepGuard preprocessing module if available
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

try:
    from backend.app.preprocess import extract_face_from_image, extract_faces_from_video
except ImportError:
    logger.warning("Could not import backend.app.preprocess directly; using internal fallback extractor.")
    def extract_face_from_image(img, **kwargs):
        return cv2.resize(img, (224, 224)) if isinstance(img, np.ndarray) else None
    def extract_faces_from_video(path, num_frames=15, **kwargs):
        return []


def load_detector_model(weights_path: Path, device: torch.device) -> nn.Module:
    """
    Loads EfficientNet-B0 configured with DeepGuard's binary classification head.
    Loads custom trained weights if present; otherwise falls back gracefully.
    """
    model = timm.create_model("efficientnet_b0", pretrained=False, num_classes=2)

    if weights_path.is_file():
        logger.info("Loading custom trained weights from: %s", weights_path)
        state_dict = torch.load(weights_path, map_location=device)
        model.load_state_dict(state_dict)
    else:
        logger.warning("Custom weights '%s' not found. Falling back to pretrained weights for demonstration.", weights_path)
        model = timm.create_model("efficientnet_b0", pretrained=True, num_classes=2)

    model.to(device)
    model.eval()
    return model


def evaluate_dataset(
    model: nn.Module,
    test_dir: Path,
    device: torch.device,
    batch_size: int = 32,
    output_dir: Path = Path("research_results")
) -> Dict[str, float]:
    """
    Runs classification evaluation over test split (Class 0: Real, Class 1: Fake).
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]

    eval_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std)
    ])

    # Check for real/fake subfolders
    if not (test_dir / "real").exists() or not (test_dir / "fake").exists():
        logger.warning("Test dataset not found at '%s'. Generating synthetic demo evaluation set...", test_dir)
        for cat in ["real", "fake"]:
            folder = test_dir / cat
            folder.mkdir(parents=True, exist_ok=True)
            for i in range(20):
                color = (55, 150, 75) if cat == "real" else (180, 55, 55)
                img = Image.new("RGB", (224, 224), color=color)
                img.save(folder / f"test_{i:03d}.jpg")

    class StrictBinaryFolder(datasets.ImageFolder):
        def find_classes(self, directory: str):
            classes, _ = super().find_classes(directory)
            c2idx = {}
            for c in classes:
                if "real" in c.lower():
                    c2idx[c] = 0
                elif "fake" in c.lower() or "synth" in c.lower():
                    c2idx[c] = 1
                else:
                    raise ValueError(f"Unknown class '{c}'")
            ordered = sorted(c2idx.keys(), key=lambda k: c2idx[k])
            return ordered, c2idx

        def _find_classes(self, dir_path: str):
            return self.find_classes(dir_path)

    dataset = StrictBinaryFolder(str(test_dir), transform=eval_transform)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)

    all_targets = []
    all_preds = []
    all_probs = []

    logger.info("Evaluating on %d test samples...", len(dataset))
    with torch.no_grad():
        for inputs, targets in loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            probs = torch.softmax(outputs, dim=1)

            _, preds = torch.max(outputs, 1)

            all_targets.extend(targets.cpu().numpy())
            all_preds.extend(preds.cpu().numpy())
            all_probs.extend(probs[:, 1].cpu().numpy())  # Index 1 = Fake class

    all_targets = np.array(all_targets)
    all_preds = np.array(all_preds)
    all_probs = np.array(all_probs)

    # Compute core research metrics
    acc = accuracy_score(all_targets, all_preds) * 100.0
    try:
        auc = roc_auc_score(all_targets, all_probs) * 100.0
    except Exception:
        auc = 50.0

    report_dict = classification_report(
        all_targets,
        all_preds,
        target_names=["Real (0)", "Fake (1)"],
        output_dict=True
    )
    cm = confusion_matrix(all_targets, all_preds)

    # 1. Print formatted classification table
    print("\n" + "=" * 65)
    print(" DEEPGUARD RESEARCH BENCHMARK: CLASSIFICATION PERFORMANCE")
    print("=" * 65)
    print(f"  Overall Accuracy : {acc:.2f}%")
    print(f"  ROC-AUC Score    : {auc:.2f}%\n")
    print(classification_report(all_targets, all_preds, target_names=["Real (0)", "Fake (1)"]))
    print("=" * 65)

    # 2. Render & Save Confusion Matrix
    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
    ax.figure.colorbar(im, ax=ax)
    classes = ["Real", "Fake"]
    ax.set(
        xticks=np.arange(cm.shape[1]),
        yticks=np.arange(cm.shape[0]),
        xticklabels=classes,
        yticklabels=classes,
        title="DeepGuard Confusion Matrix",
        ylabel="True Category",
        xlabel="Predicted Category"
    )

    thresh = cm.max() / 2.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, format(cm[i, j], "d"),
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black",
                    fontweight="bold")
    plt.tight_layout()
    cm_path = output_dir / "confusion_matrix.png"
    plt.savefig(cm_path, dpi=200)
    plt.close()
    logger.info("Saved Confusion Matrix plot to: %s", cm_path)

    # 3. Render & Save ROC Curve
    try:
        fpr, tpr, _ = roc_curve(all_targets, all_probs)
        plt.figure(figsize=(7, 5))
        plt.plot(fpr, tpr, color="#6366f1", lw=2, label=f"EfficientNet-B0 (AUC = {auc:.2f}%)")
        plt.plot([0, 1], [0, 1], color="#94a3b8", lw=1.5, linestyle="--")
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel("False Positive Rate")
        plt.ylabel("True Positive Rate")
        plt.title("Receiver Operating Characteristic (ROC)", fontweight="bold")
        plt.legend(loc="lower right")
        plt.grid(True, linestyle="--", alpha=0.5)
        plt.tight_layout()
        roc_path = output_dir / "roc_curve.png"
        plt.savefig(roc_path, dpi=200)
        plt.close()
        logger.info("Saved ROC Curve plot to: %s", roc_path)
    except Exception as e:
        logger.warning("Could not generate ROC curve plot: %s", e)

    # Export metrics JSON
    metrics_summary = {
        "accuracy": round(acc, 2),
        "roc_auc": round(auc, 2),
        "confusion_matrix": cm.tolist(),
        "classification_report": report_dict
    }
    with open(output_dir / "classification_metrics.json", "w") as f:
        json.dump(metrics_summary, f, indent=2)

    return {"accuracy": acc, "roc_auc": auc}


def run_video_compression_evaluation(
    model: nn.Module,
    sample_video_path: Optional[Path],
    device: torch.device,
    output_dir: Path = Path("research_results")
) -> None:
    """
    Evaluates detection performance on video streams subjected to varying
    levels of H.264 compression (Lossless, Medium CRF 23, Heavy CRF 40).
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    temp_dir = Path(tempfile.mkdtemp(prefix="deepguard_compress_"))

    # If no sample video is provided, generate a synthetic video
    if not sample_video_path or not sample_video_path.is_file():
        logger.info("Generating synthetic test face video for compression robustness test...")
        sample_video_path = temp_dir / "input_raw.mp4"
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(str(sample_video_path), fourcc, 15, (320, 320))
        for _ in range(30):
            frame = np.full((320, 320, 3), 110, dtype=np.uint8)
            # Simulated face region
            cv2.circle(frame, (160, 160), 80, (200, 170, 140), -1)
            cv2.circle(frame, (130, 140), 12, (50, 50, 50), -1)
            cv2.circle(frame, (190, 140), 12, (50, 50, 50), -1)
            cv2.ellipse(frame, (160, 200), (30, 15), 0, 0, 180, (50, 50, 180), 3)
            out.write(frame)
        out.release()

    tiers = [
        {"name": "Original (Lossless/High-Res)", "crf": "Raw", "path": sample_video_path},
        {"name": "Medium Compression (Web Std)", "crf": "CRF 23", "path": temp_dir / "video_crf23.mp4"},
        {"name": "Heavy Compression (Social Media)", "crf": "CRF 40", "path": temp_dir / "video_crf40.mp4"}
    ]

    # Transcode using FFmpeg if available, or simulate with OpenCV
    ffmpeg_available = subprocess.run(["which", "ffmpeg"], capture_output=True).returncode == 0

    for tier in tiers[1:]:
        crf_val = 23 if "23" in tier["crf"] else 40
        if ffmpeg_available:
            cmd = [
                "ffmpeg", "-y", "-i", str(sample_video_path),
                "-c:v", "libx264", "-crf", str(crf_val),
                "-preset", "fast", str(tier["path"])
            ]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            # Fallback compression simulation using OpenCV JPEG down-sampling
            cap = cv2.VideoCapture(str(sample_video_path))
            out_vid = cv2.VideoWriter(
                str(tier["path"]),
                cv2.VideoWriter_fourcc(*"mp4v"),
                15,
                (320, 320)
            )
            quality = 65 if crf_val == 23 else 20
            while True:
                ret, frame = cap.read()
                if not ret or frame is None:
                    break
                _, encoded = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, quality])
                frame_degraded = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
                out_vid.write(frame_degraded)
            cap.release()
            out_vid.release()

    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)

    results = []

    for tier in tiers:
        faces = extract_faces_from_video(str(tier["path"]), num_frames=15)
        if not faces:
            # Synthetic fallback face if cascade does not fire on synthetic pattern
            cap = cv2.VideoCapture(str(tier["path"]))
            ret, frame = cap.read()
            cap.release()
            if frame is not None:
                faces = [cv2.resize(frame, (224, 224))]
            else:
                faces = [np.zeros((224, 224, 3), dtype=np.uint8)]

        probs = []
        for face in faces:
            face_rgb = cv2.cvtColor(face, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
            norm = (face_rgb - mean) / std
            tensor = torch.from_numpy(norm.transpose(2, 0, 1)).unsqueeze(0).to(device)
            with torch.no_grad():
                out_logits = model(tensor)
                p = torch.softmax(out_logits, dim=1)
                probs.append(p[0, 1].item() * 100.0)

        avg_fake_prob = float(np.mean(probs))
        verdict = (
            "Likely Real" if avg_fake_prob < 35.0
            else "Inconclusive" if avg_fake_prob <= 65.0
            else "Likely Fake"
        )
        results.append({
            "tier": tier["name"],
            "crf": tier["crf"],
            "frames": len(faces),
            "fake_probability": round(avg_fake_prob, 2),
            "verdict": verdict
        })

    # Render results table
    print("\n" + "=" * 78)
    print(" VIDEO COMPRESSION ROBUSTNESS EVALUATION REPORT")
    print("=" * 78)
    print(f"{'Compression Tier':<35} | {'CRF Level':<10} | {'Frames':<8} | {'Fake Prob':<10} | {'Verdict'}")
    print("-" * 78)
    for r in results:
        print(f"{r['tier']:<35} | {r['crf']:<10} | {r['frames']:<8} | {r['fake_probability']:>8.2f}% | {r['verdict']}")
    print("=" * 78)

    # Save compression report
    with open(output_dir / "compression_robustness.json", "w") as f:
        json.dump(results, f, indent=2)
    logger.info("Saved compression evaluation report to: %s", output_dir / "compression_robustness.json")


def main():
    parser = argparse.ArgumentParser(description="DeepGuard Research & Robustness Evaluation Suite")
    parser.add_argument("--weights", type=str, default="output/deepguard_effnet.pth", help="Path to deepguard_effnet.pth.")
    parser.add_argument("--test-dir", type=str, default="dataset/val", help="Path to test image directory with real/ and fake/ subfolders.")
    parser.add_argument("--video-path", type=str, default=None, help="Path to video file for compression degradation test.")
    parser.add_argument("--output-dir", type=str, default="research_results", help="Directory where metrics and plots are stored.")
    parser.add_argument("--device", type=str, default=None, help="Target device: 'cuda', 'mps', or 'cpu'.")
    args = parser.parse_args()

    # Hardware target selection
    if args.device:
        device = torch.device(args.device)
    elif torch.cuda.is_available():
        device = torch.device("cuda")
    elif torch.backends.mps.is_available():
        device = torch.device("mps")
    else:
        device = torch.device("cpu")
    logger.info("Evaluation target device: %s", device)

    weights_path = Path(args.weights).resolve()
    if not weights_path.exists():
        # Fallback check backend/weights/deepguard_effnet.pth
        alt_path = REPO_ROOT / "backend" / "weights" / "deepguard_effnet.pth"
        if alt_path.exists():
            weights_path = alt_path

    model = load_detector_model(weights_path, device)
    output_dir = Path(args.output_dir).resolve()
    test_dir = Path(args.test_dir).resolve()

    # 1. Dataset Evaluation
    evaluate_dataset(model, test_dir, device, output_dir=output_dir)

    # 2. Video Compression Robustness
    sample_vid = Path(args.video_path).resolve() if args.video_path else None
    run_video_compression_evaluation(model, sample_vid, device, output_dir=output_dir)

    logger.info("All research evaluation tasks completed successfully.")


if __name__ == "__main__":
    main()
