# ⚔️ CHAKRAVYUH-AI
### Border Defence & Surveillance Intelligence Dashboard

![Version](https://img.shields.io/badge/version-v1.0-ff2d55?style=for-the-badge&logo=github)
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
![PQC](https://img.shields.io/badge/Quantum-Kyber_512_+_Dilithium2-9B59B6?style=flat-square)

> A full-stack AI/ML surveillance intelligence system that simulates a multi-sensor border defence network using real cybersecurity datasets, trained machine learning models, and a Post-Quantum Cryptography signing layer.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement Fulfillment](#-problem-statement-fulfillment)
- [System Architecture](#-system-architecture)
- [AI/ML Models](#-aiml-models)
- [Navigation Modules](#-navigation-modules)
- [Quantum Security Layer](#-quantum-security-layer)
- [Tech Stack](#-tech-stack)
- [Datasets](#-datasets)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [API Reference](#-api-reference)
- [ML Pipeline Results](#-ml-pipeline-results)
- [System Notes & Limitations](#-system-notes--limitations)

---

## 🔭 Overview

**CHAKRAVYUH-AI v1.0** is a full-stack, dataset-driven border defence surveillance dashboard that integrates multiple AI/ML paradigms — supervised learning, unsupervised anomaly detection, and deep learning — into a unified real-time intelligence platform.

The system processes data from 5 real cybersecurity and IoT datasets, runs 3 AI/ML models simultaneously, and presents actionable threat intelligence through a military-grade React dashboard with 10 operational modules. All threat outputs, risk zones, sensor readings, and alert classifications are derived from real datasets. Most outputs are derived from real datasets, with fallback logic used when features are unavailable.

> *"Inspired by the ancient military formation — an inescapable, multi-layered defence system."*

---

## ✅ Problem Statement Fulfillment

| # | Objective | Implementation | Status |
|---|---|---|---|
| 1 | EDA on surveillance & sensor datasets | ML pipeline generates full EDA dashboard from 5 merged real datasets | ✅ |
| 2 | Build anomaly detection models | Isolation Forest — 975 anomalies detected, 12% contamination | ✅ |
| 3 | Classify using ML/DL techniques | Random Forest (80.2% acc) + YOLOv8 deep learning | ✅ |
| 4 | Predict high-risk zones | 27 risk zones predicted from historical incident data | ✅ |
| 5 | Alert prioritization to reduce false positives | Weighted CRITICAL/HIGH/MEDIUM/LOW with action log | ✅ |

| Challenge | Solution |
|---|---|
| Large-Scale Monitoring | 8,208 rows merged from 5 real datasets |
| Delayed Threat Detection | YOLOv8 CCTV detection + dataset-driven sensor feed |
| False Alarms | Isolation Forest anomaly filtering + FP suppression |
| Resource Constraints | Drone module simulating aerial coverage of remote zones |
| Data Integration | Auto-discovery ML pipeline with fuzzy schema mapping |

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
│                  ML PIPELINE  (run_pipeline.py)                  │
│   Auto-Discovery → Fuzzy Merge (8,208 rows) → EDA → Train       │
│         ↓                    ↓                     ↓            │
│   Isolation Forest     Random Forest           EDA Charts        │
│   (iso_model.pkl)     (rf_model.pkl)           (5 PNGs)         │
└────────────────────────┬────────────────────────────────────────┘
                         │  PKL files + CSV outputs
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FLASK BACKEND  (app.py)                         │
│                                                                  │
│  ┌──────────────┐ ┌───────────────┐ ┌───────────────────────┐   │
│  │   YOLOv8     │ │ Iso Forest    │ │   Random Forest       │   │
│  │  (webcam)    │ │ (anomaly)     │ │   (classification)    │   │
│  └──────────────┘ └───────────────┘ └───────────────────────┘   │
│                    ↓                                            │
│          Quantum Security Layer  (quantum_security.py)          │
│          Kyber-512 KEM · Dilithium2 Signatures · AES-256-GCM   │
│                                                                  │
│   REST API Endpoints → frontend + quantum dashboard             │
└────────────────────────┬────────────────────────────────────────┘
                         │  JSON
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               REACT FRONTEND  (App.jsx)                          │
│                                                                  │
│  OVERVIEW · LIVE DEMO · CCTV · DRONE · THREATS · ANALYTICS      │
│            SENSORS · OSINT · MAP · QUANTUM                      │
└─────────────────────────────────────────────────────────────────┘
```

### Detection Pipeline — 6 Stages Per Frame

| Stage | Name | Model / Method |
|---|---|---|
| 1 | Object Detection | YOLOv8n (COCO fallback) |
| 2 | Feature Extraction | 10-feature vector from detections |
| 3 | Anomaly Scoring | Isolation Forest (PKL) / formula fallback |
| 4 | Threat Classification | Random Forest (PKL) / rule-based fallback |
| 5 | Alert Priority | Weighted formula + FP suppression |
| 6 | Quantum Signing | Dilithium2 (liboqs) / HMAC-SHA3-256 fallback |

---

## 🤖 AI/ML Models

### 1. 🔍 YOLOv8 — Real-Time Object Detection

![YOLOv8n](https://img.shields.io/badge/YOLOv8n-COCO_Trained-FF6B35?style=flat-square)
![PyTorch](https://img.shields.io/badge/Framework-PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)

- **Type:** Deep Learning / Computer Vision
- **Use:** Real-time CCTV object detection — detects persons, vehicles, and objects with bounding boxes and confidence scores
- **Custom CentroidTracker:** Euclidean distance matching (80px threshold), 20-point path history, 8-frame disappearance logic for persistent object tracking
- **Fallback:** Claude Vision API when YOLOv8 unavailable

> **Note:** Live CCTV detection requires a physical webcam. In evaluation without hardware, the system continues via dataset-driven threat simulation.

### 2. 🚨 Isolation Forest — Anomaly Detection

![Unsupervised](https://img.shields.io/badge/Type-Unsupervised_ML-00e5ff?style=flat-square)
![Anomalies](https://img.shields.io/badge/Anomalies_Detected-975-ff2d55?style=flat-square)

- **Type:** Unsupervised Machine Learning
- **Use:** Detects abnormal sensor patterns without labelled data — catches novel threats no known category covers
- **Config:** `contamination=0.12 · n_estimators=200 · random_state=42`
- **Results:** 975 anomalies detected · 12% contamination rate
- **Trained on:** RT-IoT2022, NSL-KDD, UNSW-NB15

### 3. 🎯 Random Forest — Threat Classification

![Supervised](https://img.shields.io/badge/Type-Supervised_ML-00ff88?style=flat-square)
![Accuracy](https://img.shields.io/badge/Accuracy-80.2%25-ffaa00?style=flat-square)

- **Type:** Supervised Machine Learning
- **Use:** Classifies sensor events into CRITICAL / HIGH / MEDIUM / LOW threat levels with probability scores
- **Config:** `n_estimators=200 · max_depth=12 · 5-fold cross-validation`
- **Results:** 80.2% accuracy · 5-fold CV 73.9%
- **Why RF:** Interpretable classifications — unlike deep learning, every decision can be explained by feature contribution

---

## 🖥️ Navigation Modules

| Module | Description |
|---|---|
| `OVERVIEW` | Live KPIs (total/active/neutralized/falsePos), threat log, 24-hour timeline — all from real dataset rows |
| `LIVE DEMO` | 5-stage ML pipeline visualiser: Webcam → YOLO → Anomaly → Priority → Map Marker |
| `📷 CCTV` | YOLOv8 object detection with bounding boxes and CentroidTracker path trails *(webcam required)* |
| `🛸 DRONE` | Simulated aerial surveillance — GARUDA-1/2/3 UAVs, IR/VIS mode, 1×/2×/4×/8× zoom *(simulated)* |
| `THREATS` | Dataset-driven threat feed (4 per level), Cognitive Tactical SITREP, NEUTRALIZE/MONITOR/ESCALATE actions |
| `ANALYTICS` | 5 EDA charts from ML pipeline, classification results, anomaly detection visuals |
| `SENSORS` | 6 sensor cards (VISUAL · IR · SEISMIC · RF · SATELLITE · ACOUSTIC) — dataset-driven readings |
| `OSINT` | 27 ML-predicted high-risk border zones from `high_risk_zone_predictions.csv` |
| `🌍 MAP` | World map with India LoC/LAC overlays, threat markers, Markov-chain infiltration route predictor |
| `⚛ QUANTUM` | Live PQC dashboard — algorithm status, signature chain feed, key rotation timer, chain verification |

---

## 🔐 Quantum Security Layer

CHAKRAVYUH-AI v1.0 introduces a Post-Quantum Cryptography layer that cryptographically signs every ML pipeline output and chains the signatures together to create a tamper-evident audit trail.

### Why Post-Quantum?

Classical encryption (RSA, ECC) used in current defence systems is vulnerable to quantum computers running Shor's algorithm. NIST finalised post-quantum standards in 2024. CHAKRAVYUH-AI implements these standards to demonstrate quantum-resistant ML output integrity — a real and near-term concern for defence AI systems.

### Algorithms

| Algorithm | Standard | Role |
|---|---|---|
| CRYSTALS-Kyber-512 | NIST FIPS 203 | Key Encapsulation — protects AES session key |
| CRYSTALS-Dilithium2 | NIST FIPS 204 | Digital Signatures — signs every ML output |
| AES-256-GCM | NIST FIPS 197 | Bulk Encryption — encrypts threat payloads |
| SHA3-256 | NIST FIPS 202 | Pre-hash for signature construction |

### Signature Chain

Every ML output (threat level, anomaly score, alert priority) is:
1. Hashed with SHA3-256
2. Signed with Dilithium2
3. Linked to the previous output's hash

This creates a cryptographically linked chain. Modifying any output after signing — even by one byte — breaks the signature and invalidates all subsequent links. The QUANTUM module provides on-demand chain integrity verification.

### Key Rotation — Perfect Forward Secrecy

Kyber and Dilithium keys rotate automatically every 15 minutes via a background thread. Compromising a current session key cannot decrypt past sessions.

### Graceful Degradation

The `liboqs-python` native PQC library requires platform-specific compilation. When not installed, the system automatically falls back to **HMAC-SHA3-256 + AES-256-GCM**. The QUANTUM dashboard displays the active mode clearly:

```
PQC ACTIVE      →  liboqs installed · Kyber-512 + Dilithium2 running
FALLBACK MODE   →  liboqs unavailable · HMAC-SHA3-256 + AES-256-GCM active
```

This is **graceful degradation by design** — not an error state. All chain, rotation, tamper detection, and verification features operate identically in both modes.

```bash
# Install full PQC mode
pip install liboqs-python pycryptodome
```

---

## 🛠️ Tech Stack

**Frontend**

![React](https://img.shields.io/badge/React-SPA-61DAFB?style=flat-square&logo=react&logoColor=black)
![Canvas](https://img.shields.io/badge/HTML5_Canvas-Map_&_Drone-E34F26?style=flat-square&logo=html5&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Analytics-22B5BF?style=flat-square)

- React 18 — Single Page Application, 10 modules, 3,500+ lines
- HTML5 Canvas — world map with 4-pass glow rendering + DPR scaling, drone canvas with zoom
- Recharts — analytics charts, radar chart, area charts
- Orbitron + Share Tech Mono — military-grade dark UI

**Backend**

![Flask](https://img.shields.io/badge/Flask-REST_API-000000?style=flat-square&logo=flask&logoColor=white)
![Ultralytics](https://img.shields.io/badge/Ultralytics-YOLOv8-FF6B35?style=flat-square)
![scikit-learn](https://img.shields.io/badge/scikit--learn-RF_+_IsoForest-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)

- Python Flask — REST API, 8 endpoints
- Ultralytics YOLOv8 — real-time object detection
- scikit-learn — Random Forest + Isolation Forest inference
- `quantum_security.py` — PQC signing layer (Kyber + Dilithium + AES)

**ML Pipeline**

![AutoDiscovery](https://img.shields.io/badge/Pipeline-Auto_Discovery-8A2BE2?style=flat-square)
![Datasets](https://img.shields.io/badge/Datasets-5_Merged-00ff88?style=flat-square)

- Auto-discovery scanner — recursively finds and merges all CSV datasets
- Fuzzy column mapping — handles schema differences across datasets automatically
- Generates PKL model files + 5 EDA visualisation PNGs + risk zone CSV

---

## 📦 Datasets

| Dataset | Size | Domain | Use |
|---|---|---|---|
| NSL-KDD (Train + Test) | ~5.1 MB | Network Intrusion | RF threat classification |
| RT-IoT2022 | 52 MB | IoT Sensor Data | Anomaly detection |
| UNSW-NB15 Events | 5 KB | Network Events | Feature augmentation |
| train_test_network.csv | 29 MB | Network Traffic | Multi-class classification |
| cybersecurity_intrusion_data.csv | 709 KB | Intrusion Patterns | EDA + feature analysis |

> ⚠️ Datasets not included in repository due to size. Place all CSV files in `datasets/` folder before running the pipeline.
>
> Sources: [NSL-KDD](https://www.unb.ca/cic/datasets/nsl.html) · [UNSW-NB15](https://research.unsw.edu.au/projects/unsw-nb15-dataset) · [RT-IoT2022](https://archive.ics.uci.edu/dataset/942/rt-iot2022)

---

## 📁 Project Structure

```
chakravyuh_ai/
│
├── 📁 backend/
│   ├── app.py                          # Flask REST API — 6-stage ML pipeline
│   ├── quantum_security.py             # PQC layer (Kyber + Dilithium + AES)
│   ├── requirements.txt
│   └── chakravyuh_outputs/             # PKL models + CSV outputs (git-excluded)
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   └── App.jsx                     # React SPA — 10 modules (3,500+ lines)
│   ├── 📁 public/
│   │   └── 📁 maps/
│   │       └── ne_50m_admin_0_countries.json   # Natural Earth GeoJSON
│   ├── package.json
│   └── package-lock.json
│
├── 📁 ml_pipeline/
│   ├── run_pipeline.py                 # Auto-discovery ML training pipeline
│   ├── requirements.txt
│   └── chakravyuh_outputs/             # Generated charts, CSVs, PKLs
│
├── 📁 datasets/                        # Real CSV files (git-excluded)
│   ├── Train_data.csv
│   ├── Test_data.csv
│   ├── RT_IOT2022.csv
│   ├── train_test_network.csv
│   ├── cybersecurity_intrusion_data.csv
│   └── UNSW-NB15_LIST_EVENTS(in).csv
│
├── download_borders.py                 # Downloads Natural Earth GeoJSON
├── .gitignore
├── LICENSE
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
pip install flask flask-cors numpy pandas scikit-learn joblib ultralytics
pip install liboqs-python pycryptodome    # Optional — full PQC mode
pip install anthropic                     # Optional — Claude SITREP

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

### 3. ML Pipeline *(run once to generate models)*

```bash
cd ml_pipeline
pip install numpy pandas scikit-learn matplotlib seaborn joblib
python run_pipeline.py

# Copy outputs to backend (Windows)
copy chakravyuh_outputs\*.pkl ..\backend\chakravyuh_outputs\
copy chakravyuh_outputs\*.csv ..\backend\chakravyuh_outputs\
```

### 4. Map Data

```bash
python download_borders.py
# Places ne_50m_admin_0_countries.json → frontend/public/maps/
```

### 5. Optional — Claude API for AI Tactical Briefs

```powershell
# PowerShell only — never store API keys in files
$env:ANTHROPIC_API_KEY = "sk-ant-..."
```

> The system runs fully offline with local fallbacks for all AI features. No external API keys are required for core functionality.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System status — models, engines, quantum, uptime |
| `POST` | `/api/analyze-frame` | Full 6-stage ML + Quantum pipeline per frame |
| `POST` | `/api/tactical-brief` | AI-generated SITREP (Claude / local fallback) |
| `GET` | `/api/risk-zones` | 27 ML-predicted high-risk border zones |
| `GET` | `/api/sensor-data` | Balanced threat feed (4 per level, real CSV rows) |
| `GET` | `/api/quantum-status` | Live PQC metrics: algorithms, chain, key rotation |
| `POST` | `/api/quantum-verify` | On-demand full signature chain integrity verification |
| `GET` | `/api/quantum-signatures` | Last N signed ML payloads for live feed display |

---

## 📊 ML Pipeline Results

```
╔══════════════════════════════════════════════════════╗
║         CHAKRAVYUH-AI  ML Pipeline v5.0              ║
╠══════════════════════════════════════════════════════╣
║  Datasets discovered        :  5 files               ║
║  Total rows merged          :  8,208                 ║
╠══════════════════════════════════════════════════════╣
║  Random Forest Accuracy     :  80.2%                 ║
║  Cross-Validation (5-fold)  :  73.9%                 ║
╠══════════════════════════════════════════════════════╣
║  Isolation Forest           :  12% contamination     ║
║  Anomalies Detected         :  975                   ║
╠══════════════════════════════════════════════════════╣
║  Risk Zones Predicted       :  27                    ║
║  PKL Models Generated       :  2                     ║
║  EDA Charts Generated       :  5                     ║
╠══════════════════════════════════════════════════════╣
║  Quantum Signatures Issued  :  Live (grows per run)  ║
║  Chain Integrity            :  INTACT                ║
╚══════════════════════════════════════════════════════╝
```

---

## ⚠️ System Notes & Limitations

| Area | Status | Notes |
|---|---|---|
| CCTV live feed | Hardware required | YOLOv8 detection works with webcam; module inactive without one |
| Drone surveillance | Simulated | Canvas-based simulation — no real UAV hardware connected |
| Quantum PQC (full) | Optional | Requires `liboqs-python`; graceful HMAC fallback always active |
| Claude API | Optional | Local rule-based tactical brief fallback active without key |
| Satellite feeds | Not implemented | All sensor readings are dataset-derived, not live satellite data |
| Military deployment | Academic only | Research and internship demonstration project — not a production system |

This system is a **dataset-driven simulation** built for academic evaluation and research. It demonstrates the feasibility of integrating multiple AI/ML paradigms into a unified defence intelligence interface — not a deployable military product.

---

## 🔐 Security

- API keys are **never** stored in source files — set via environment variables only
- All datasets excluded from repository via `.gitignore`
- PKL model files excluded — regenerate using `run_pipeline.py`
- YOLOv8 weights excluded — auto-downloaded by Ultralytics on first run

---

**CHAKRAVYUH-AI v1.0** · Border Defence & Surveillance Intelligence Dashboard

![Built with](https://img.shields.io/badge/Built_with-React_+_Python_+_AI/ML-00e5ff?style=for-the-badge)

---

**GitHub:** [github.com/priyank5548/chakravyuh_ai](https://github.com/priyank5548/chakravyuh_ai)
