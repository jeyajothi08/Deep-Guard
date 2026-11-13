# DeepGuard 🔍
### AI-Based Deepfake Image and Video Detection System with Explainable AI (Grad-CAM)

DeepGuard is a full-stack forensic deepfake detection platform that combines deep learning, convolutional attention heatmaps, and a modern cybersecurity-themed dashboard to detect and explain facial manipulations in both still images and videos.

---

## 🚀 Key Features

- **Automated Face Extraction & Preprocessing:**
  - Fast Haar Cascade facial detection with a 20% expanded bounding box margin.
  - Multi-frame video sampler extracting 15 evenly spaced frames across video duration.
  - Standardized 224x224 RGB normalization matching ImageNet distributions.

- **Deepfake Classification Engine:**
  - **EfficientNet-B0** backbone configured for binary classification (`Real` vs. `Fake`).
  - Automatic hardware acceleration (`mps` on Apple Silicon, `cuda` on NVIDIA GPUs, `cpu` fallback).
  - Graceful fallback: loads custom weights (`backend/weights/deepguard_effnet.pth`) if present, or defaults to pretrained weights for rapid deployment.
  - Categorical verdict grading:
    - **Likely Real** (`Fake Probability < 35%`)
    - **Inconclusive** (`35% <= Fake Probability <= 65%`)
    - **Likely Fake** (`Fake Probability > 65%`)

- **Explainable AI (XAI) via Grad-CAM:**
  - Generates visual attention heatmaps targeting the final convolutional layer (`model.conv_head`).
  - Highlights specific facial regions (eyelids, mouth seams, blending boundaries) that influenced the classification decision.
  - Encoded directly as Base64 PNG data URLs for instant frontend visualization.

- **FastAPI REST API:**
  - `GET /health`: Model status and system readiness check.
  - `POST /analyze/image`: Single image face detection, classification, and Grad-CAM generation.
  - `POST /analyze/video`: Multi-frame video sampling, aggregate fake scoring, and highest-activation Grad-CAM frame selection.
  - `GET /history`: Returns the 20 most recent scan evaluations.
  - Interactive API docs available at `/docs` (Swagger UI) and `/redoc`.

- **Modern React + Vite Frontend:**
  - Dark-mode, cyber-security aesthetic (Slate, Indigo, Emerald, Rose accents).
  - Drag-and-drop file upload zone with real-time media preview.
  - Side-by-side comparison of the cropped face and Grad-CAM heatmap.
  - One-click downloadable printable HTML forensic analysis report.
  - Live backend status monitoring and SQLite scan history table.

---

## 🛠️ Tech Stack

- **Backend:** Python 3.9+, FastAPI, PyTorch, `timm`, `pytorch-grad-cam`, OpenCV, NumPy, SQLAlchemy, SQLite, Uvicorn
- **Frontend:** React 18, Vite, Lucide Icons, Modern CSS3 Variables

---

## 📂 Project Structure

```
Deep Guard/
├── backend/
│   ├── app/
│   │   ├── __init__.py        # Backend package initialization
│   │   ├── database.py        # SQLAlchemy SQLite models & session handling
│   │   ├── main.py            # FastAPI REST endpoints & CORS configuration
│   │   ├── model.py           # EfficientNet-B0 detector & Grad-CAM pipeline
│   │   └── preprocess.py      # Face detection, cropping, and video sampling
│   ├── weights/               # Directory for custom fine-tuned weights (.pth)
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx       # Brand header & live backend status indicator
│   │   │   ├── UploadZone.jsx   # Drag-and-drop media upload & validation
│   │   │   ├── ResultCard.jsx   # Verdict, probability gauge & Grad-CAM visualizer
│   │   │   └── HistoryTable.jsx # Persistent scan evaluation history
│   │   ├── App.jsx              # Main dashboard view
│   │   ├── config.js            # API base URL configuration
│   │   ├── index.css            # Cyber-security dark theme styling
│   │   └── main.jsx             # React DOM root entry
│   ├── index.html             # HTML template
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite build configuration
├── pyrefly.toml               # Type checking & path resolution configuration
├── .gitignore                 # Git ignore rules
└── README.md                  # Project documentation
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.9+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/jeyajothi08/Deep-Guard.git
cd Deep-Guard

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📊 How Grad-CAM Heatmaps Work

- **Red & Yellow (Warm Regions):** High neural network activation. These indicate areas where the model identified synthetic manipulation artifacts, blending seams, warping, or frequency discrepancies.
- **Deep Blue (Cool Regions):** Low activation. These represent background skin or authentic textures that did not contribute to the fake score.

---

## 📄 License
This project is licensed under the MIT License.
