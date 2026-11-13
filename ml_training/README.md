# 🧪 DeepGuard Machine Learning & Research Suite

This directory contains the complete training pipeline, Google Colab Jupyter Notebook, and academic evaluation suite for **DeepGuard's EfficientNet-B0** deepfake detection backbone.

---

## 📂 Directory Contents

| File | Purpose |
| :--- | :--- |
| **`train_deepguard.ipynb`** | Turnkey Jupyter Notebook optimized for **Google Colab (free T4 GPU)**. |
| **`train_deepguard.py`** | Standalone PyTorch/`timm` training CLI script for local or cloud clusters. |
| **`evaluate_research.py`** | Research benchmark evaluator (Confusion Matrix, ROC-AUC, Video Compression Degradation). |
| **`README.md`** | Step-by-step guide for training, evaluation, and weight deployment. |

---

## 🚀 How to Train on Google Colab (Recommended)

Google Colab provides free access to NVIDIA T4 GPUs, accelerating training by up to 15x compared to standard CPUs.

### Step 1: Open Notebook in Google Colab
1. Navigate to [Google Colab](https://colab.research.google.com/).
2. Click **Upload** and select `ml_training/train_deepguard.ipynb` from this repository.

### Step 2: Enable GPU Hardware Acceleration
1. In the top navigation menu, go to **Runtime** > **Change runtime type**.
2. Under **Hardware accelerator**, select **T4 GPU**.
3. Click **Save**.

### Step 3: Run the Cells
Execute the cells in sequence:
- **Environment Check:** Verifies CUDA availability (`torch.cuda.is_available()`).
- **Dependencies:** Installs `timm`, `torchvision`, `scikit-learn`, and `matplotlib`.
- **Dataset Setup:** If you have a Kaggle account, you can download the **140k Real and Fake Faces** dataset:
  ```bash
  !pip install -q kaggle
  # Upload your kaggle.json API token to ~/.kaggle/kaggle.json
  !kaggle datasets download -d xhlulu/140k-real-and-fake-faces
  !unzip -q 140k-real-and-fake-faces.zip -d dataset/
  ```
  *(Note: If no dataset is uploaded, the notebook automatically synthesizes placeholder training data for validation.)*
- **Training:** Trains `efficientnet_b0` (pretrained on ImageNet) using `AdamW` (`lr=3e-4`, `weight_decay=1e-2`) and `CosineAnnealingLR` scheduler over 10 epochs.
- **Export:** Downloads `deepguard_effnet.pth` and `training_curves.png` directly to your local computer.

---

## 🎯 Where to Place Trained Model Weights

Once training completes, place the exported file strictly at:

```
Deep Guard/
└── backend/
    └── weights/
        └── deepguard_effnet.pth   <-- PLACE WEIGHTS FILE HERE
```

When you start the FastAPI backend:
```bash
./venv/bin/uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
DeepGuard will automatically detect the custom weights and log:
```
[INFO] Found custom weights at '.../backend/weights/deepguard_effnet.pth'. Loading...
[INFO] Successfully loaded custom weights from '.../backend/weights/deepguard_effnet.pth'.
```

---

## 💻 Local Training CLI (`train_deepguard.py`)

To run the training script locally:

```bash
# Basic run with automatic hardware detection (CUDA / Apple Silicon MPS / CPU)
python ml_training/train_deepguard.py --data-dir dataset --epochs 10 --batch-size 32

# Verify pipeline quickly with synthetic placeholder samples
python ml_training/train_deepguard.py --generate-dummy-data --epochs 3 --batch-size 8
```

Output files will be generated in `output/`:
- `output/deepguard_effnet.pth` (Model checkpoint)
- `output/training_curves.png` (Loss & accuracy progression)
- `output/training_metadata.json` (Hyperparameters & validation summary)

---

## 🔬 Research & Robustness Evaluation (`evaluate_research.py`)

DeepGuard includes an empirical research evaluation script to generate presentation and viva metrics:

```bash
# Run evaluation on test images and evaluate video compression robustness
python ml_training/evaluate_research.py \
  --weights backend/weights/deepguard_effnet.pth \
  --test-dir dataset/val \
  --output-dir research_results
```

### What It Generates:
1. **Classification Report:** Precision, Recall, F1-Score, and ROC-AUC metrics.
2. **Confusion Matrix Plot:** Exported as `research_results/confusion_matrix.png`.
3. **ROC Curve Plot:** Exported as `research_results/roc_curve.png`.
4. **Video Compression Robustness Table:** Evaluates model resilience under **Raw/Lossless**, **H.264 Web (CRF 23)**, and **Aggressive Social Media Compression (CRF 40)**.

