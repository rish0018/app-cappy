"""
Cappy - export_tfjs.py

Converts the Keras SavedModel produced by train_tfjs_model.py into
TensorFlow.js format for browser inference, and exports the matching
StandardScaler mean/scale + LabelEncoder classes as JSON (tfjs can't load
sklearn's pickle format, so the browser needs the raw numbers to replicate
the exact same preprocessing normalize_landmarks.py + train_tfjs_model.py
used).
"""
import json
from pathlib import Path

import joblib
import numpy as np
import tensorflowjs as tfjs

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / "models"
SAVEDMODEL_DIR = MODELS / "tfjs_source_savedmodel"
EXPORT_DIR = ROOT / "exports" / "tensorflowjs"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

print("Converting Keras SavedModel to TensorFlow.js...")
tfjs.converters.convert_tf_saved_model(str(SAVEDMODEL_DIR), str(EXPORT_DIR))

scaler = joblib.load(MODELS / "tfjs_scaler.pkl")
encoder = joblib.load(MODELS / "tfjs_label_encoder.pkl")

preprocessing = {
    "scalerMean": np.asarray(scaler.mean_).tolist(),
    "scalerScale": np.asarray(scaler.scale_).tolist(),
    "labels": encoder.classes_.tolist(),
}
(EXPORT_DIR / "preprocessing.json").write_text(json.dumps(preprocessing, indent=2))

print(f"\nExport complete: {EXPORT_DIR}")
print(f"  - model.json + weight shards (TF.js graph model)")
print(f"  - preprocessing.json ({len(preprocessing['labels'])} labels)")
