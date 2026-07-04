from pathlib import Path

import numpy as np
import pandas as pd
from tqdm import tqdm

# ==========================================================
# Configuration
# ==========================================================

ROOT = Path(__file__).resolve().parent.parent

INPUT_CSV = ROOT / "datasets" / "csv" / "landmarks_raw.csv"
OUTPUT_CSV = ROOT / "datasets" / "csv" / "landmarks_normalized.csv"

# ==========================================================
# Load Dataset
# ==========================================================

print("=" * 60)
print("CAPPY LANDMARK NORMALIZATION")
print("=" * 60)

df = pd.read_csv(INPUT_CSV)

print(f"Loaded {len(df):,} samples.")

feature_columns = df.columns[1:]  # Skip label

normalized_rows = []

# ==========================================================
# Normalize Each Sample
# ==========================================================

for _, row in tqdm(
    df.iterrows(),
    total=len(df),
    desc="Normalizing",
    unit="sample",
):

    label = row.iloc[0]

    coords = row.iloc[1:].to_numpy(dtype=np.float32)
    coords = coords.reshape(21, 3)

    # ------------------------------------------------------
    # Translation
    # Move wrist to origin
    # ------------------------------------------------------

    wrist = coords[0].copy()
    coords = coords - wrist

    # ------------------------------------------------------
    # Scale Normalization
    # ------------------------------------------------------

    distances = np.linalg.norm(coords, axis=1)

    max_distance = np.max(distances)

    if max_distance > 0:
        coords = coords / max_distance

    normalized_rows.append([label] + coords.flatten().tolist())

# ==========================================================
# Save Dataset
# ==========================================================

columns = ["label"]

for i in range(21):
    columns.extend(
        [
            f"x{i}",
            f"y{i}",
            f"z{i}",
        ]
    )

normalized_df = pd.DataFrame(
    normalized_rows,
    columns=columns,
)

OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)

normalized_df.to_csv(
    OUTPUT_CSV,
    index=False,
)

# ==========================================================
# Summary
# ==========================================================

print("\n" + "=" * 60)
print("NORMALIZATION COMPLETE")
print("=" * 60)

print(f"Samples Processed : {len(normalized_df):,}")
print(f"Output File       : {OUTPUT_CSV}")

print("=" * 60)