"""
Cappy - preprocess_asl_signs.py

Converts Google ASL Signs competition parquet files (pre-extracted MediaPipe
landmarks) into fixed-length numpy sequences ready for LSTM training.

Input  : datasets/raw/asl_signs/ (from download_asl_signs.py)
Output : datasets/processed/asl_signs_sequences.npz
           X  — float32 (N, SEQUENCE_LENGTH, 126)
           y  — int32   (N,)                         class indices
         datasets/processed/asl_signs_label_encoder.pkl

Landmark layout per frame (126 features):
  [0:63]   left_hand  — 21 landmarks × (x, y, z), wrist-relative, unit-scaled
  [63:126] right_hand — 21 landmarks × (x, y, z), wrist-relative, unit-scaled
  When a hand is absent for a frame the 63 values are left as zeros.

Normalization matches normalize_landmarks.py exactly:
  1. Translate so wrist (landmark 0) is the origin.
  2. Divide by max Euclidean distance from origin among all 21 points.
     If max_distance == 0 (degenerate landmarks) the frame hand is left as zeros.

Sequences shorter than SEQUENCE_LENGTH are pre-padded with zero frames.
Sequences longer  than SEQUENCE_LENGTH are truncated to the LAST N frames
(the end of a sign is most discriminative).
"""
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from tqdm import tqdm

# ─── Config ───────────────────────────────────────────────────────────────────

ROOT            = Path(__file__).resolve().parent.parent
RAW_DIR         = ROOT / "datasets" / "raw" / "asl_signs"
TRAIN_CSV       = RAW_DIR / "train.csv"
LANDMARK_DIR    = RAW_DIR / "train_landmark_files"
PROCESSED_DIR   = ROOT / "datasets" / "processed"
OUTPUT_NPZ      = PROCESSED_DIR / "asl_signs_sequences.npz"
OUTPUT_ENCODER  = PROCESSED_DIR / "asl_signs_label_encoder.pkl"
OUTPUT_META     = PROCESSED_DIR / "asl_signs_meta.json"

SEQUENCE_LENGTH = 64   # frames — covers ~2s at 30fps; nearly all ASL signs fit
NUM_HANDS       = 2
NUM_LANDMARKS   = 21
COORDS          = 3    # x, y, z
HAND_FEATURES   = NUM_LANDMARKS * COORDS          # 63
FRAME_FEATURES  = NUM_HANDS * HAND_FEATURES       # 126

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

# ─── Helpers ─────────────────────────────────────────────────────────────────

def normalize_hand(coords: np.ndarray) -> np.ndarray:
    """
    Wrist-relative translation + max-distance scaling.
    coords: (21, 3) float32 — may be all-zeros if hand absent.
    Returns (21, 3) normalized, or all-zeros if hand absent/degenerate.
    """
    if not np.any(coords):
        return coords
    translated = coords - coords[0]   # wrist → origin
    max_dist = np.max(np.linalg.norm(translated, axis=1))
    if max_dist > 0:
        translated = translated / max_dist
    return translated


def parquet_to_sequence(path: Path) -> np.ndarray:
    """
    Reads one ASL Signs parquet file and returns a (T_actual, 126) float32 array.
    T_actual is the raw number of frames in the recording (before pad/truncate).
    """
    df = pd.read_parquet(path, columns=["frame", "type", "landmark_index", "x", "y", "z"])

    # Keep only hand rows
    hand_df = df[df["type"].isin(["left_hand", "right_hand"])].copy()

    frames = sorted(hand_df["frame"].unique())
    if not frames:
        return np.zeros((1, FRAME_FEATURES), dtype=np.float32)

    sequence = np.zeros((len(frames), FRAME_FEATURES), dtype=np.float32)

    for fi, frame_id in enumerate(frames):
        frame_rows = hand_df[hand_df["frame"] == frame_id]

        for hand_name, offset in [("left_hand", 0), ("right_hand", HAND_FEATURES)]:
            hand_rows = frame_rows[frame_rows["type"] == hand_name]
            if hand_rows.empty:
                continue  # leave zeros

            # Sort by landmark_index to guarantee correct order
            hand_rows = hand_rows.sort_values("landmark_index")
            # MediaPipe hands always have exactly 21 landmarks; guard against bad data
            if len(hand_rows) != NUM_LANDMARKS:
                continue

            coords = hand_rows[["x", "y", "z"]].to_numpy(dtype=np.float32)  # (21, 3)
            coords = normalize_hand(coords)
            sequence[fi, offset : offset + HAND_FEATURES] = coords.flatten()

    return sequence


def pad_or_truncate(sequence: np.ndarray) -> np.ndarray:
    """
    Returns (SEQUENCE_LENGTH, FRAME_FEATURES) float32.
    Pre-pads shorter sequences; takes the last SEQUENCE_LENGTH frames of longer ones.
    """
    T = len(sequence)
    if T == SEQUENCE_LENGTH:
        return sequence
    if T > SEQUENCE_LENGTH:
        return sequence[-SEQUENCE_LENGTH:]
    # Pre-pad with zeros
    padding = np.zeros((SEQUENCE_LENGTH - T, FRAME_FEATURES), dtype=np.float32)
    return np.vstack([padding, sequence])


# ─── Main ────────────────────────────────────────────────────────────────────

print("=" * 60)
print("CAPPY  — PREPROCESS ASL SIGNS SEQUENCES")
print("=" * 60)

if not TRAIN_CSV.exists():
    raise FileNotFoundError(
        f"train.csv not found at {TRAIN_CSV}\n"
        "Run download_asl_signs.py first."
    )

train_df = pd.read_csv(TRAIN_CSV)
print(f"Loaded train.csv: {len(train_df):,} sequences, {train_df['sign'].nunique()} classes")

# Encode labels
enc = LabelEncoder()
enc.fit(train_df["sign"].values)
joblib.dump(enc, OUTPUT_ENCODER)
print(f"Label encoder saved ({len(enc.classes_)} classes)")

# Checkpoint: skip already-done sequences on resume
checkpoint_file = PROCESSED_DIR / "asl_signs_progress.json"
if checkpoint_file.exists():
    checkpoint = json.loads(checkpoint_file.read_text())
    done_indices = set(checkpoint.get("done", []))
    print(f"Resuming from checkpoint: {len(done_indices):,} already processed")
else:
    done_indices = set()

X_list: list[np.ndarray] = []
y_list: list[int] = []
failed = 0

for idx, row in tqdm(train_df.iterrows(), total=len(train_df), desc="Extracting", unit="seq"):
    if idx in done_indices:
        continue

    parquet_path = RAW_DIR / row["path"]
    if not parquet_path.exists():
        failed += 1
        continue

    try:
        raw_seq = parquet_to_sequence(parquet_path)
        padded  = pad_or_truncate(raw_seq)
        label   = int(enc.transform([row["sign"]])[0])
        X_list.append(padded)
        y_list.append(label)
        done_indices.add(idx)
    except Exception as e:
        print(f"\n  WARN: {parquet_path.name} — {e}")
        failed += 1
        continue

    # Flush checkpoint every 1000 sequences
    if len(X_list) % 1000 == 0:
        checkpoint_file.write_text(json.dumps({"done": list(done_indices)}))

checkpoint_file.write_text(json.dumps({"done": list(done_indices)}))

if not X_list:
    raise RuntimeError("No sequences extracted. Check the dataset path and parquet format.")

X = np.stack(X_list, axis=0)   # (N, 64, 126)
y = np.array(y_list, dtype=np.int32)

np.savez_compressed(OUTPUT_NPZ, X=X, y=y)
print(f"\nSaved {OUTPUT_NPZ}")

meta = {
    "num_sequences":  int(len(X)),
    "sequence_length": SEQUENCE_LENGTH,
    "frame_features":  FRAME_FEATURES,
    "num_classes":     len(enc.classes_),
    "failed":          failed,
    "shape_X":         list(X.shape),
    "shape_y":         list(y.shape),
}
OUTPUT_META.write_text(json.dumps(meta, indent=2))

print("\n" + "=" * 60)
print("PREPROCESSING COMPLETE")
print("=" * 60)
print(f"  Sequences   : {len(X):,}")
print(f"  Shape X     : {X.shape}")
print(f"  Classes     : {len(enc.classes_)}")
print(f"  Failed      : {failed}")
print(f"  Output      : {OUTPUT_NPZ}")
print("=" * 60)
