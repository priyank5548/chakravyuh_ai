<div align="center">

# ⚔️ CHAKRAVYUH-AI

### Border Defence & Surveillance Intelligence Dashboard

![Version](https://img.shields.io/badge/version-v4.1-ff2d55?style=for-the-badge&logo=github)
![Status](https://img.shields.io/badge/status-OPERATIONAL-00ff88?style=for-the-badge)
![License](https://img.shields.io/badge/license-Academic-00e5ff?style=for-the-badge)
![Domain](https://img.shields.io/badge/domain-Border_Defence-ffaa00?style=for-the-badge)

---

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-REST_API-000000?style=flat-square&logo=flask&logoColor=white)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Object_Detection-FF6B35?style=flat-square)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML_Models-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-Deep_Learning-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)

> A full-stack AI/ML surveillance system designed for academic and research purposes,  
> combining Computer Vision, Anomaly Detection, and Near Real-Time Threat Intelligence across 9 operational modules.

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement Fulfillment](#-problem-statement-fulfillment)
- [AI/ML Models](#-aiml-models)
- [Navigation Modules](#-navigation-modules)
- [Tech Stack](#-tech-stack)
- [Datasets](#-datasets)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [API Reference](#-api-reference)
- [ML Pipeline Results](#-ml-pipeline-results)

---

## 🔭 Overview

**CHAKRAVYUH-AI v4.1** is a full-stack border defence surveillance dashboard that integrates multiple AI/ML paradigms — supervised learning, unsupervised anomaly detection, and deep learning — into a unified real-time intelligence platform.

The system processes data from 5 real cybersecurity and IoT sensor datasets, runs 3 AI/ML models simultaneously, and presents actionable threat intelligence through a military-grade React dashboard with 9 operational modules — delivering near real-time intelligence using dataset-driven simulation.

> *"Inspired by the ancient military formation — an inescapable, multi-layered defence system."*

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                             │
│   NSL-KDD · RT-IoT2022 · UNSW-NB15 · Network CSV · Intrusion   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ML PIPELINE (run_pipeline.py)               │
│   Auto-Discovery → Merge (8208 rows) → EDA → Train Models       │
│         ↓                   ↓                    ↓              │
│   Isolation Forest    Random Forest          EDA Charts          │
│   (iso_model.pkl)    (rf_model.pkl)          (5 PNGs)           │
└────────────────────────┬────────────────────────────────────────┘
                         │  PKL files
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FLASK BACKEND (app.py)                        │
│                                                                  │
│   ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│   │   YOLOv8    │  │  Iso Forest  │  │   Random Forest     │   │
│   │  (webcam)   │  │  (anomaly)   │  │  (classification)   │   │
│   └─────────────┘  └──────────────┘  └─────────────────────┘   │
│                          REST API                               │
│    /sensor-data · /risk-zones · /analyze-frame · /tactical-brief│
└────────────────────────┬────────────────────────────────────────┘
                         │  JSON
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  REACT FRONTEND (App.jsx)                        │
│                                                                  │
│  OVERVIEW · LIVE DEMO · CCTV · DRONE · THREATS · ANALYTICS      │
│                  SENSORS · OSINT · MAP                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Problem Statement Fulfillment

| # | Objective | Implementation | Status |
|---|---|---|---|
| 1 | EDA on surveillance & sensor datasets | ML pipeline generates full EDA dashboard from 5 merged datasets | ✅ |
| 2 | Build anomaly detection models | Isolation Forest — 975 anomalies detected, 12% contamination | ✅ |
| 3 | Classify using ML/DL techniques | Random Forest (80.2% acc) + YOLOv8 deep learning | ✅ |
| 4 | Predict high-risk zones | 27 risk zones predicted from historical incident data | ✅ |
| 5 | Alert prioritization to reduce false positives | Balanced CRITICAL/HIGH/MEDIUM/LOW with action log | ✅ |

| Challenge | Solution |
|---|---|
| Large-Scale Monitoring | 8208 rows merged from 5 real datasets |
| Delayed Threat Detection | YOLOv8 CCTV object detection (webcam) + live dataset-driven sensor feed |
| False Alarms | Isolation Forest anomaly filtering |
| Resource Constraints | Drone module covering remote border zones |
| Data Integration | Auto-discovery ML pipeline merging all datasets |

---

## 🤖 AI/ML Models

### 1. 🔍 YOLOv8 — Real-Time Object Detection
![YOLOv8](https://img.shields.io/badge/YOLOv8n-COCO_Trained-FF6B35?style=flat-square)
![PyTorch](https://img.shields.io/badge/Framework-PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)

- **Type**: Deep Learning / Computer Vision
- **Use**: Supports real-time CCTV object detection (when webcam is enabled) — detects persons, vehicles, and objects
- **Framework**: Ultralytics (PyTorch backend)
- **Inference**: Per-frame detection pipeline with bounding boxes + confidence scores

### 2. 🚨 Isolation Forest — Anomaly Detection
![Unsupervised](https://img.shields.io/badge/Type-Unsupervised_ML-00e5ff?style=flat-square)
![Anomalies](https://img.shields.io/badge/Anomalies_Detected-975-ff2d55?style=flat-square)

- **Type**: Unsupervised Machine Learning
- **Use**: Detects abnormal patterns in network/sensor behaviour
- **Results**: 975 anomalies detected · 12% contamination rate
- **Trained on**: RT-IoT2022, NSL-KDD, UNSW-NB15

### 3. 🎯 Random Forest — Threat Classification
![Supervised](https://img.shields.io/badge/Type-Supervised_ML-00ff88?style=flat-square)
![Accuracy](https://img.shields.io/badge/Accuracy-80.2%25-ffaa00?style=flat-square)

- **Type**: Supervised Machine Learning
- **Use**: Classifies sensor events into CRITICAL / HIGH / MEDIUM / LOW threat levels
- **Results**: 80.2% accuracy · 5-fold CV 73.9%
- **Trained on**: 8208 rows merged from 5 real datasets

---

## 🖥️ Navigation Modules

| Module | Description |
|---|---|
| `OVERVIEW` | System status, real-time KPIs, live threat summary, timeline |
| `LIVE DEMO` | Full ML pipeline walkthrough with live model output visualization |
| `📷 CCTV` | YOLOv8-powered camera feed with real-time object detection & tracking |
| `🛸 DRONE` | Aerial surveillance view with scroll-wheel zoom (1×/2×/4×/8×) |
| `THREATS` | Live threat feed, Cognitive Tactical Brief (SITREP), Action Log — brief is AI-generated based on anomaly score + RF classification output, with local rule-based fallback |
| `ANALYTICS` | EDA charts, classification results, anomaly detection visuals |
| `SENSORS` | Real-time sensor data grid fed by dataset-driven REST API |
| `OSINT` | Open-source intelligence derived from risk zone predictions |
| `🌍 MAP` | Interactive world map with glowing border visualization |

---

## 🛠️ Tech Stack

**Frontend**

![React](https://img.shields.io/badge/React-SPA-61DAFB?style=flat-square&logo=react&logoColor=black)
![Canvas](https://img.shields.io/badge/HTML5_Canvas-Map_&_Drone-E34F26?style=flat-square&logo=html5&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Analytics-22B5BF?style=flat-square)

- React (Single Page Application, 9 modules)
- HTML5 Canvas — world map with DPR scaling, drone view with zoom
- Recharts — analytics and sensor data charts
- Custom CSS — military-grade dark UI with Orbitron font

**Backend**

![Flask](https://img.shields.io/badge/Flask-REST_API-000000?style=flat-square&logo=flask&logoColor=white)
![Ultralytics](https://img.shields.io/badge/Ultralytics-YOLOv8-FF6B35?style=flat-square)
![scikit-learn](https://img.shields.io/badge/scikit--learn-RF_+_IsoForest-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)

- Python Flask — REST API serving all modules
- Ultralytics YOLOv8 — real-time object detection
- scikit-learn — Random Forest + Isolation Forest
- Pandas / NumPy — data processing

**ML Pipeline**

![AutoDiscovery](https://img.shields.io/badge/Pipeline-Auto_Discovery-8A2BE2?style=flat-square)
![Datasets](https://img.shields.io/badge/Datasets-5_Merged-00ff88?style=flat-square)

- Auto-discovery scanner — recursively finds and merges all datasets
- Fuzzy column mapping — handles different dataset schemas automatically
- Generates PKL model files + 5 EDA visualization PNGs

---

## 📦 Datasets

| Dataset | Size | Domain | Use |
|---|---|---|---|
| NSL-KDD (Train + Test) | ~5.1 MB | Network Intrusion | RF threat classification |
| RT-IoT2022 | 52 MB | IoT Sensor Data | Anomaly detection |
| UNSW-NB15 Events | 5 KB | Network Events | Feature augmentation |
| train_test_network.csv | 29 MB | Network Traffic | Multi-class classification |
| cybersecurity_intrusion_data.csv | 709 KB | Intrusion Patterns | EDA + feature analysis |

> ⚠️ Datasets not included in repository due to size constraints.  
> Sources: [NSL-KDD](https://www.unb.ca/cic/datasets/nsl.html) · [UNSW-NB15](https://research.unsw.edu.au/projects/unsw-nb15-dataset) · [RT-IoT2022](https://archive.ics.uci.edu/dataset/942/rt-iot2022)

---

## 📁 Project Structure

```
CHAKRAVYUH_AI/
│
├── 📁 backend/
│   ├── app.py                          # Flask REST API (32 KB)
│   └── requirements.txt
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   └── App.jsx                     # Main React app — 9 modules (3312 lines)
│   ├── 📁 public/
│   │   └── 📁 maps/
│   │       └── ne_50m_admin_0_countries.json   # Natural Earth GeoJSON
│   ├── package.json
│   └── package-lock.json
│
├── 📁 ml_pipeline/
│   ├── run_pipeline.py                 # Auto-discovery ML pipeline (39 KB)
│   └── requirements.txt
│
├── download_borders.py                 # Natural Earth data utility
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
# API running at http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
# Dashboard running at http://localhost:3000
```

### 3. ML Pipeline *(optional — to regenerate models)*

```bash
cd ml_pipeline

# Place your datasets in a datasets/ folder
# Run the pipeline — auto-discovers all CSVs
python run_pipeline.py

# Copy generated PKL files to backend
cp chakravyuh_outputs/*.pkl ../backend/chakravyuh_outputs/
```

### 4. Map Data *(optional — higher resolution borders)*

```bash
# From the root directory
python download_borders.py
```

> **Note:** The system runs fully offline with local fallback for all AI features.  
> No external API keys are required for core functionality.

---

## 📡 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/health` | `GET` | System status — models, engines, uptime |
| `/api/sensor-data` | `GET` | Live threat feed — 4 threats per level |
| `/api/risk-zones` | `GET` | 27 predicted high-risk border zones |
| `/api/analytics` | `GET` | ML model statistics and dataset metrics |
| `/api/analyze-frame` | `POST` | YOLOv8 + Isolation Forest + RF pipeline |
| `/api/tactical-brief` | `POST` | AI-generated SITREP (local fallback active) |

---

## 📊 ML Pipeline Results

```
╔══════════════════════════════════════════════════╗
║         CHAKRAVYUH-AI  ML Pipeline v5.0          ║
╠══════════════════════════════════════════════════╣
║  Datasets discovered     :  5 files              ║
║  Total rows merged       :  8,208                ║
╠══════════════════════════════════════════════════╣
║  Random Forest Accuracy  :  80.2%                ║
║  Cross-Validation (5-fold):  73.9%               ║
╠══════════════════════════════════════════════════╣
║  Isolation Forest        :  12% contamination    ║
║  Anomalies Detected      :  975                  ║
╠══════════════════════════════════════════════════╣
║  Risk Zones Predicted    :  27                   ║
║  PKL Models Generated    :  2                    ║
╚══════════════════════════════════════════════════╝
```

---

## 🔐 Security

- API keys are **never** stored in source files — set via environment variables only
- All datasets excluded from repository via `.gitignore`
- PKL model files excluded — regenerate using `run_pipeline.py`
- YOLOv8 model weights excluded — auto-downloaded by Ultralytics on first run

---

<div align="center">

**CHAKRAVYUH-AI v4.1** · Border Defence & Surveillance

![Built with](https://img.shields.io/badge/Built_with-React_+_Python_+_AI/ML-00e5ff?style=for-the-badge)

</div>