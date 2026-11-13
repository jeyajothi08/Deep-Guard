"""
DeepGuard Model Training Script
===============================
Trains an EfficientNet-B0 backbone for binary deepfake detection
(Class 0: Real, Class 1: Fake) using PyTorch, timm, and torchvision.

Compatible with Google Colab (T4 / V100 GPU), Apple Silicon (MPS),
and local CUDA/CPU workstations.
"""

import os
# Configure Matplotlib cache directory to writable location
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")

import argparse
import copy
import json
import logging
import time
from pathlib import Path
from typing import Dict, Tuple

import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
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
logger = logging.getLogger("DeepGuard.Train")


class StrictBinaryFolder(datasets.ImageFolder):
    """
    Subclass of ImageFolder that guarantees strictly:
    - 'real' is mapped to index 0
    - 'fake' is mapped to index 1
    matching DeepGuard's internal classification head contract.
    """
    def find_classes(self, directory: str) -> Tuple[list, Dict[str, int]]:
        classes, _ = super().find_classes(directory)
        class_to_idx = {}
        for c in classes:
            low = c.lower()
            if "real" in low:
                class_to_idx[c] = 0
            elif "fake" in low or "synth" in low:
                class_to_idx[c] = 1
            else:
                raise ValueError(f"Unknown subfolder name '{c}'. Expected 'real' or 'fake'.")
        ordered_classes = sorted(class_to_idx.keys(), key=lambda k: class_to_idx[k])
        return ordered_classes, class_to_idx


StrictBinaryImageFolder = StrictBinaryFolder


def get_data_transforms() -> Tuple[transforms.Compose, transforms.Compose]:
    """
    Returns data augmentation and normalization pipelines.
    Uses standard ImageNet statistics for EfficientNet-B0.
    """
    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]

    train_transform = transforms.Compose([
        transforms.Resize((240, 240)),
        transforms.RandomResizedCrop(224, scale=(0.85, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std),
    ])

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std),
    ])

    return train_transform, val_transform


def create_dummy_dataset(base_dir: Path, num_samples_per_class: int = 20) -> None:
    """
    Generates a minimal synthetic image dataset for testing & verification.
    """
    logger.info("Generating synthetic verification dataset at '%s'...", base_dir)
    for split in ["train", "val"]:
        for category in ["real", "fake"]:
            folder = base_dir / split / category
            folder.mkdir(parents=True, exist_ok=True)
            for i in range(num_samples_per_class if split == "train" else max(4, num_samples_per_class // 4)):
                # Synthetic RGB face placeholder with distinct color palettes
                color = (60, 160, 90) if category == "real" else (190, 60, 60)
                img = Image.new("RGB", (224, 224), color=color)
                img.save(folder / f"sample_{i:04d}.jpg")
    logger.info("Synthetic dataset creation complete.")


def train_one_epoch(
    model: nn.Module,
    dataloader: DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    device: torch.device
) -> Tuple[float, float]:
    """
    Executes one epoch of training.
    """
    model.train()
    running_loss = 0.0
    correct_predictions = 0
    total_samples = 0

    for inputs, labels in dataloader:
        inputs = inputs.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * inputs.size(0)
        _, preds = torch.max(outputs, 1)
        correct_predictions += torch.sum(preds == labels.data).item()
        total_samples += inputs.size(0)

    epoch_loss = running_loss / max(1, total_samples)
    epoch_acc = (correct_predictions / max(1, total_samples)) * 100.0
    return epoch_loss, epoch_acc


def validate(
    model: nn.Module,
    dataloader: DataLoader,
    criterion: nn.Module,
    device: torch.device
) -> Tuple[float, float]:
    """
    Evaluates model performance on the validation split.
    """
    model.eval()
    running_loss = 0.0
    correct_predictions = 0
    total_samples = 0

    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            outputs = model(inputs)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            correct_predictions += torch.sum(preds == labels.data).item()
            total_samples += inputs.size(0)

    val_loss = running_loss / max(1, total_samples)
    val_acc = (correct_predictions / max(1, total_samples)) * 100.0
    return val_loss, val_acc


def plot_curves(history: Dict[str, list], output_path: Path) -> None:
    """
    Renders and exports training and validation loss/accuracy curves.
    """
    epochs = range(1, len(history["train_loss"]) + 1)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Loss Curve
    ax1.plot(epochs, history["train_loss"], "o-", label="Train Loss", color="#6366f1", linewidth=2)
    ax1.plot(epochs, history["val_loss"], "s--", label="Val Loss", color="#ef4444", linewidth=2)
    ax1.set_title("Cross-Entropy Loss vs. Epochs", fontsize=13, fontweight="bold")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Loss")
    ax1.legend()
    ax1.grid(True, linestyle="--", alpha=0.5)

    # Accuracy Curve
    ax2.plot(epochs, history["train_acc"], "o-", label="Train Accuracy", color="#10b981", linewidth=2)
    ax2.plot(epochs, history["val_acc"], "s--", label="Val Accuracy", color="#38bdf8", linewidth=2)
    ax2.set_title("Classification Accuracy vs. Epochs (%)", fontsize=13, fontweight="bold")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Accuracy (%)")
    ax2.legend()
    ax2.grid(True, linestyle="--", alpha=0.5)

    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    plt.close()
    logger.info("Saved training curves to: %s", output_path)


def main():
    parser = argparse.ArgumentParser(description="DeepGuard EfficientNet-B0 Training Pipeline")
    parser.add_argument("--data-dir", type=str, default="dataset", help="Root dataset directory containing train/ and val/ subdirectories.")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs (default: 10).")
    parser.add_argument("--batch-size", type=int, default=32, help="Mini-batch size (default: 32).")
    parser.add_argument("--lr", type=float, default=3e-4, help="Peak learning rate for AdamW (default: 0.0003).")
    parser.add_argument("--weight-decay", type=float, default=1e-2, help="Weight decay for AdamW regularization (default: 0.01).")
    parser.add_argument("--num-workers", type=int, default=0, help="DataLoader worker processes (default: 0).")
    parser.add_argument("--output-dir", type=str, default="output", help="Directory where weights and metrics will be saved.")
    parser.add_argument("--generate-dummy-data", action="store_true", help="Generate a small synthetic dataset for testing if dataset is missing.")
    parser.add_argument("--device", type=str, default=None, help="Target hardware: 'cuda', 'mps', or 'cpu'. Defaults to auto-detect.")
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
    logger.info("Target execution device: %s", device)

    # Dataset validation
    data_path = Path(args.data_dir).resolve()
    train_dir = data_path / "train"
    val_dir = data_path / "val"

    if not train_dir.exists() or not val_dir.exists():
        if args.generate_dummy_data:
            create_dummy_dataset(data_path, num_samples_per_class=24)
        else:
            logger.warning("Dataset not found at '%s'. Auto-generating synthetic test dataset...", data_path)
            create_dummy_dataset(data_path, num_samples_per_class=24)

    train_transform, val_transform = get_data_transforms()

    train_dataset = StrictBinaryImageFolder(str(train_dir), transform=train_transform)
    val_dataset = StrictBinaryImageFolder(str(val_dir), transform=val_transform)

    logger.info("Found %d training samples and %d validation samples.", len(train_dataset), len(val_dataset))
    logger.info("Class-to-index mapping: %s", train_dataset.class_to_idx)

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=args.num_workers,
        pin_memory=(device.type == "cuda")
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=args.num_workers,
        pin_memory=(device.type == "cuda")
    )

    # Initialize EfficientNet-B0 with binary head (num_classes=2)
    logger.info("Initializing EfficientNet-B0 backbone (pretrained=True, num_classes=2)...")
    model = timm.create_model("efficientnet_b0", pretrained=True, num_classes=2)
    model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-6)

    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    weights_path = output_dir / "deepguard_effnet.pth"

    best_val_acc = 0.0
    best_weights = None
    history = {
        "train_loss": [],
        "train_acc": [],
        "val_loss": [],
        "val_acc": []
    }

    start_time = time.time()
    logger.info("Starting training loop for %d epochs...", args.epochs)

    for epoch in range(1, args.epochs + 1):
        epoch_start = time.time()
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        scheduler.step()

        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)

        epoch_duration = time.time() - epoch_start
        logger.info(
            "Epoch [%02d/%02d] (%.1fs) | Train Loss: %.4f, Acc: %.2f%% | Val Loss: %.4f, Acc: %.2f%%",
            epoch, args.epochs, epoch_duration, train_loss, train_acc, val_loss, val_acc
        )

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_weights = copy.deepcopy(model.state_dict())
            torch.save(best_weights, weights_path)
            logger.info("--> Best model updated & saved to '%s' (Val Acc: %.2f%%)", weights_path, val_acc)

    total_time = time.time() - start_time
    logger.info("Training completed in %.1f minutes. Peak Val Acc: %.2f%%", total_time / 60.0, best_val_acc)

    # Save training curves plot
    curves_path = output_dir / "training_curves.png"
    plot_curves(history, curves_path)

    # Save training run metadata
    metadata = {
        "architecture": "efficientnet_b0",
        "epochs": args.epochs,
        "batch_size": args.batch_size,
        "learning_rate": args.lr,
        "weight_decay": args.weight_decay,
        "best_val_accuracy": round(best_val_acc, 2),
        "target_weights_file": "deepguard_effnet.pth",
        "destination_for_backend": "backend/weights/deepguard_effnet.pth"
    }
    with open(output_dir / "training_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    logger.info("Deployment Note: Copy '%s' into 'backend/weights/deepguard_effnet.pth' to activate in DeepGuard.", weights_path)


if __name__ == "__main__":
    main()
