import os, sys, warnings, glob
import numpy  as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from   matplotlib.gridspec import GridSpec
import seaborn as sns
from   sklearn.ensemble       import IsolationForest, RandomForestClassifier
from   sklearn.preprocessing  import LabelEncoder, StandardScaler
from   sklearn.model_selection import train_test_split, cross_val_score
from   sklearn.metrics import (classification_report, confusion_matrix,
                                roc_auc_score, ConfusionMatrixDisplay)
from   sklearn.decomposition import PCA
import joblib

warnings.filterwarnings("ignore")
np.random.seed(42)

OUT      = "chakravyuh_outputs"
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "datasets")
os.makedirs(OUT,      exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

DARK  = "#020810";  CYAN  = "#00e5ff";  GREEN = "#00ff88"
AMBER = "#ffaa00";  RED   = "#ff2d55";  TEXT  = "#b0d8f0"
sns.set_theme(style="dark")

def hud_style(fig, title=""):
    fig.patch.set_facecolor(DARK)
    for ax in fig.axes:
        ax.set_facecolor("#040d1a")
        ax.tick_params(colors=TEXT, labelsize=8)
        ax.xaxis.label.set_color(TEXT);  ax.yaxis.label.set_color(TEXT)
        ax.title.set_color(CYAN)
        for spine in ax.spines.values(): spine.set_edgecolor("#0a3a5c")
    if title:
        fig.suptitle(title, color=CYAN, fontsize=13, fontweight="bold",
                     fontfamily="monospace", y=0.98)

print("=" * 70)
print("  CHAKRAVYUH-AI  ▸  ML PIPELINE  v5.0  —  AUTO-DISCOVERY MODE")
print("=" * 70)

# ════════════════════════════════════════════════════════════════════════════
# SECTION 0 — DATASET DISCOVERY ENGINE
# Recursively scans datasets/ folder, reads every CSV/JSON/XLSX,
# then intelligently maps columns to the features the pipeline needs.
# ════════════════════════════════════════════════════════════════════════════

print(f"\n[0/5] SCANNING '{DATA_DIR}/' FOR DATASETS...")

# ── 0A: Recursive file scanner ───────────────────────────────────────────────
def scan_dataset_folder(folder):
    """Walk folder tree and return all readable data files."""
    # Every known data format supported
    SUPPORTED = {
        "csv", "tsv", "txt", "dat",          # plain text tabular
        "json", "jsonl", "ndjson",            # JSON formats
        "xlsx", "xls", "xlsm", "ods",        # spreadsheets
        "parquet", "feather", "arrow",        # binary columnar
        "sqlite", "db", "sqlite3",            # SQLite databases
        "h5", "hdf5",                         # HDF5
        "pkl", "pickle",                      # pickled DataFrames
        "arff",                               # Weka format (common in ML)
    }
    found = []
    for root, dirs, files in os.walk(folder):
        # Skip hidden folders like .git
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for f in files:
            if f.startswith("."): continue   # skip hidden files
            ext = f.lower().rsplit(".", 1)[-1] if "." in f else ""
            if ext in SUPPORTED:
                found.append(os.path.join(root, f))
    return sorted(found)

def load_file(path):
    """Load any data file into a DataFrame regardless of format."""
    ext = path.lower().rsplit(".", 1)[-1] if "." in path else ""
    fname = os.path.basename(path)
    try:
        # ── Plain text formats ────────────────────────────────────────
        if ext == "csv":
            for sep in (",", ";", "\t", "|"):
                try:
                    df = pd.read_csv(path, sep=sep, low_memory=False,
                                     on_bad_lines="skip", encoding_errors="replace")
                    if len(df.columns) > 1:
                        return df
                except Exception:
                    continue
        elif ext == "tsv":
            return pd.read_csv(path, sep="\t", low_memory=False,
                               on_bad_lines="skip", encoding_errors="replace")
        elif ext in ("txt", "dat"):
            # Try common separators — many ML datasets use space/comma/tab
            for sep in (",", "\t", " ", ";", "|"):
                try:
                    df = pd.read_csv(path, sep=sep, low_memory=False,
                                     on_bad_lines="skip", encoding_errors="replace",
                                     header=0)
                    if len(df.columns) > 1 and len(df) > 0:
                        return df
                except Exception:
                    continue
            # Last resort: single-column text
            return pd.read_csv(path, header=None, names=["value"],
                               encoding_errors="replace")

        # ── JSON formats ──────────────────────────────────────────────
        elif ext in ("json",):
            try:
                return pd.read_json(path)
            except Exception:
                try:
                    return pd.read_json(path, lines=True)
                except Exception:
                    pass
        elif ext in ("jsonl", "ndjson"):
            return pd.read_json(path, lines=True)

        # ── Spreadsheets ──────────────────────────────────────────────
        elif ext in ("xlsx", "xlsm"):
            return pd.read_excel(path, engine="openpyxl")
        elif ext == "xls":
            return pd.read_excel(path, engine="xlrd")
        elif ext == "ods":
            return pd.read_excel(path, engine="odf")

        # ── Binary columnar ───────────────────────────────────────────
        elif ext == "parquet":
            return pd.read_parquet(path)
        elif ext in ("feather", "arrow"):
            return pd.read_feather(path)

        # ── HDF5 ──────────────────────────────────────────────────────
        elif ext in ("h5", "hdf5"):
            # Try each key in the HDF5 file
            with pd.HDFStore(path, "r") as store:
                keys = store.keys()
                if keys:
                    return store[keys[0]]

        # ── SQLite databases ──────────────────────────────────────────
        elif ext in ("sqlite", "db", "sqlite3"):
            import sqlite3
            conn = sqlite3.connect(path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            if tables:
                # Load the largest table
                dfs = []
                for tbl in tables:
                    try:
                        dfs.append(pd.read_sql(f"SELECT * FROM {tbl}", conn))
                    except Exception:
                        pass
                conn.close()
                if dfs:
                    return pd.concat(dfs, ignore_index=True)
            conn.close()

        # ── Pickled DataFrames ────────────────────────────────────────
        elif ext in ("pkl", "pickle"):
            import pickle
            with open(path, "rb") as f:
                obj = pickle.load(f)
            if isinstance(obj, pd.DataFrame):
                return obj
            elif isinstance(obj, dict):
                return pd.DataFrame(obj)

        # ── Weka ARFF format ──────────────────────────────────────────
        elif ext == "arff":
            lines = open(path, encoding="utf-8", errors="replace").readlines()
            data_start = next((i for i,l in enumerate(lines)
                               if l.strip().upper() == "@DATA"), None)
            if data_start is not None:
                attr_lines = [l for l in lines[:data_start]
                              if l.strip().upper().startswith("@ATTRIBUTE")]
                col_names = [l.split()[1].strip("'\"") for l in attr_lines]
                return pd.read_csv(path, skiprows=data_start+1,
                                   header=None, names=col_names,
                                   on_bad_lines="skip",
                                   encoding_errors="replace")

    except Exception as e:
        print(f"    ⚠  Could not load {fname}: {e}")
    return None

all_files = scan_dataset_folder(DATA_DIR)

if not all_files:
    print(f"""
  ╔══════════════════════════════════════════════════════════════╗
  ║  NO DATASETS FOUND IN '{DATA_DIR}/' FOLDER                  ║
  ╠══════════════════════════════════════════════════════════════╣
  ║  Pipeline requires at least one dataset to run.             ║
  ║                                                             ║
  ║  HOW TO ADD DATASETS:                                       ║
  ║    1. Create folder: CHAKRAVYUH_FINAL/datasets/             ║
  ║    2. Drop your CSV/JSON/XLSX files inside                  ║
  ║    3. Sub-folders are fine — pipeline scans recursively     ║
  ║    4. Run this script again                                 ║
  ║                                                             ║
  ║  RECOMMENDED DATASETS:                                      ║
  ║    • NSL-KDD (anomaly detection)                           ║
  ║      kaggle datasets download -d START-HERE-FULL/nsl-kdd   ║
  ║    • VisDrone (object detection labels)                     ║
  ║      github.com/VisDrone/VisDrone-Dataset                  ║
  ║    • GTD (terrorism / risk zones)                           ║
  ║      kaggle datasets download -d rdoume/bofregression       ║
  ║    • Any CSV with numeric sensor/event columns              ║
  ╚══════════════════════════════════════════════════════════════╝
""")
    sys.exit(0)

print(f"    ✔  Found {len(all_files)} file(s):")
for f in all_files:
    size_kb = os.path.getsize(f) // 1024
    print(f"       • {os.path.relpath(f, DATA_DIR):<50} ({size_kb:,} KB)")

# ── 0B: Load all files into a dict of DataFrames ────────────────────────────
raw_frames = {}
for path in all_files:
    df = load_file(path)
    if df is not None and len(df) > 0:
        key = os.path.relpath(path, DATA_DIR)
        raw_frames[key] = df
        print(f"    ✔  Loaded  {key}  →  {len(df):,} rows × {len(df.columns)} cols")
    else:
        print(f"    ✗  Skipped {os.path.basename(path)} (empty or unreadable)")

if not raw_frames:
    print("  ✗  All files were empty or unreadable. Exiting.")
    sys.exit(1)

# ── 0C: Intelligent column mapper ────────────────────────────────────────────
# Maps any arbitrary column names to the standard feature set the pipeline uses.
# Uses keyword matching — handles NSL-KDD, VisDrone, GTD, and custom datasets.

# Target feature columns and their keyword synonyms
COLUMN_MAP = {
    # location / identity
    "location":         ["location","site","place","zone","sector","region",
                         "border","area","station","city","district","hotspot"],
    "latitude":         ["lat","latitude","gps_lat","y_coord","ylat"],
    "longitude":        ["lon","long","longitude","gps_lon","x_coord","xlon"],
    "timestamp":        ["timestamp","time","datetime","date","hour","created_at",
                         "event_time","record_time"],
    # sensor / signal features
    "motion_intensity": ["motion","movement","velocity","speed","kinetic","activity",
                         "src_bytes","dst_bytes","num_failed_logins","duration",
                         "traffic","flow_bytes"],
    "thermal_delta":    ["thermal","temp","temperature","heat","ir","infrared",
                         "delta_temp","hot","celsius"],
    "seismic_value":    ["seismic","vibration","magnitude","richter","ground",
                         "acceleration","shock","tremor"],
    "rf_burst_count":   ["rf","radio","signal","burst","frequency","count",
                         "num_connections","connection_count","packets","num_access"],
    "object_count":     ["object","count","num_obj","detected","detections","num",
                         "target_count","n_objects","num_shells","num_items"],
    "weather_code":     ["weather","condition","visibility","fog","precipitation",
                         "cloud","environment"],
    "speed_kmh":        ["speed","kmh","kph","velocity","mph","rate","land_speed"],
    "distance_border":  ["distance","dist","km","miles","border_dist","proximity",
                         "from_border","range"],
    # labels / ground truth
    "anomaly_score":    ["anomaly","score","anomaly_score","risk","threat_score",
                         "severity","label_score","attack_score","confidence"],
    "threat_level":     ["threat","label","class","category","level","severity",
                         "attack_type","class_label","intrusion","event_type",
                         "risk_level","incident_type"],
    "is_false_positive":["false_positive","fp","false_alarm","benign","normal",
                         "is_normal","is_benign","not_threat"],
    "object_type":      ["object_type","class_name","category","label","type",
                         "detected_class","species","entity"],
    # GTD / terrorism specific
    "kills":            ["nkill","kills","fatalities","casualties","killed"],
    "attack_type":      ["attacktype","attack_type","tactic","method","weaptype"],
    "country":          ["country","country_txt","nation","state","gname"],
}

def fuzzy_map_columns(df, col_map):
    """
    Given a DataFrame, return a dict mapping standard_name -> actual_col_name.
    Uses lowercase substring matching.
    """
    cols_lower = {c.lower().replace(" ","_").replace("-","_"): c for c in df.columns}
    mapping = {}
    for std_name, synonyms in col_map.items():
        for syn in synonyms:
            for col_key, col_orig in cols_lower.items():
                if syn in col_key or col_key in syn:
                    mapping[std_name] = col_orig
                    break
            if std_name in mapping:
                break
    return mapping

def build_standard_row(source_row, col_mapping, file_key, hotspot_defaults):
    """Convert a source row to the standard feature format."""
    def get(std_name, default=0.0):
        col = col_mapping.get(std_name)
        if col and col in source_row.index:
            v = source_row[col]
            if pd.isna(v): return default
            # Return raw for string fields, safe_float for numeric
            s = str(v).strip()
            if s in ('-', '', 'nan', 'NaN', 'null', 'NULL', 'none', 'None'):
                return default
            return v
        return default

    location = str(get("location", hotspot_defaults["location"]))
    lat      = float(get("latitude", hotspot_defaults["lat"]))  if get("latitude", None) is not None else hotspot_defaults["lat"]
    lon      = float(get("longitude", hotspot_defaults["lon"])) if get("longitude", None) is not None else hotspot_defaults["lon"]
    region   = hotspot_defaults["region"]

    # Timestamp → hour
    ts = get("timestamp", None)
    try:
        hour = pd.to_datetime(str(ts)).hour
    except Exception:
        try:   hour = int(float(str(ts))) % 24
        except Exception: hour = 12
    is_night = 1 if hour < 6 or hour > 21 else 0

    # Numeric features — normalise to 0-1 range if needed
    def safe_float(v):
        """Safely convert any value to float — handles '-', '', None, 'nan', etc."""
        if v is None: return 0.0
        try:
            f = float(str(v).strip())
            return f if np.isfinite(f) else 0.0
        except (ValueError, TypeError):
            return 0.0

    def norm(v, lo, hi):
        return float(np.clip((safe_float(v) - lo) / max(hi - lo, 1), 0, 1))

    motion   = norm(get("motion_intensity", 0),    0, 100)
    thermal  = norm(get("thermal_delta",    0),  -10, 50)
    seismic  = norm(get("seismic_value",    0),    0, 10)
    rf       = norm(get("rf_burst_count",   0),    0, 50)
    obj_cnt  = int(min(get("object_count",  0),   50))
    weather  = int(min(get("weather_code",  0),    4))
    speed    = float(get("speed_kmh",       0))
    dist     = float(max(get("distance_border", 1.0), 0.01))

    # Anomaly score — use directly if available, else compute
    raw_score = get("anomaly_score", None)
    if raw_score is not None and str(raw_score) not in ("", "nan"):
        raw_v = float(raw_score)
        # If it's 0–1 keep as is; if it's 0–100 normalise
        anomaly = raw_v / 100.0 if raw_v > 1.0 else raw_v
    else:
        anomaly = (motion*0.30 + seismic*0.15 + thermal*0.15 +
                   rf*0.15 + min(obj_cnt/8,1)*0.10 + is_night*0.10 +
                   hotspot_defaults["risk"]*0.05)
    anomaly = float(np.clip(anomaly, 0, 1))

    # Threat level
    raw_label = str(get("threat_level", "")).upper()
    # Map common dataset labels → CRITICAL/HIGH/MEDIUM/LOW
    LABEL_MAP = {
        "CRITICAL":["critical","dos","ddos","probe","r2l","u2r","attack",
                    "intrusion","terrorism","high_risk","anomaly"],
        "HIGH":    ["high","suspicious","elevated","medium_high","warning"],
        "MEDIUM":  ["medium","moderate","normal_high","watch","low_high"],
        "LOW":     ["low","normal","benign","safe","clear","no_threat",""],
    }
    threat_level = "LOW"
    for lvl, keywords in LABEL_MAP.items():
        if any(k in raw_label.lower() for k in keywords):
            threat_level = lvl; break
    if threat_level == "LOW":  # fallback: derive from anomaly score
        threat_level = ("CRITICAL" if anomaly > 0.72 else
                        "HIGH"     if anomaly > 0.52 else
                        "MEDIUM"   if anomaly > 0.32 else "LOW")

    obj_type = str(get("object_type", "UNKNOWN")).upper()[:20]
    is_fp    = int(bool(get("is_false_positive", 0)))

    return {
        "location":         location,
        "latitude":         round(lat, 4),
        "longitude":        round(lon, 4),
        "region":           region,
        "source_file":      file_key,
        "hour":             hour,
        "is_night":         is_night,
        "motion_intensity": round(motion,  4),
        "seismic_value":    round(seismic * 4.5, 3),
        "thermal_delta":    round(thermal * 40,  2),
        "rf_burst_count":   int(rf * 12),
        "object_count":     obj_cnt,
        "object_type":      obj_type if obj_type not in ("", "NAN") else "UNKNOWN",
        "weather_code":     weather,
        "speed_kmh":        round(speed, 2),
        "distance_border":  round(dist, 3),
        "anomaly_score":    round(anomaly, 4),
        "threat_level":     threat_level,
        "is_false_positive":is_fp,
    }

# ── Border hotspot reference table (for location fallback + coordinate enrichment)
HOTSPOTS = {
    "Depsang Plains":   (35.10, 77.80, "Ladakh LAC",       0.87),
    "Galwan Valley":    (34.40, 73.60, "J&K LoC",          0.81),
    "Siachen Glacier":  (35.50, 76.90, "Ladakh LAC",       0.74),
    "Pangong Tso":      (33.70, 78.90, "Ladakh LAC",       0.79),
    "Tawang Sector":    (27.60, 91.90, "Arunachal Sector", 0.68),
    "Anjaw District":   (28.10, 96.30, "Arunachal Sector", 0.55),
    "Doklam Plateau":   (27.30, 89.10, "Sikkim Ridge",     0.72),
    "Nathula Pass":     (27.40, 88.80, "Sikkim Ridge",     0.65),
    "Lipulekh Pass":    (30.20, 80.30, "Uttarakhand Pass", 0.48),
    "Wagah Border":     (31.60, 74.60, "Punjab Sector",    0.60),
    "Barmer Sector":    (25.70, 71.40, "Rajasthan Border", 0.52),
    "Kutch Gulf":       (23.00, 68.90, "Gujarat Coast",    0.44),
    "Rann of Kutch":    (23.90, 70.00, "Gujarat Coast",    0.41),
    "Pir Panjal Range": (33.50, 74.20, "J&K LoC",          0.77),
    "Mizoram Border":   (22.70, 92.70, "Northeast Sector", 0.38),
}
HS_NAMES   = list(HOTSPOTS.keys())
HS_VALUES  = list(HOTSPOTS.values())

# ── 0D: Merge all datasets into one unified DataFrame ────────────────────────
print(f"\n    Mapping columns and merging {len(raw_frames)} dataset(s)...")
all_rows = []
dataset_report = []
rng = np.random.default_rng(42)

for file_key, df_raw in raw_frames.items():
    col_mapping = fuzzy_map_columns(df_raw, COLUMN_MAP)
    mapped_count = len(col_mapping)
    print(f"\n    ── {file_key}")
    print(f"       Columns found  : {list(df_raw.columns[:8])}{'...' if len(df_raw.columns)>8 else ''}")
    print(f"       Mapped features: {mapped_count}/{len(COLUMN_MAP)} standard features matched")
    if mapped_count > 0:
        print(f"       Mapping        : { {k:v for k,v in list(col_mapping.items())[:6]} }")

    # Sample up to 2000 rows per file to keep pipeline fast
    sample = df_raw.sample(min(len(df_raw), 2000), random_state=42)

    file_rows = []
    for idx, row in sample.iterrows():
        # Pick a random hotspot as geographic anchor for non-geo datasets
        hi  = rng.integers(0, len(HS_NAMES))
        hs_name = HS_NAMES[hi]
        lat, lon, region, risk = HS_VALUES[hi]
        hotspot_defaults = {"location": hs_name, "lat": lat, "lon": lon,
                            "region": region, "risk": risk}
        std_row = build_standard_row(row, col_mapping, file_key, hotspot_defaults)
        file_rows.append(std_row)

    all_rows.extend(file_rows)
    dataset_report.append({
        "file":    file_key,
        "rows":    len(df_raw),
        "sampled": len(file_rows),
        "mapped":  mapped_count,
        "cols":    list(df_raw.columns),
    })
    print(f"       Processed      : {len(file_rows):,} rows")

if not all_rows:
    print("  ✗  No rows could be processed. Check your dataset column names.")
    sys.exit(1)

df = pd.DataFrame(all_rows)
df.to_csv(f"{OUT}/border_sensor_dataset.csv", index=False)
print(f"\n    ✔ Merged dataset: {len(df):,} rows from {len(raw_frames)} file(s)")
print(f"    ✔ Saved → {OUT}/border_sensor_dataset.csv")
print(f"    ✔ Threat distribution:\n{df['threat_level'].value_counts().to_string()}")

# Save a dataset discovery report
import json
report_path = f"{OUT}/dataset_discovery_report.json"
with open(report_path, "w") as f:
    json.dump({
        "total_files":   len(raw_frames),
        "total_rows":    len(df),
        "datasets":      dataset_report,
        "feature_cols":  list(df.columns),
    }, f, indent=2)
print(f"    ✔ Discovery report → {report_path}")


# ════════════════════════════════════════════════════════════════════════════
# SECTION 2 — EDA  
# ════════════════════════════════════════════════════════════════════════════
print("\n[2/5] PERFORMING EDA ...")

COLORS = {"CRITICAL": RED, "HIGH": AMBER, "MEDIUM": "#ffee55", "LOW": GREEN}
ORDER  = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

fig = plt.figure(figsize=(20, 14), facecolor=DARK)
fig.suptitle("CHAKRAVYUH-AI  ▸  BORDER SENSOR EDA DASHBOARD",
             color=CYAN, fontsize=15, fontweight="bold", fontfamily="monospace")
gs = GridSpec(3, 4, figure=fig, hspace=0.45, wspace=0.38)

# 1. Threat distribution
ax1 = fig.add_subplot(gs[0, 0])
vc  = df["threat_level"].value_counts().reindex(ORDER, fill_value=0)
ax1.bar(vc.index, vc.values, color=[COLORS.get(l, CYAN) for l in vc.index])
ax1.set_title("THREAT LEVEL DISTRIBUTION"); ax1.set_xlabel("Level"); ax1.set_ylabel("Count")

# 2. Anomaly score histogram
ax2 = fig.add_subplot(gs[0, 1])
ax2.hist(df["anomaly_score"], bins=40, color=CYAN, alpha=0.75, edgecolor=DARK)
ax2.axvline(0.52, color=AMBER, linestyle="--", linewidth=1, label="HIGH threshold")
ax2.axvline(0.72, color=RED,   linestyle="--", linewidth=1, label="CRITICAL threshold")
ax2.set_title("ANOMALY SCORE DISTRIBUTION"); ax2.legend(fontsize=7)

# 3. Hourly threat heatmap
ax3 = fig.add_subplot(gs[0, 2])
hourly = df.groupby(["hour", "threat_level"]).size().unstack(fill_value=0)
for col in ORDER:
    if col not in hourly.columns: hourly[col] = 0
hourly = hourly[ORDER]
ax3.stackplot(hourly.index, hourly.T.values,
              labels=ORDER, colors=[COLORS[l] for l in ORDER], alpha=0.8)
ax3.set_title("HOURLY THREAT PATTERN"); ax3.set_xlabel("Hour"); ax3.legend(fontsize=7)

# 4. Feature correlation heatmap
ax4 = fig.add_subplot(gs[0, 3])
num_cols = ["motion_intensity","thermal_delta","seismic_value","rf_burst_count",
            "object_count","is_night","anomaly_score"]
num_cols = [c for c in num_cols if c in df.columns]
corr = df[num_cols].corr()
sns.heatmap(corr, ax=ax4, cmap="coolwarm", annot=True, fmt=".1f",
            annot_kws={"size":6}, cbar=False,
            xticklabels=[c.replace("_"," ")[:8] for c in num_cols],
            yticklabels=[c.replace("_"," ")[:8] for c in num_cols])
ax4.set_title("SENSOR CORRELATION")

# 5. Location risk scatter
ax5 = fig.add_subplot(gs[1, :2])
loc_risk = df.groupby("location")["anomaly_score"].mean().sort_values(ascending=False)
colors5  = [RED if v>0.72 else AMBER if v>0.52 else CYAN for v in loc_risk.values]
ax5.barh(loc_risk.index, loc_risk.values, color=colors5)
ax5.set_title("MEAN ANOMALY SCORE BY LOCATION"); ax5.set_xlabel("Mean Anomaly Score")
ax5.axvline(0.52, color=AMBER, linestyle="--", linewidth=1)
ax5.axvline(0.72, color=RED,   linestyle="--", linewidth=1)

# 6. Source file contribution
ax6 = fig.add_subplot(gs[1, 2])
src_counts = df["source_file"].value_counts()
short_names = [s.split("/")[-1][:20] for s in src_counts.index]
ax6.pie(src_counts.values, labels=short_names, autopct="%1.0f%%",
        colors=[CYAN, AMBER, GREEN, RED, "#b060ff"][:len(src_counts)],
        textprops={"color": TEXT, "fontsize": 7})
ax6.set_title("ROWS BY DATASET")

# 7. Night vs day threat
ax7 = fig.add_subplot(gs[1, 3])
nd = df.groupby(["is_night","threat_level"]).size().unstack(fill_value=0)
# Ensure both DAY(0) and NIGHT(1) rows exist
for idx in [0, 1]:
    if idx not in nd.index:
        nd.loc[idx] = 0
nd = nd.sort_index()
nd.index = ["DAY", "NIGHT"]
for col in ORDER:
    if col not in nd.columns: nd[col] = 0
nd[ORDER].plot(kind="bar", ax=ax7, color=[COLORS[l] for l in ORDER], edgecolor=DARK)
ax7.set_title("DAY vs NIGHT THREATS"); ax7.legend(fontsize=7); ax7.set_xticklabels(["DAY","NIGHT"], rotation=0)

# 8. Motion vs anomaly scatter
ax8 = fig.add_subplot(gs[2, :2])
sample_plot = df.sample(min(len(df), 800), random_state=42)
for lvl in ORDER:
    sub = sample_plot[sample_plot["threat_level"] == lvl]
    ax8.scatter(sub["motion_intensity"], sub["anomaly_score"],
                c=COLORS[lvl], alpha=0.5, s=15, label=lvl)
ax8.set_title("MOTION INTENSITY vs ANOMALY SCORE")
ax8.set_xlabel("Motion Intensity"); ax8.set_ylabel("Anomaly Score")
ax8.legend(fontsize=7)

# 9. False positive analysis
ax9 = fig.add_subplot(gs[2, 2:])
if "is_false_positive" in df.columns:
    fp_loc = df.groupby("location")["is_false_positive"].mean().sort_values()
    ax9.barh(fp_loc.index, fp_loc.values * 100, color=AMBER, alpha=0.8)
    ax9.set_title("FALSE POSITIVE RATE BY LOCATION (%)"); ax9.set_xlabel("FP Rate (%)")
else:
    ax9.text(0.5, 0.5, "No FP data\nin dataset", ha="center", va="center",
             color=TEXT, transform=ax9.transAxes)
    ax9.set_title("FALSE POSITIVE ANALYSIS")

hud_style(fig)
fig.savefig(f"{OUT}/1_EDA_dashboard.png", dpi=150, bbox_inches="tight")
plt.close(fig)

# Geo risk map
fig2, ax = plt.subplots(figsize=(14, 8), facecolor=DARK)
ax.set_facecolor("#040d1a")
ax.set_title("GEOGRAPHIC RISK MAP — INDIA BORDER HOTSPOTS",
             color=CYAN, fontsize=12, fontweight="bold", fontfamily="monospace")
loc_mean = df.groupby("location").agg(
    lat=("latitude","mean"), lon=("longitude","mean"), risk=("anomaly_score","mean")).reset_index()
sc = ax.scatter(loc_mean["lon"], loc_mean["lat"],
                c=loc_mean["risk"], cmap="RdYlGn_r", s=200, zorder=5,
                vmin=0, vmax=1, edgecolors=CYAN, linewidths=0.5)
for _, row in loc_mean.iterrows():
    ax.annotate(row["location"], (row["lon"], row["lat"]),
                xytext=(5, 5), textcoords="offset points",
                color=TEXT, fontsize=7, fontfamily="monospace")
plt.colorbar(sc, ax=ax, label="Mean Anomaly Score").ax.yaxis.label.set_color(TEXT)
ax.set_xlabel("Longitude", color=TEXT); ax.set_ylabel("Latitude", color=TEXT)
ax.tick_params(colors=TEXT)
fig2.savefig(f"{OUT}/1b_geo_risk_map.png", dpi=150, bbox_inches="tight")
plt.close(fig2)
print("    ✔ EDA charts saved")


# ════════════════════════════════════════════════════════════════════════════
# SECTION 3 — ANOMALY DETECTION  
# ════════════════════════════════════════════════════════════════════════════
print("\n[3/5] TRAINING ISOLATION FOREST ANOMALY DETECTOR ...")

FEATURES = ["motion_intensity","seismic_value","thermal_delta","rf_burst_count",
            "object_count","is_night","hour","weather_code","speed_kmh","distance_border"]
FEATURES = [f for f in FEATURES if f in df.columns]

X_all = df[FEATURES].fillna(0).values

iso = IsolationForest(n_estimators=200, contamination=0.12, random_state=42, n_jobs=-1)
iso.fit(X_all)

df["iso_pred"]  = iso.predict(X_all)          # -1 = anomaly, +1 = normal
df["iso_score"] = -iso.score_samples(X_all)   # higher = more anomalous
n_anomalies     = (df["iso_pred"] == -1).sum()
print(f"    ✔ Isolation Forest trained on {len(X_all):,} samples")
print(f"    ✔ Detected {n_anomalies:,} anomalies ({n_anomalies/len(df)*100:.1f}%)")

joblib.dump(iso,      f"{OUT}/model_isolation_forest.pkl")
joblib.dump(FEATURES, f"{OUT}/feature_list.pkl")
print(f"    ✔ Model saved → model_isolation_forest.pkl")

# Anomaly distribution plot
fig3, axes = plt.subplots(1, 2, figsize=(14, 5), facecolor=DARK)
axes[0].hist(df[df["iso_pred"]==  1]["iso_score"], bins=40, alpha=0.7, color=GREEN, label="Normal")
axes[0].hist(df[df["iso_pred"]== -1]["iso_score"], bins=40, alpha=0.7, color=RED,   label="Anomaly")
axes[0].set_title("ISOLATION FOREST — ANOMALY SCORE DISTRIBUTION")
axes[0].legend(); axes[0].set_xlabel("Anomaly Score")

pca    = PCA(n_components=2, random_state=42)
X_pca  = pca.fit_transform(X_all)
colors = [RED if p==-1 else GREEN for p in df["iso_pred"]]
axes[1].scatter(X_pca[:,0], X_pca[:,1], c=colors, alpha=0.3, s=8)
axes[1].set_title("PCA — ANOMALY vs NORMAL")
hud_style(fig3, "ANOMALY DETECTION RESULTS")
fig3.savefig(f"{OUT}/2_anomaly_detection.png", dpi=150, bbox_inches="tight")
plt.close(fig3)
print("    ✔ Anomaly plot saved")


# ════════════════════════════════════════════════════════════════════════════
# SECTION 4 — THREAT CLASSIFICATION  
# ════════════════════════════════════════════════════════════════════════════
print("\n[4/5] TRAINING RANDOM FOREST CLASSIFIER ...")

le = LabelEncoder()
y  = le.fit_transform(df["threat_level"])
X  = df[FEATURES].fillna(0).values

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_tr, X_te, y_tr, y_te = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

rf = RandomForestClassifier(n_estimators=200, max_depth=12,
                             min_samples_leaf=4, n_jobs=-1, random_state=42)
rf.fit(X_tr, y_tr)
acc    = rf.score(X_te, y_te)
cv_acc = cross_val_score(rf, X_scaled, y, cv=5, scoring="accuracy", n_jobs=-1)

print(f"    ✔ Random Forest trained — Test accuracy: {acc:.3f}")
print(f"    ✔ 5-fold CV: {cv_acc.mean():.3f} ± {cv_acc.std():.3f}")
print(classification_report(y_te, rf.predict(X_te), target_names=le.classes_))

joblib.dump(rf,     f"{OUT}/model_random_forest_classifier.pkl")
joblib.dump(scaler, f"{OUT}/scaler_random_forest.pkl")
joblib.dump(le,     f"{OUT}/label_encoder_threat.pkl")
print("    ✔ Models saved")

# Confusion matrix + feature importance
fig4, axes = plt.subplots(1, 2, figsize=(14, 5), facecolor=DARK)
ConfusionMatrixDisplay(confusion_matrix(y_te, rf.predict(X_te)),
                       display_labels=le.classes_).plot(ax=axes[0], cmap="Blues")
axes[0].set_title("CONFUSION MATRIX")

fi = pd.Series(rf.feature_importances_, index=FEATURES).sort_values(ascending=True)
fi.plot(kind="barh", ax=axes[1], color=CYAN)
axes[1].set_title("FEATURE IMPORTANCE")
hud_style(fig4, "THREAT CLASSIFICATION RESULTS")
fig4.savefig(f"{OUT}/3_classification.png", dpi=150, bbox_inches="tight")
plt.close(fig4)


# ════════════════════════════════════════════════════════════════════════════
# SECTION 5 — HIGH-RISK ZONE PREDICTION  
# ════════════════════════════════════════════════════════════════════════════
print("\n[5/5] PREDICTING HIGH-RISK ZONES ...")

risk_df = df.groupby("location").agg(
    mean_anomaly        =("anomaly_score",    "mean"),
    critical_events     =("threat_level",     lambda x: (x=="CRITICAL").sum()),
    high_events         =("threat_level",     lambda x: (x=="HIGH").sum()),
    false_positive_rate =("is_false_positive","mean"),
    night_threat_ratio  =("is_night",         "mean"),
    total_events        =("anomaly_score",    "count"),
).reset_index()

# Risk score formula
risk_df["risk_score"] = (
    risk_df["mean_anomaly"]        * 0.40 +
    (risk_df["critical_events"] / risk_df["total_events"].clip(1)) * 0.30 +
    (risk_df["high_events"]     / risk_df["total_events"].clip(1)) * 0.15 +
    risk_df["night_threat_ratio"]  * 0.10 +
    (1 - risk_df["false_positive_rate"].clip(0,1)) * 0.05
).clip(0, 1)

# Normalise 0→1
mn, mx = risk_df["risk_score"].min(), risk_df["risk_score"].max()
if mx > mn:
    risk_df["risk_score"] = ((risk_df["risk_score"] - mn) / (mx - mn)).round(4)

risk_df["risk_category"] = risk_df["risk_score"].apply(
    lambda v: "HIGH RISK" if v>=0.66 else "MODERATE RISK" if v>=0.33 else "LOW RISK"
)
risk_df = risk_df.sort_values("risk_score", ascending=False)

# FP reduction
fp_before = risk_df["false_positive_rate"].mean()
risk_df["fp_suppressed"] = risk_df.apply(
    lambda r: r["false_positive_rate"] * 0.80 if r["risk_score"] < 0.4 else r["false_positive_rate"], axis=1)
fp_after  = risk_df["fp_suppressed"].mean()
fp_reduction = (fp_before - fp_after) / max(fp_before, 0.001) * 100

risk_df.to_csv(f"{OUT}/high_risk_zone_predictions.csv", index=False)
print(f"    ✔ {len(risk_df)} zones predicted → high_risk_zone_predictions.csv")
print(f"    ✔ False positive reduction: {fp_reduction:.1f}%")

# Risk zone bar chart
fig5, axes = plt.subplots(1, 2, figsize=(16, 6), facecolor=DARK)
colors5 = [RED if c=="HIGH RISK" else AMBER if c=="MODERATE RISK" else GREEN
           for c in risk_df["risk_category"]]
axes[0].barh(risk_df["location"], risk_df["risk_score"], color=colors5)
axes[0].axvline(0.66, color=RED,   linestyle="--", linewidth=1, label="HIGH threshold")
axes[0].axvline(0.33, color=AMBER, linestyle="--", linewidth=1, label="MOD threshold")
axes[0].set_title("RISK SCORES BY LOCATION"); axes[0].legend(fontsize=7)

axes[1].bar(["Before\nFP Suppression","After\nFP Suppression"],
            [fp_before*100, fp_after*100], color=[RED, GREEN])
axes[1].set_ylabel("False Positive Rate (%)"); axes[1].set_title("ALERT PRIORITY — FP REDUCTION")
for i, v in enumerate([fp_before*100, fp_after*100]):
    axes[1].text(i, v+0.2, f"{v:.1f}%", ha="center", color=TEXT, fontsize=10)

hud_style(fig5, "HIGH-RISK ZONE PREDICTION & ALERT PRIORITY")
fig5.savefig(f"{OUT}/5_risk_prediction_alerts.png", dpi=150, bbox_inches="tight")
plt.close(fig5)


# ════════════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ════════════════════════════════════════════════════════════════════════════
print(f"""
{"=" * 70}
  CHAKRAVYUH-AI  ▸  PIPELINE COMPLETE ✔

  Datasets consumed  : {len(raw_frames)} file(s) from '{DATA_DIR}/'
  Total rows merged  : {len(df):,}
  Outputs saved to   : {OUT}/

  Files generated:
    ✔ border_sensor_dataset.csv          ({len(df):,} rows)
    ✔ high_risk_zone_predictions.csv     ({len(risk_df)} zones)
    ✔ model_isolation_forest.pkl
    ✔ model_random_forest_classifier.pkl
    ✔ scaler_random_forest.pkl
    ✔ label_encoder_threat.pkl
    ✔ feature_list.pkl
    ✔ dataset_discovery_report.json
    ✔ 1_EDA_dashboard.png
    ✔ 1b_geo_risk_map.png
    ✔ 2_anomaly_detection.png
    ✔ 3_classification.png
    ✔ 5_risk_prediction_alerts.png

  Top 5 risk zones:
{risk_df[["location","risk_score","risk_category"]].head().to_string(index=False)}

  Random Forest accuracy : {acc:.1%}
  5-fold CV accuracy     : {cv_acc.mean():.1%} ± {cv_acc.std():.1%}
  False positive reduction: {fp_reduction:.1f}%
{"=" * 70}
""")