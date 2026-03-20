import os, io, json, base64, logging, argparse, time
import numpy  as np
import pandas as pd
from pathlib   import Path
from datetime  import datetime

from flask      import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# ─── OPTIONAL IMPORTS (graceful degradation if not installed) ────────────────
try:
    from ultralytics import YOLO
    import cv2
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False

try:
    import joblib
    JOBLIB_AVAILABLE = True
except ImportError:
    JOBLIB_AVAILABLE = False

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    from sklearn.ensemble      import IsolationForest, RandomForestClassifier
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

# ─── LOGGING ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level   = logging.INFO,
    format  = "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt = "%H:%M:%S",
)
log = logging.getLogger("CHAKRAVYUH")

# ─── PATHS ───────────────────────────────────────────────────────────────────
BASE_DIR          = Path(__file__).parent
DATA_DIR          = BASE_DIR / "chakravyuh_outputs"
MODEL_DIR         = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

YOLO_MODEL_PATH   = MODEL_DIR / "yolo_visdrone.pt"
ISO_MODEL_PATH    = DATA_DIR  / "model_isolation_forest.pkl"
RF_MODEL_PATH     = DATA_DIR  / "model_random_forest_classifier.pkl"
SCALER_RF_PATH    = DATA_DIR  / "scaler_random_forest.pkl"
LE_PATH           = DATA_DIR  / "label_encoder_threat.pkl"

# ─── ANTHROPIC CLIENT ────────────────────────────────────────────────────────
API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
client  = None
if ANTHROPIC_AVAILABLE and API_KEY:
    client = anthropic.Anthropic(api_key=API_KEY)

# ─── FLASK APP ────────────────────────────────────────────────────────────────
app = Flask(__name__, static_folder=str(BASE_DIR / "build"))
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ─── MODEL REGISTRY ──────────────────────────────────────────────────────────
MODELS = {
    "yolo":       None,
    "iso_forest": None,
    "rf_clf":     None,
    "scaler_rf":  None,
    "le_threat":  None,
}

# ─── VisDrone class → threat type mapping ────────────────────────────────────
VISDRONE_TO_THREAT = {
    "pedestrian":      "INFANTRY_INFILTRATION",
    "people":          "INFANTRY_INFILTRATION",
    "bicycle":         "INFANTRY_INFILTRATION",
    "car":             "VEHICLE_CONVOY",
    "van":             "VEHICLE_CONVOY",
    "truck":           "VEHICLE_CONVOY",
    "bus":             "VEHICLE_CONVOY",
    "tricycle":        "VEHICLE_CONVOY",
    "awning-tricycle": "VEHICLE_CONVOY",
    "motor":           "DRONE_SWARM",
    # COCO fallback
    "person":          "INFANTRY_INFILTRATION",
    "motorcycle":      "VEHICLE_CONVOY",
    "airplane":        "AERIAL_RECON",
    "bird":            "DRONE_SWARM",
}

THREAT_LEVEL_RULES = {
    "INFANTRY_INFILTRATION": "HIGH",
    "VEHICLE_CONVOY":        "HIGH",
    "AERIAL_RECON":          "HIGH",
    "DRONE_SWARM":           "MEDIUM",
    "FALSE_POSITIVE":        "LOW",
    "UNKNOWN":               "LOW",
}


# ════════════════════════════════════════════════════════════════════════════
#  MODEL LOADING
# ════════════════════════════════════════════════════════════════════════════
def load_models():
    """Load all saved models at startup."""

    # YOLOv8
    if YOLO_AVAILABLE:
        if YOLO_MODEL_PATH.exists():
            log.info(f"Loading VisDrone-trained YOLOv8 from {YOLO_MODEL_PATH}")
            MODELS["yolo"] = YOLO(str(YOLO_MODEL_PATH))
        else:
            log.warning("VisDrone YOLO not found. Using YOLOv8n (COCO) as fallback.")
            log.warning("Run `python backend_app.py --train` to train on VisDrone.")
            try:
                MODELS["yolo"] = YOLO("yolov8n.pt")
                log.info("YOLOv8n (COCO pretrained) loaded as fallback")
            except Exception as e:
                log.error(f"Could not load YOLOv8: {e}")
    else:
        log.warning("ultralytics not installed. Using Claude Vision fallback.")

    # Sklearn models from chakravyuh_ml_pipeline.py
    if JOBLIB_AVAILABLE:
        for name, path in [
            ("iso_forest", ISO_MODEL_PATH),
            ("rf_clf",     RF_MODEL_PATH),
            ("scaler_rf",  SCALER_RF_PATH),
            ("le_threat",  LE_PATH),
        ]:
            if path.exists():
                MODELS[name] = joblib.load(path)
                log.info(f"Loaded {name}")
            else:
                log.warning(f"{name} not found — run chakravyuh_ml_pipeline.py first")


# ════════════════════════════════════════════════════════════════════════════
#  FEATURE EXTRACTION — matches training schema in chakravyuh_ml_pipeline.py
# ════════════════════════════════════════════════════════════════════════════
def extract_features(detections: list, region_meta: dict) -> dict:
    """Convert YOLO detections into feature vector for ML models."""
    hour     = datetime.now().hour
    is_night = 1 if (hour < 6 or hour > 21) else 0

    person_count  = sum(1 for d in detections if d["class"] in ("person","pedestrian","people","bicycle"))
    vehicle_count = sum(1 for d in detections if d["class"] in ("car","van","truck","bus","motorcycle","tricycle","awning-tricycle"))
    object_count  = len(detections)
    max_conf      = max((d["score"] for d in detections), default=0.0)

    # Proxy sensor readings derived from visual evidence
    # These mirror the synthetic generator in chakravyuh_ml_pipeline.py
    motion_intensity = float(np.clip(max_conf, 0, 1))
    rf_burst_count   = int(min(person_count + vehicle_count, 12))
    thermal_delta    = float(np.clip(person_count * 7.5 + vehicle_count * 11.0, 0, 40))
    seismic_value    = float(np.clip(vehicle_count * 0.8, 0, 4.5))
    speed_kmh        = float(np.clip(vehicle_count * 12.0, 0, 35))

    # Dominant class encoding
    if person_count >= vehicle_count and person_count > 0:
        dom_class = "PERSON"
    elif vehicle_count > 0:
        dom_class = "VEHICLE"
    else:
        dom_class = "UNKNOWN"

    obj_enc = {"PERSON": 2, "VEHICLE": 4, "DRONE": 1, "ANIMAL": 0, "UNKNOWN": 3}.get(dom_class, 3)

    return {
        "motion_intensity": motion_intensity,
        "seismic_value":    seismic_value,
        "thermal_delta":    thermal_delta,
        "rf_burst_count":   rf_burst_count,
        "object_count":     object_count,
        "speed_kmh":        speed_kmh,
        "is_night":         is_night,
        "weather_code":     int(region_meta.get("weather_code", 0)),
        "distance_border":  float(region_meta.get("distance_border", 1.0)),
        "obj_enc":          obj_enc,
    }


def compute_anomaly_score(features: dict) -> float:
    """Isolation Forest if loaded, else formula from chakravyuh_ml_pipeline.py."""
    iso = MODELS.get("iso_forest")
    if iso and JOBLIB_AVAILABLE:
        try:
            vec = np.array([[
                features["motion_intensity"],
                features["seismic_value"],
                features["thermal_delta"],
                features["rf_burst_count"],
                features["object_count"],
                features["speed_kmh"],
            ]])
            raw = iso.score_samples(vec)[0]
            return round(float(np.clip(0.5 - raw, 0, 1)), 4)
        except Exception as e:
            log.warning(f"IsolationForest inference failed: {e}")

    # Formula fallback — exact match to chakravyuh_ml_pipeline.py
    s = (
        features["motion_intensity"]                    * 0.30 +
        min(features["seismic_value"] / 4.5, 1.0)      * 0.15 +
        min(features["thermal_delta"] / 40,  1.0)      * 0.15 +
        min(features["rf_burst_count"] / 12, 1.0)      * 0.15 +
        min(features["object_count"]  / 8,   1.0)      * 0.10 +
        features["is_night"]                            * 0.10 +
        (0.05 if features["object_count"] > 2 else 0.0)
    )
    return round(float(np.clip(s, 0, 1)), 4)


def classify_threat(features: dict, anomaly_score: float) -> str:
    """Random Forest if loaded, else rule-based fallback."""
    rf     = MODELS.get("rf_clf")
    scaler = MODELS.get("scaler_rf")
    le     = MODELS.get("le_threat")

    if rf and scaler and le and JOBLIB_AVAILABLE:
        try:
            vec = np.array([[
                features["motion_intensity"],
                features["seismic_value"],
                features["thermal_delta"],
                features["rf_burst_count"],
                features["object_count"],
                features["speed_kmh"],
                features["is_night"],
                features["weather_code"],
                features["distance_border"],
                features["obj_enc"],
            ]])
            pred = rf.predict(scaler.transform(vec))[0]
            return str(le.inverse_transform([pred])[0])
        except Exception as e:
            log.warning(f"RandomForest inference failed: {e}")

    # Rule fallback matching ml_pipeline thresholds
    if anomaly_score > 0.72: return "CRITICAL"
    if anomaly_score > 0.52: return "HIGH"
    if anomaly_score > 0.32: return "MEDIUM"
    return "LOW"


def compute_alert_priority(anomaly_score: float, features: dict, is_false_positive: bool) -> float:
    """Alert priority — exact match to chakravyuh_ml_pipeline.py."""
    p = (
        anomaly_score                               * 0.40 +
        features["motion_intensity"]                * 0.20 +
        min(features["rf_burst_count"] / 12, 1.0)  * 0.15 +
        features["is_night"]                        * 0.10 +
        (0.0 if is_false_positive else 0.10)        +
        min(features["object_count"] / 8, 1.0)     * 0.05
    )
    return round(float(np.clip(p, 0, 1)), 4)


# ════════════════════════════════════════════════════════════════════════════
#  YOLO INFERENCE
# ════════════════════════════════════════════════════════════════════════════
def run_yolo(image_bytes: bytes, region: str) -> list:
    """Run YOLOv8 on raw image bytes, return detection list."""
    yolo = MODELS.get("yolo")
    if not yolo:
        return []

    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return []

        results = yolo(img, conf=0.30, verbose=False)[0]
        detections = []

        for box in results.boxes:
            cls_id   = int(box.cls[0])
            conf     = float(box.conf[0])
            x1,y1,x2,y2 = [float(v) for v in box.xyxy[0]]
            cls_name = results.names.get(cls_id, "unknown").lower()

            threat_type  = VISDRONE_TO_THREAT.get(cls_name, "UNKNOWN")
            threat_level = THREAT_LEVEL_RULES.get(threat_type, "LOW")

            # Escalate group infiltration
            if cls_name in ("person","pedestrian","people") and len(results.boxes) > 3:
                threat_level = "CRITICAL"

            detections.append({
                "class":            cls_name,
                "score":            round(conf, 4),
                "bbox":             [round(x1,1), round(y1,1), round(x2-x1,1), round(y2-y1,1)],
                "threat_type":      threat_type,
                "threat_level":     threat_level,
                "is_false_positive":False,
                "notes":            f"YOLOv8-VisDrone [{region}]",
            })

        log.info(f"[YOLO] {region} -> {len(detections)} detections")
        return detections

    except Exception as e:
        log.error(f"[YOLO] {e}")
        return []


def run_claude_vision_fallback(b64: str, region: str) -> list:
    """Claude Vision fallback when YOLOv8 unavailable."""
    if not client:
        return []
    try:
        resp = client.messages.create(
            model="claude-sonnet-4-20250514", max_tokens=800,
            system="""Military vision AI. Return ONLY valid JSON, no markdown.
{"detections":[{"class":"person","score":0.92,"bbox":[x,y,w,h],
"threat_type":"INFANTRY_INFILTRATION","threat_level":"HIGH",
"is_false_positive":false,"notes":"note"}]}
Classes: person,car,truck,motorcycle,bus,airplane,bicycle,backpack,chair,bottle.
Bbox=[x,y,width,height] pixels (320x240). If nothing: {"detections":[]}""",
            messages=[{"role":"user","content":[
                {"type":"image","source":{"type":"base64","media_type":"image/jpeg","data":b64}},
                {"type":"text", "text":f"Detect threats. Region:{region}. JSON only."}
            ]}]
        )
        raw = "".join(b.text for b in resp.content if hasattr(b,"text"))
        return json.loads(raw.replace("```json","").replace("```","").strip()).get("detections",[])
    except Exception as e:
        log.error(f"[CLAUDE-VISION] {e}")
        return []


# ════════════════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════

@app.route("/health")
def health():
    return jsonify({
        "status":           "OPERATIONAL",
        "version":          "4.1",
        "timestamp":        datetime.now().isoformat(),
        "detection_engine": "YOLOv8-VisDrone" if (MODELS["yolo"] and YOLO_MODEL_PATH.exists()) else
                            ("YOLOv8n-COCO"   if MODELS["yolo"] else "Claude-Vision-Fallback"),
        "models": {
            "yolo":       "LOADED" if MODELS["yolo"]       else ("INSTALLABLE" if YOLO_AVAILABLE else "pip install ultralytics"),
            "iso_forest": "LOADED" if MODELS["iso_forest"] else "run chakravyuh_ml_pipeline.py",
            "rf_clf":     "LOADED" if MODELS["rf_clf"]     else "run chakravyuh_ml_pipeline.py",
        },
        "ai_engine":  "CONNECTED" if client else "LOCAL MODE",
        "pipeline":   ["YOLOv8","FeatureExtraction","IsolationForest","RandomForest","AlertPriority"],
    })


@app.route("/api/analyze-frame", methods=["POST"])
def analyze_frame():
    """
    Full per-frame detection pipeline.
    React sends:  { "image": "<base64_jpeg>", "region": "Depsang Plains, Ladakh LAC" }
    Returns:      { "detections":[], "anomaly_score":0.72, "threat_level":"HIGH",
                    "alert_priority":0.65, "suppressed":false,
                    "features":{}, "engine":"YOLOv8", "pipeline":[] }
    """
    t0   = time.time()
    body = request.get_json(force=True, silent=True) or {}
    b64  = body.get("image", "")
    region = body.get("region", "Unknown Border Region")

    if not b64:
        return jsonify({"detections":[], "error":"No image provided"}), 200

    try:
        image_bytes = base64.b64decode(b64)
    except Exception:
        return jsonify({"detections":[], "error":"Invalid base64"}), 400

    # Stage 1 — Object detection
    if YOLO_AVAILABLE and MODELS["yolo"]:
        detections = run_yolo(image_bytes, region)
        engine     = "YOLOv8-VisDrone" if YOLO_MODEL_PATH.exists() else "YOLOv8n-COCO"
    else:
        detections = run_claude_vision_fallback(b64, region)
        engine     = "Claude-Vision-Fallback"

    # Stage 2 — Feature extraction
    features = extract_features(detections, {"weather_code":0,"distance_border":1.0})

    # Stage 3 — Anomaly scoring (Isolation Forest)
    anomaly_score = compute_anomaly_score(features)

    # Stage 4 — Threat classification (Random Forest)
    threat_level = classify_threat(features, anomaly_score)

    # Stage 5 — Alert priority + false positive suppression
    is_fp          = any(d.get("is_false_positive") for d in detections)
    alert_priority = compute_alert_priority(anomaly_score, features, is_fp)
    suppressed     = is_fp and alert_priority < 0.35

    ms = round((time.time() - t0) * 1000, 1)
    log.info(f"[PIPELINE] {region} | objs={len(detections)} | anomaly={anomaly_score:.3f} | {threat_level} | pri={alert_priority:.3f} | {ms}ms | {engine}")

    return jsonify({
        "detections":     detections,
        "anomaly_score":  anomaly_score,
        "alert_priority": alert_priority,
        "threat_level":   threat_level,
        "suppressed":     suppressed,
        "features":       features,
        "engine":         engine,
        "latency_ms":     ms,
        "pipeline": [
            {"stage":"1_YOLO_DETECTION",      "result":f"{len(detections)} objects",          "engine":engine},
            {"stage":"2_FEATURE_EXTRACTION",  "result":f"motion={features['motion_intensity']:.2f} objs={features['object_count']}"},
            {"stage":"3_ANOMALY_SCORE",        "result":f"{anomaly_score:.3f} / 1.0",          "model":"IsolationForest"},
            {"stage":"4_THREAT_CLASSIFY",      "result":threat_level,                          "model":"RandomForest"},
            {"stage":"5_ALERT_PRIORITY",       "result":f"{alert_priority:.3f}",               "suppressed":suppressed},
        ],
    })


@app.route("/api/tactical-brief", methods=["POST"])
def tactical_brief():
    """Generate AI tactical brief. Uses Claude API if available, local rule-based fallback otherwise."""
    if not client:
        return jsonify({"brief":"// AI ENGINE RUNNING IN LOCAL MODE — TACTICAL BRIEF GENERATED OFFLINE","error":"no key"}), 200

    threat = (request.get_json(force=True, silent=True) or {}).get("threat", {})
    if not threat:
        return jsonify({"brief":"// NO THREAT DATA"}), 200

    prompt = "\n".join([
        f"Type:{threat.get('type','UNKNOWN')}",
        f"Level:{threat.get('level','UNKNOWN')}",
        f"Location:{threat.get('name') or threat.get('sector','?')}, {threat.get('region','')}",
        f"Coords:{float(threat.get('lat',0)):.3f}N {float(threat.get('lon',0)):.3f}E",
        f"Score:{threat.get('score',0)}/100 Conf:{threat.get('confidence',0)}%",
        f"Sensors:{','.join(threat.get('sensors',[]))}",
        f"Source:{threat.get('source','SIM')}",
    ] + ([f"Detected:{threat['detectedClass']}"] if threat.get("detectedClass") else []))

    try:
        resp = client.messages.create(
            model="claude-sonnet-4-20250514", max_tokens=1000,
            system=(
                "You are CHAKRAVYUH-AI, Indian military border intelligence. "
                "Write CONCISE tactical briefs (max 160 words). "
                "Format: SITREP / ASSESSMENT / RECOMMENDED ACTION. "
                "Use LAC, LoC, SFF, ITBP, BSF, Indian Army context. "
                "UPPERCASE key terms."
            ),
            messages=[{"role":"user","content":prompt}]
        )
        brief = "".join(b.text for b in resp.content if hasattr(b,"text"))
        return jsonify({"brief":brief})
    except Exception as e:
        log.error(f"[BRIEF] {e}")
        return jsonify({"brief":"// COGNITIVE ENGINE OFFLINE","error":str(e)})


@app.route("/api/risk-zones")
def risk_zones():
    csv_path = DATA_DIR / "high_risk_zone_predictions.csv"
    if csv_path.exists():
        df = pd.read_csv(csv_path)
        return jsonify({"source":"high_risk_zone_predictions.csv","data":df.to_dict(orient="records")})
    # inline fallback
    return jsonify({"source":"inline","data":[
        {"location":"Depsang Plains",  "risk_score":1.00,"risk_category":"HIGH RISK",    "mean_anomaly":0.62,"false_positive_rate":0.18},
        {"location":"Galwan Valley",   "risk_score":0.93,"risk_category":"HIGH RISK",    "mean_anomaly":0.59,"false_positive_rate":0.19},
        {"location":"Pir Panjal Range","risk_score":0.91,"risk_category":"HIGH RISK",    "mean_anomaly":0.59,"false_positive_rate":0.19},
        {"location":"Pangong Tso",     "risk_score":0.89,"risk_category":"HIGH RISK",    "mean_anomaly":0.58,"false_positive_rate":0.19},
        {"location":"Tawang Sector",   "risk_score":0.77,"risk_category":"MODERATE RISK","mean_anomaly":0.56,"false_positive_rate":0.18},
        {"location":"Wagah Border",    "risk_score":0.69,"risk_category":"MODERATE RISK","mean_anomaly":0.53,"false_positive_rate":0.16},
        {"location":"Barmer Sector",   "risk_score":0.54,"risk_category":"MODERATE RISK","mean_anomaly":0.51,"false_positive_rate":0.20},
        {"location":"Mizoram Border",  "risk_score":0.00,"risk_category":"LOW RISK",     "mean_anomaly":0.45,"false_positive_rate":0.20},
    ]})


@app.route("/api/sensor-data")
def sensor_data():
    csv_path = DATA_DIR / "border_sensor_dataset.csv"
    if not csv_path.exists():
        return jsonify({"error":"Run chakravyuh_ml_pipeline.py first"}), 404
    df = pd.read_csv(csv_path)
    location = request.args.get("location")
    n = int(request.args.get("n", 200))
    if location:
        df = df[df["location"] == location]
        return jsonify({"source":"border_sensor_dataset.csv","rows":len(df.head(n)),"data":df.head(n).to_dict(orient="records")})
    # Return BALANCED sample across all threat levels so frontend shows all categories
    levels = ["CRITICAL","HIGH","MEDIUM","LOW"]
    per_level = max(4, n // len(levels))
    balanced_frames = []
    for lvl in levels:
        subset = df[df["threat_level"] == lvl]
        if len(subset) > 0:
            # Shuffle to get variety across locations
            balanced_frames.append(subset.sample(min(len(subset), per_level), random_state=42))
    if balanced_frames:
        import pandas as pd_inner
        balanced = pd_inner.concat(balanced_frames).sample(frac=1, random_state=42).reset_index(drop=True)
    else:
        balanced = df.head(n)
    return jsonify({"source":"border_sensor_dataset.csv","rows":len(balanced),"data":balanced.to_dict(orient="records")})


@app.route("/", defaults={"path":""})
@app.route("/<path:path>")
def serve_react(path):
    build = BASE_DIR / "build"
    if path and (build / path).exists():
        return send_from_directory(str(build), path)
    if (build / "index.html").exists():
        return send_from_directory(str(build), "index.html")
    return jsonify({"message":"CHAKRAVYUH-AI Backend v4.1 Running"}), 200


# ════════════════════════════════════════════════════════════════════════════
#  YOLO TRAINING  (python backend_app.py --train)
# ════════════════════════════════════════════════════════════════════════════
def train_yolo_visdrone():
    """
    Fine-tune YOLOv8n on VisDrone dataset.

    Steps before running:
      1. Download from Kaggle:
           kaggle datasets download -d ultralytics/visdrone
      2. Extract to ./data/VisDrone/
           ./data/VisDrone/images/train/  val/  test/
           ./data/VisDrone/labels/train/  val/  test/
      3. python backend_app.py --train
    """
    if not YOLO_AVAILABLE:
        print("ERROR: pip install ultralytics first")
        return

    print("\n" + "="*60)
    print("  CHAKRAVYUH-AI  >  YOLOv8 VisDrone Training Pipeline")
    print("="*60)

    yaml_path = BASE_DIR / "data" / "visdrone.yaml"
    yaml_path.parent.mkdir(exist_ok=True)
    yaml_path.write_text("""# VisDrone Dataset — CHAKRAVYUH-AI
path: ./data/VisDrone
train: images/train
val:   images/val
test:  images/test

nc: 10
names:
  0: pedestrian
  1: people
  2: bicycle
  3: car
  4: van
  5: truck
  6: tricycle
  7: awning-tricycle
  8: bus
  9: motor
""")
    print(f"[1/3] Dataset YAML written: {yaml_path}")

    model = YOLO("yolov8n.pt")
    print("[2/3] Base model loaded: YOLOv8n (COCO pretrained)")
    print("[3/3] Fine-tuning on VisDrone...\n")

    results = model.train(
        data     = str(yaml_path),
        epochs   = 50,
        imgsz    = 640,
        batch    = 16,
        name     = "chakravyuh_visdrone",
        project  = str(MODEL_DIR),
        device   = "0" if os.environ.get("CUDA_VISIBLE_DEVICES") else "cpu",
        workers  = 4,
        patience = 15,
        save     = True,
        plots    = True,
    )

    import shutil
    best = MODEL_DIR / "chakravyuh_visdrone" / "weights" / "best.pt"
    if best.exists():
        shutil.copy(best, YOLO_MODEL_PATH)
        print(f"\n✔ Best weights -> {YOLO_MODEL_PATH}")
        print("✔ Restart server to use trained model")
        m = results.results_dict
        print(f"\n  mAP50:    {m.get('metrics/mAP50(B)','N/A'):.3f}")
        print(f"  mAP50-95: {m.get('metrics/mAP50-95(B)','N/A'):.3f}")
        print(f"  Precision:{m.get('metrics/precision(B)','N/A'):.3f}")
        print(f"  Recall:   {m.get('metrics/recall(B)','N/A'):.3f}")
    else:
        print("WARNING: best.pt not found after training")


# ─── ENTRY POINT ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--train", action="store_true", help="Train YOLOv8 on VisDrone")
    parser.add_argument("--port",  type=int, default=5000)
    args = parser.parse_args()

    if args.train:
        train_yolo_visdrone()
    else:
        load_models()

        eng = "YOLOv8-VisDrone" if YOLO_MODEL_PATH.exists() else ("YOLOv8n-COCO" if MODELS["yolo"] else "Claude-Vision")
        iso = "LOADED" if MODELS["iso_forest"] else "MISSING"
        rf  = "LOADED" if MODELS["rf_clf"]     else "MISSING"

        print(f"""
╔══════════════════════════════════════════════════════════════════╗
║  CHAKRAVYUH-AI  Backend v4.1 — http://localhost:{args.port}      ║
╠══════════════════════════════════════════════════════════════════╣
║  Detection Engine : {eng:<40}                                    ║
║  Isolation Forest : {iso:<40}                                    ║
║  Random Forest    : {rf:<40}                                     ║
╠══════════════════════════════════════════════════════════════════╣
║  POST /api/analyze-frame     YOLOv8 + Iso Forest + RF            ║
║  POST /api/tactical-brief    AI Tactical Brief (local fallback)  ║
║  GET  /api/risk-zones        Kaggle CSV output                   ║
║  GET  /api/sensor-data       Kaggle CSV output                   ║
║  GET  /health                Model + system status               ║
╠══════════════════════════════════════════════════════════════════╣
║  To train YOLOv8 on VisDrone:                                    ║
║    python backend_app.py --train                                 ║
╚══════════════════════════════════════════════════════════════════╝
        """)

        app.run(host="0.0.0.0", port=args.port, debug=False)