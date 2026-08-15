"""
Cappy - train_sign_model.py

Trains a Bidirectional LSTM on the preprocessed ASL Signs sequences produced
by preprocess_asl_signs.py. The model learns to classify 64-frame landmark
sequences (126 features per frame = both hands, 21 landmarks × 3 axes) into
250 ASL word classes.

Input  : datasets/processed/asl_signs_sequences.npz  (X, y)
         datasets/processed/asl_signs_label_encoder.pkl
Output : models/sign_model_savedmodel/   — Keras SavedModel for export_sign_model_tfjs.py
         reports/sign_metrics.json
         reports/sign_classification_report.txt
         experiments/EXP-NNN/            — per-run log

Architecture (Bidirectional LSTM):
  Input (64, 126)
  → Bidirectional(LSTM(128, return_sequences=True))
  → Dropout(0.3)
  → Bidirectional(LSTM(64))
  → Dropout(0.3)
  → Dense(128, relu)
  → Dropout(0.3)
  → Dense(num_classes, softmax)

No StandardScaler: landmarks are already normalized to [-1, 1] by
preprocess_asl_signs.py (same wrist-relative + max-distance scaling used for
the static alphabet model). The LSTM handles that range directly.
"""
from pathlib import Path
import json
import joblib
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

ROOT         = Path(__file__).resolve().parent.parent
PROCESSED    = ROOT / "datasets" / "processed"
MODELS       = ROOT / "models"
REPORTS      = ROOT / "reports"
EXPERIMENTS  = ROOT / "experiments"
NPZ_PATH     = PROCESSED / "asl_signs_sequences.npz"
ENCODER_PATH = PROCESSED / "asl_signs_label_encoder.pkl"
SAVEDMODEL   = MODELS / "sign_model_savedmodel"

for d in [MODELS, REPORTS, EXPERIMENTS]:
    d.mkdir(exist_ok=True)

# ─── Load data ───────────────────────────────────────────────────────────────

print("=" * 60)
print("CAPPY  — TRAIN ASL SIGNS LSTM MODEL")
print("=" * 60)

if not NPZ_PATH.exists():
    raise FileNotFoundError(
        f"{NPZ_PATH} not found.\n"
        "Run preprocess_asl_signs.py first."
    )

data = np.load(NPZ_PATH)
X = data["X"].astype(np.float32)  # (N, 64, 126)
y = data["y"].astype(np.int32)    # (N,)

enc = joblib.load(ENCODER_PATH)
num_classes = len(enc.classes_)

print(f"Loaded  : {X.shape[0]:,} sequences  shape={X.shape}  classes={num_classes}")

# Drop classes with fewer than 10 samples (matches alphabet model convention)
class_counts = np.bincount(y)
valid_classes = np.where(class_counts >= 10)[0]
mask = np.isin(y, valid_classes)
X, y = X[mask], y[mask]

# Remap labels to 0..num_valid_classes-1
label_map = {old: new for new, old in enumerate(valid_classes)}
y = np.vectorize(label_map.get)(y).astype(np.int32)
num_classes = len(valid_classes)
valid_class_names = enc.classes_[valid_classes]

print(f"After   : {len(X):,} sequences  classes={num_classes} (dropped classes with <10 samples)")

Xtr, Xte, Ytr, Yte = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
print(f"Split   : {len(Xtr):,} train / {len(Xte):,} val")

# ─── Model ───────────────────────────────────────────────────────────────────

SEQ_LEN     = X.shape[1]   # 64
FEAT        = X.shape[2]   # 126

model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(SEQ_LEN, FEAT)),
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(128, return_sequences=True)),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(64)),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(128, activation="relu"),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(num_classes, activation="softmax"),
])
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)
model.summary()

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy", patience=8, restore_best_weights=True
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss", factor=0.5, patience=4, min_lr=1e-5, verbose=1
    ),
]

history = model.fit(
    Xtr, Ytr,
    validation_data=(Xte, Yte),
    epochs=60,
    batch_size=64,
    callbacks=callbacks,
    verbose=2,
)

# ─── Evaluate ────────────────────────────────────────────────────────────────

pred = np.argmax(model.predict(Xte, verbose=0), axis=1)

metrics = {
    "accuracy":       float(accuracy_score(Yte, pred)),
    "epochs_trained": len(history.history["loss"]),
    "num_classes":    num_classes,
    "seq_len":        SEQ_LEN,
    "frame_features": FEAT,
}
print(f"\nVal accuracy: {metrics['accuracy']:.4f}")

# ─── Save ────────────────────────────────────────────────────────────────────

model.export(str(SAVEDMODEL))
print(f"SavedModel → {SAVEDMODEL}")

# Persist remapped class names so export_sign_model_tfjs.py picks them up
joblib.dump(valid_class_names, MODELS / "sign_model_classes.pkl")

(REPORTS / "sign_metrics.json").write_text(json.dumps(metrics, indent=4))
(REPORTS / "sign_classification_report.txt").write_text(
    classification_report(Yte, pred, target_names=valid_class_names)
)

existing = [p for p in EXPERIMENTS.iterdir() if p.is_dir() and p.name.startswith("EXP-")]
exp = EXPERIMENTS / f"EXP-{len(existing) + 1:03d}"
exp.mkdir()
(exp / "metrics.json").write_text(json.dumps(metrics, indent=4))
(exp / "config.json").write_text(json.dumps({
    "model":       "BidirectionalLSTM",
    "layers":      [128, 64, 128, num_classes],
    "dropout":     0.3,
    "optimizer":   "adam",
    "lr":          1e-3,
    "seq_len":     SEQ_LEN,
    "frame_feat":  FEAT,
    "note":        "Word-level ASL Signs model; no StandardScaler (landmarks pre-normalized to [-1,1]).",
}, indent=4))

print("\n" + "=" * 60)
print("TRAINING COMPLETE")
print("=" * 60)
print(json.dumps(metrics, indent=2))
print("=" * 60)
