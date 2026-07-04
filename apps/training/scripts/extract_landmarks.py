"""
Cappy - extract_landmarks.py

Production script for MediaPipe hand-landmark extraction.

Features:
- Resume checkpoint (progress.json) - failed/no-hand images are skipped on resume too
- CSV streaming with flush-per-row
- Logging (successes, failures, no-hand-detected)
- Progress bar (tqdm)
- Graceful shutdown (Ctrl+C saves progress and exits cleanly)
- Folder creation
- Final summary stats, including a per-class (per-letter) breakdown
"""

from pathlib import Path
from collections import defaultdict
import csv
import json
import logging
import signal
import sys
import time

import cv2
import mediapipe as mp
from tqdm import tqdm

# ----------------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
DATASET = ROOT/"datasets"/"raw"/"asl_alphabet"/"train"
CSV_DIR = ROOT/"datasets"/"csv"
PROC_DIR = ROOT/"datasets"/"processed"

CSV_FILE = CSV_DIR/"landmarks_raw.csv"
PROGRESS = PROC_DIR/"progress.json"
LOGFILE = PROC_DIR/"extraction.log"

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MIN_DETECTION_CONFIDENCE = 0.5
NUM_LANDMARKS = 21

# ----------------------------------------------------------------------------
# Directory setup
# ----------------------------------------------------------------------------
CSV_DIR.mkdir(parents=True, exist_ok=True)
PROC_DIR.mkdir(parents=True, exist_ok=True)

# ----------------------------------------------------------------------------
# Logging
# ----------------------------------------------------------------------------
logging.basicConfig(
    filename=LOGFILE,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

# ----------------------------------------------------------------------------
# Graceful shutdown
# ----------------------------------------------------------------------------
stop = False
def handler(sig, frame):
    global stop
    stop = True
    logging.info("Interrupt received - finishing current image, then shutting down.")
signal.signal(signal.SIGINT, handler)

# ----------------------------------------------------------------------------
# Load checkpoint
# ----------------------------------------------------------------------------
# processed_files = every image we've already attempted (success OR failure/no-hand).
# These are skipped on resume so we never reprocess them.
processed = set()
successful = 0
failed = 0
no_hand = 0
last_image = None

if PROGRESS.exists():
    data = json.loads(PROGRESS.read_text())
    processed = set(data.get("processed_files", []))
    successful = data.get("successful", 0)
    failed = data.get("failed", 0)
    no_hand = data.get("no_hand", 0)
    last_image = data.get("last_image")
    logging.info(f"Resuming from checkpoint: {len(processed)} files already processed.")

# ----------------------------------------------------------------------------
# CSV setup
# ----------------------------------------------------------------------------
write_header = not CSV_FILE.exists()
csvf = open(CSV_FILE, "a", newline="", encoding="utf-8")
writer = csv.writer(csvf)

if write_header:
    header = ["label"]
    for i in range(NUM_LANDMARKS):
        header += [f"x{i}", f"y{i}", f"z{i}"]
    writer.writerow(header)
    csvf.flush()

# ----------------------------------------------------------------------------
# Save progress helper
# ----------------------------------------------------------------------------
def save_progress():
    PROGRESS.write_text(json.dumps({
        "processed": len(processed),
        "successful": successful,
        "failed": failed,
        "no_hand": no_hand,
        "last_image": last_image,
        "processed_files": list(processed),
    }, indent=2))

# ----------------------------------------------------------------------------
# MediaPipe init
# ----------------------------------------------------------------------------
hands = mp.solutions.hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=MIN_DETECTION_CONFIDENCE,
)

# ----------------------------------------------------------------------------
# Discover images
# ----------------------------------------------------------------------------
images = []
if not DATASET.exists():
    print(f"ERROR: dataset path does not exist: {DATASET}")
    logging.error(f"Dataset path does not exist: {DATASET}")
    sys.exit(1)

for cls in sorted(DATASET.iterdir()):
    if cls.is_dir():
        for img in sorted(cls.iterdir()):
            if img.suffix.lower() in IMAGE_EXTENSIONS:
                images.append((cls.name, img))

logging.info(f"Discovered {len(images)} total images under {DATASET}")

# Per-class counters for the final breakdown. We seed every class with zeros
# up front (even ones with 0 successes this run) so the summary table is complete.
class_success = defaultdict(int)
class_failed = defaultdict(int)
class_no_hand = defaultdict(int)
class_skipped = defaultdict(int)
all_classes = sorted({label for label, _ in images})
for c in all_classes:
    class_success[c] = 0
    class_failed[c] = 0
    class_no_hand[c] = 0
    class_skipped[c] = 0

start_time = time.time()

# ----------------------------------------------------------------------------
# Main extraction loop
# ----------------------------------------------------------------------------
for label, path in tqdm(images, desc="Extracting landmarks"):
    if stop:
        break

    rel = str(path.relative_to(ROOT))

    if rel in processed:
        class_skipped[label] += 1
        continue

    img = cv2.imread(str(path))
    if img is None:
        failed += 1
        class_failed[label] += 1
        logging.warning(f"FAILED to read image: {rel}")
        processed.add(rel)
        last_image = rel
        continue

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    if result.multi_hand_landmarks:
        lm = result.multi_hand_landmarks[0]
        row = [label]
        for p in lm.landmark:
            row.extend([p.x, p.y, p.z])
        writer.writerow(row)
        csvf.flush()
        successful += 1
        class_success[label] += 1
        logging.info(f"OK: {rel}")
    else:
        no_hand += 1
        class_no_hand[label] += 1
        logging.warning(f"NO HAND DETECTED: {rel}")

    processed.add(rel)
    last_image = rel
    save_progress()

# ----------------------------------------------------------------------------
# Cleanup
# ----------------------------------------------------------------------------
hands.close()
csvf.close()
save_progress()

elapsed = time.time() - start_time
attempted_this_run = successful + failed + no_hand
total_processed = len(processed)
total_images = len(images)

# ----------------------------------------------------------------------------
# Final summary
# ----------------------------------------------------------------------------
summary_lines = []
summary_lines.append("")
summary_lines.append("=" * 60)
summary_lines.append("EXTRACTION SUMMARY" + (" (interrupted)" if stop else " (complete)"))
summary_lines.append("=" * 60)
summary_lines.append(f"Total images in dataset : {total_images}")
summary_lines.append(f"Total processed (all-time): {total_processed}")
summary_lines.append(f"Successful              : {successful}")
summary_lines.append(f"Failed (unreadable)     : {failed}")
summary_lines.append(f"No hand detected        : {no_hand}")
if total_processed > 0:
    success_rate = 100 * successful / total_processed
    summary_lines.append(f"Success rate (all-time) : {success_rate:.2f}%")
summary_lines.append(f"Elapsed time (this run) : {elapsed:.1f}s")
summary_lines.append(f"CSV output              : {CSV_FILE}")
summary_lines.append(f"Progress file           : {PROGRESS}")
summary_lines.append(f"Log file                : {LOGFILE}")

summary_lines.append("")
summary_lines.append("-" * 60)
summary_lines.append("PER-CLASS BREAKDOWN (this run)")
summary_lines.append("-" * 60)
summary_lines.append(f"{'Class':<8}{'OK':>8}{'NoHand':>8}{'Failed':>8}{'Skipped':>10}")
for c in all_classes:
    summary_lines.append(
        f"{c:<8}{class_success[c]:>8}{class_no_hand[c]:>8}{class_failed[c]:>8}{class_skipped[c]:>10}"
    )
summary_lines.append("=" * 60)

summary_text = "\n".join(summary_lines)
print(summary_text)
logging.info(summary_text)

if stop:
    print("\nStopped early by user. Progress saved - rerun the script to resume.")