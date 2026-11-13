<div align="center">

# 🛡️ DeepGuard
### **Next-Gen Explainable AI (XAI) Deepfake Image & Video Forensic Detection System**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/Inference-PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![OpenCV](https://img.shields.io/badge/Vision-OpenCV_4-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br/>

<p align="center">
  <strong>DeepGuard</strong> is an enterprise-grade, end-to-end forensic analysis platform designed to identify, analyze, and visually explain facial synthetic manipulations across digital media. Powered by <strong>EfficientNet-B0</strong>, <strong>PyTorch Grad-CAM</strong> visual attention heatmaps, and a reactive <strong>Cyber-Forensic React Dashboard</strong>.
</p>

[Explore Documentation](#-api-documentation) • [Live Dashboard Tour](#-user-interface-walkthrough) • [Quickstart Guide](#-quick-start-guide) • [Pipeline Architecture](#-system-overview--core-highlights)

</div>

---

## 📸 System Overview & Core Highlights

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               DEEPGUARD FORENSIC PIPELINE                              │
└────────────────────────────────────────────────────────────────────────────────────────┘
        │
        ├── 📥 [User Input] ──────────► Raw Image (.jpg, .png) or Video (.mp4, .mov, .avi)
        │
        ├── 🎯 [Face Extraction] ────► Haar Cascade Detector (20% Boundary Padding Margin)
        │                              ↳ Resized & Normalized to 224x224 RGB Float32
        │
        ├── 🧠 [Neural Backbone] ────► EfficientNet-B0 (Transfer Learning / Binary Head)
        │                              ↳ Hardware Acceleration: Apple Silicon MPS / CUDA / CPU
        │
        ├── 🔬 [Explainable AI] ─────► PyTorch Grad-CAM on `model.conv_head`
        │                              ↳ High-temperature activation heatmaps (Overlay BGR -> PNG)
        │
        ├── 💾 [Persistence] ────────► SQLite Database (`scan_records` tracking timestamps & scores)
        │
        └── 🖥️ [Forensic UI] ────────► React + Vite Cybersecurity Dashboard & Printable Reports
```

---

## ✨ Cutting-Edge Capabilities

| Feature | Technical Specification | Practical Benefit |
| :--- | :--- | :--- |
| **Haar Cascade Extraction** | Automatic dominant face isolation with **20% padding** | Prevents background noise from influencing the classification score. |
| **Multi-Frame Sampling** | Uniform **15-frame temporal sampling** across video files | Detects fleeting temporal artifacts, flickering, and frame-swap inconsistencies. |
| **EfficientNet-B0 Backbone** | High-efficiency compound scaling via `timm` | Lightweight inference footprint while maintaining state-of-the-art spatial sensitivity. |
| **Grad-CAM Explainability** | Layer target: `model.conv_head` (1280 feature channels) | Provides transparent visual proof showing *why* an asset was flagged as synthetic. |
| **Automated Device Routing** | Auto-selects `mps` (Apple Silicon), `cuda` (NVIDIA), or `cpu` | Seamless zero-config execution across MacBooks, workstations, and cloud servers. |
| **Forensic Report Export** | Self-contained, printable HTML/PDF evaluation certificate | Instant generation of verifiable forensic audit summaries with embedded assets. |

---

## 🧠 Explainable AI: Deciphering Grad-CAM Heatmaps

DeepGuard does not just output a probability number; it highlights the convolutional feature maps that triggered the neural decision:

<div align="center">

| Activation Zone | Visual Spectrum | Forensic Significance |
| :---: | :---: | :--- |
| **High Activation** | 🔴 **Crimson / Amber** | Pinpoints synthetic manipulation artifacts: warped iris contours, unnatural blending borders, smoothed facial pores, or mouth boundary seams. |
| **Neutral / Low** | 🔵 **Deep Blue / Cyan** | Indicates natural biological facial textures, skin pores, and consistent background patterns that did not trigger manipulation alarms. |

</div>

```
[ Input Face (224x224) ]                [ Grad-CAM Activation Map ]
       ┌───────────┐                            ┌───────────┐
       │   👁️   👁️   │       ════════════►      │   🔴   🔴   │  <-- Attention on eyes & seams
       │     👃    │       (conv_head)          │     🔵    │
       │     👄    │                            │     🟡    │  <-- Attention on mouth warping
       └───────────┘                            └───────────┘
```

---

## 🖥️ User Interface Walkthrough

The frontend is built using **React 18** and **Vite** with a responsive **Dark Cybersecurity Theme**:

1. **Header & Live Engine Badge:**
   - Displays real-time status of the FastAPI inference engine via `GET /health`.
   - Dynamic pulsing beacon confirms whether model weights and torch devices are active.
2. **Media Inspection Dropzone:**
   - Drag-and-drop file upload supporting images (`JPG, PNG, WEBP`) and videos (`MP4, MOV, AVI`).
   - Integrated scanner beam animation active during deep learning tensor processing.
   - Graceful 400 alert banners for images lacking clear human faces.
3. **Forensic Analysis & Explainability Card:**
   - **Verdict Tag:** 🟢 `Likely Real` (< 35%), 🟡 `Inconclusive` (35%-65%), 🔴 `Likely Fake` (> 65%).
   - **Probability Gauge:** Animated gradient bar displaying the precise fake score.
   - **Side-by-Side Verification:** High-res original cropped face paired alongside the Grad-CAM convolutional heatmap.
   - **Download Certificate:** Generates a standalone HTML forensic report for archival.
4. **Historical Audit Log:**
   - Persistent SQLite history table displaying recent scans, media types, frames evaluated, and timestamps.

---

## 📂 Repository Architecture

```
Deep-Guard/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Application package marker
│   │   ├── database.py           # SQLAlchemy SQLite engine & ScanRecord schema
│   │   ├── main.py               # FastAPI router, CORS, lifespan & endpoints
│   │   ├── model.py              # DeepfakeDetector, EfficientNet & Grad-CAM
│   │   └── preprocess.py         # OpenCV Haar Cascade face crop & video sampler
│   ├── weights/
│   │   └── .gitkeep              # Destination for optional custom .pth weights
│   └── requirements.txt          # Pinned backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # Navigation bar & live backend status pill
│   │   │   ├── UploadZone.jsx    # Drag-and-drop dropzone & media validation
│   │   │   ├── ResultCard.jsx    # Verdict badge, score gauge & XAI comparison
│   │   │   └── HistoryTable.jsx  # Audit history table connected to SQLite
│   │   ├── App.jsx               # Dashboard orchestrator & state manager
│   │   ├── config.js             # API base URL configuration
│   │   ├── index.css             # Cyberpunk/dark theme design system
│   │   └── main.jsx              # React 18 DOM mount point
│   ├── index.html                # HTML5 container with Plus Jakarta Sans fonts
│   ├── package.json              # Frontend scripts & dependencies
│   └── vite.config.js            # Vite build configuration
├── pyrefly.toml                  # Python LSP & virtual environment mappings
├── .gitignore                    # Git tracking ignore patterns
└── README.md                     # Documentation
```

---

## ⚡ Quick Start Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/jeyajothi08/Deep-Guard.git
cd Deep-Guard
```

### Step 2: Configure & Start Backend
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Launch FastAPI backend with Uvicorn
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
- 🌐 **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- 🩺 **Health Check Endpoint:** [http://localhost:8000/health](http://localhost:8000/health)

### Step 3: Configure & Start Frontend
In a separate terminal window:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
- 🚀 **Dashboard URL:** [http://localhost:5173](http://localhost:5173)

---

## 📡 API Documentation

| Method | Endpoint | Description | Request Payload | Response Sample |
| :---: | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Validates API & model state | None | `{"status": "ok", "model_loaded": true}` |
| `POST` | `/analyze/image` | Evaluates single face image | `multipart/form-data` (`file`) | `{"id": 1, "fake_probability": 78.4, "verdict": "Likely Fake", "heatmap_base64": "data:image/png;base64,..."}` |
| `POST` | `/analyze/video` | Evaluates multi-frame video | `multipart/form-data` (`file`) | `{"id": 2, "fake_probability": 84.1, "verdict": "Likely Fake", "frames_analyzed": 15}` |
| `GET` | `/history` | Fetches 20 recent scan logs | None | `[{"id": 1, "filename": "sample.jpg", "verdict": "Likely Real", "fake_probability": 12.3}]` |

---

## ⚙️ Scoring & Verdict Criteria

```
    0.0%                        35.0%                       65.0%                      100.0%
     ├────────────────────────────┼───────────────────────────┼───────────────────────────┤
     │       🟢 LIKELY REAL       │      🟡 INCONCLUSIVE      │       🔴 LIKELY FAKE      │
     │   Authentic skin textures  │   Ambiguous or low-res    │   Synthetic warping &     │
     │   & natural edge gradients │   facial boundary data    │   boundary manipulation   │
```

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!
1. Fork the Project (`git checkout -b feature/AmazingFeature`)
2. Commit your Changes (`git commit -m 'Add AmazingFeature'`)
3. Push to the Branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📜 License & Acknowledgments

- Licensed under the **MIT License**.
- Backbone architecture powered by [timm](https://github.com/huggingface/pytorch-image-models).
- Visual explainability powered by [pytorch-grad-cam](https://github.com/jacobgil/pytorch-grad-cam).
- Designed & Developed by [jeyajothi08](https://github.com/jeyajothi08).
