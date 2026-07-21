"""
Cappy - train_tfjs_model.py

Trains a lightweight Keras dense classifier on the same normalized landmark
CSV used for the Random Forest baseline (see train_model.py). A sklearn
RandomForest cannot be exported to TensorFlow.js directly -- the tfjs
converter targets TensorFlow/Keras SavedModels -- so this is the model that
actually ships to the browser (see apps/training/README.md Phase 5's
"Lightweight Dense Neural Network" alternative).

Reuses the same StandardScaler/LabelEncoder fit convention as train_model.py
so both models see identical preprocessing; scaler/encoder are re-fit here
(not reused from the RF's pickle) so this script can run standalone, but the
values are deterministic given the same data/split so they match.
"""
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "datasets" / "csv" / "landmarks_normalized.csv"
MODELS = ROOT / "models"
REPORTS = ROOT / "reports"
EXPERIMENTS = ROOT / "experiments"
SAVEDMODEL_DIR = MODELS / "tfjs_source_savedmodel"
for d in [MODELS, REPORTS, EXPERIMENTS]:
    d.mkdir(exist_ok=True)

df = pd.read_csv(DATA)
counts = df["label"].value_counts()
df = df[df["label"].isin(counts[counts >= 10].index)]

X = df.iloc[:, 1:].values.astype(np.float32)
y_raw = df.iloc[:, 0].values

enc = LabelEncoder()
y = enc.fit_transform(y_raw)
num_classes = len(enc.classes_)

Xtr, Xte, Ytr, Yte = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

scaler = StandardScaler()
Xtr = scaler.fit_transform(Xtr).astype(np.float32)
Xte = scaler.transform(Xte).astype(np.float32)

model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(Xtr.shape[1],)),
    tf.keras.layers.Dense(128, activation="relu"),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(64, activation="relu"),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(num_classes, activation="softmax"),
])
model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])

early_stop = tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=8, restore_best_weights=True)

history = model.fit(
    Xtr, Ytr,
    validation_data=(Xte, Yte),
    epochs=100,
    batch_size=64,
    callbacks=[early_stop],
    verbose=2,
)

pred = np.argmax(model.predict(Xte, verbose=0), axis=1)
metrics = {
    "accuracy": float(accuracy_score(Yte, pred)),
    "precision": float(precision_score(Yte, pred, average="weighted")),
    "recall": float(recall_score(Yte, pred, average="weighted")),
    "f1_score": float(f1_score(Yte, pred, average="weighted")),
    "epochs_trained": len(history.history["loss"]),
}

# Persist the Keras model as a SavedModel dir for export_tfjs.py to convert.
model.export(str(SAVEDMODEL_DIR))

joblib.dump(scaler, MODELS / "tfjs_scaler.pkl")
joblib.dump(enc, MODELS / "tfjs_label_encoder.pkl")

(REPORTS / "tfjs_classification_report.txt").write_text(
    classification_report(Yte, pred, target_names=enc.classes_)
)
(REPORTS / "tfjs_metrics.json").write_text(json.dumps(metrics, indent=4))

existing = [p for p in EXPERIMENTS.iterdir() if p.is_dir() and p.name.startswith("EXP-")]
exp = EXPERIMENTS / f"EXP-{len(existing) + 1:03d}"
exp.mkdir()
(exp / "metrics.json").write_text(json.dumps(metrics, indent=4))
(exp / "config.json").write_text(json.dumps({
    "model": "KerasMLP",
    "layers": [128, 64, num_classes],
    "dropout": 0.2,
    "optimizer": "adam",
    "note": "Trained for browser TF.js export; RandomForest baseline (train_model.py) kept as the offline-accuracy reference.",
}, indent=4))
(exp / "notes.md").write_text(
    "# Experiment: Keras MLP for TF.js export\n\n"
    f"Dataset: `{DATA.relative_to(ROOT)}` ({len(df)} samples after dropping classes with <10 samples).\n\n"
    f"Metrics: {json.dumps(metrics, indent=2)}\n"
)

print(json.dumps(metrics, indent=2))
