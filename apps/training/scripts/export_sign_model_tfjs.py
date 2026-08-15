"""
Cappy - export_sign_model_tfjs.py

Converts the Keras SavedModel produced by train_sign_model.py into
TensorFlow.js format and writes a preprocessing.json that the web/mobile
inference code needs.

Input  : models/sign_model_savedmodel/
         models/sign_model_classes.pkl
Output : exports/tensorflowjs-signs/
           model.json               — TF.js graph model descriptor
           group1-shard*.bin        — weight shards
           preprocessing.json       — { sequenceLength, frameFeatures, labels }

Copy exports/tensorflowjs-signs/ to:
  apps/web/public/ml/asl-signs/
  apps/mobile/assets/ml/asl-signs/
"""
import json
from pathlib import Path

import joblib
import tensorflowjs as tfjs

ROOT         = Path(__file__).resolve().parent.parent
MODELS       = ROOT / "models"
SAVEDMODEL   = MODELS / "sign_model_savedmodel"
CLASSES_PATH = MODELS / "sign_model_classes.pkl"
EXPORT_DIR   = ROOT / "exports" / "tensorflowjs-signs"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

if not SAVEDMODEL.exists():
    raise FileNotFoundError(
        f"{SAVEDMODEL} not found.\nRun train_sign_model.py first."
    )

print("Converting sign model SavedModel → TF.js...")
tfjs.converters.convert_tf_saved_model(str(SAVEDMODEL), str(EXPORT_DIR))

classes = joblib.load(CLASSES_PATH)

# preprocessing.json intentionally has no StandardScaler params — the sequence
# model was trained on raw normalized landmarks (no scaler applied), unlike the
# static alphabet model. Inference code normalizes per-frame using the same
# wrist-relative + max-distance algorithm from normalize_landmarks.py.
preprocessing = {
    "sequenceLength":  64,
    "frameFeatures":   126,   # 2 hands × 21 landmarks × 3 axes
    "labels":          classes.tolist(),
}
(EXPORT_DIR / "preprocessing.json").write_text(json.dumps(preprocessing, indent=2))

print(f"\nExport complete: {EXPORT_DIR}")
print(f"  model.json + weight shards (TF.js graph model)")
print(f"  preprocessing.json — {len(classes)} labels, sequenceLength=64")
print()
print("Next: copy to app public dirs:")
print(f"  apps/web/public/ml/asl-signs/")
print(f"  apps/mobile/assets/ml/asl-signs/")
