"""
Cappy - download_asl_signs.py

Downloads the Google ASL Signs competition dataset from Kaggle via kagglehub.
Requires KAGGLE_USERNAME and KAGGLE_KEY env vars (or ~/.kaggle/kaggle.json).

Output: datasets/raw/asl_signs/ containing:
  train.csv              — path → sign label mapping (~94K rows)
  train_landmark_files/  — parquet files with pre-extracted MediaPipe landmarks

Run from the apps/training directory:
  python scripts/download_asl_signs.py
"""
from pathlib import Path
import shutil

import kagglehub

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "datasets" / "raw" / "asl_signs"

print("=" * 60)
print("CAPPY  — DOWNLOAD GOOGLE ASL SIGNS")
print("=" * 60)

if DEST.exists():
    print(f"Dataset already present at {DEST}")
    print("Delete it and re-run to force a fresh download.")
else:
    print("Downloading via kagglehub (requires Kaggle credentials)...")
    path = kagglehub.competition_download("asl-signs")
    src = Path(path)
    DEST.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(src, DEST)
    print(f"\nDataset saved to: {DEST}")

# Quick sanity check
train_csv = DEST / "train.csv"
landmark_dir = DEST / "train_landmark_files"
print("\nSanity check:")
if train_csv.exists():
    import pandas as pd
    df = pd.read_csv(train_csv)
    print(f"  train.csv          : {len(df):,} sequences, {df['sign'].nunique()} unique signs")
else:
    print("  train.csv          : NOT FOUND")

if landmark_dir.exists():
    parquets = list(landmark_dir.rglob("*.parquet"))
    print(f"  parquet files      : {len(parquets):,}")
else:
    print("  train_landmark_files: NOT FOUND")

print("=" * 60)
