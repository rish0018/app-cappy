# Cappy Training Pipeline

**Activate Python env**
- CMD: `.venv\Scripts\activate.bat`
- PowerShell: `.\.venv\Scripts\Activate.ps1`

---

## Current Status   Last Updated

| Phase | Script | Status | Notes |
| ----- | ------ | ------ | ----- |
| 1   Dataset Inspection | `inspect_dataset.py` | ✅ Complete | 87,000 images, 29 classes verified |
| 2   Landmark Extraction | `extract_landmarks.py` | ✅ Complete | Resume checkpoint, per-class logging, graceful shutdown |
| 3   Normalization | `normalize_landmarks.py` | ✅ Complete | Wrist-relative + max-norm scale   matches inference exactly |
| 4   EDA |   | ⬜ Not started | |
| 5   Model Training | `train_model.py` | ✅ Complete | Random Forest, 300 trees, 98.9% validation accuracy |
| 6   Evaluation | `evaluate_model.py` | ✅ Complete | Per-class CSV, misclassification table, confusion matrix |
| 7   Webcam Testing | `webcam_test.py` | ✅ Complete | Top-5 panel, smoothed confidence, live bounding box |
| 8   TF.js Export | `export_tfjs.py` | ⬜ Not started | |
| 9   React Integration |   | ⬜ Not started | |
| 10   Educational Layer |   | ⬜ Not started | |

### Key decisions made

- **Normalization pipeline confirmed.** Raw coordinates from `extract_landmarks.py` must pass through `normalize_landmarks.py` before training. The normalization (wrist subtraction + max-landmark-distance scaling) is mathematically identical between training and live inference. Skipping this step was the root cause of low webcam confidence in earlier testing.
- **Confidence is now smoothed.** `webcam_test.py` tracks `(index, confidence)` pairs across a 7-frame history window. The displayed confidence is the average of frames that voted for the smoothed prediction   not a raw single-frame value.
- **Top-5 candidate panel added.** See the Top-5 Acceptance Policy section below for how this feeds into the educational UX.

---

## Version 1.0   Machine Learning Roadmap

> **Location**
>
> ```
> apps/
> └── training/
>     └── README.md
> ```
>
> This document serves as the development guide for Cappy's Machine Learning pipeline.
>
> It explains **exactly** what needs to be built, **why** it is built, and **when** each component should be implemented.
>
> **Rule #1**
>
> Do **not** skip phases.
>
> Every phase builds upon the previous one.

---

# Objective

The goal of Version 1 is **not** to build an AI that understands sign language.

The goal is much simpler.

> **Train a lightweight machine learning model capable of recognizing the 26 static ASL alphabet letters in real time with high accuracy.**

This model will later become part of the Cappy learning experience inside the React web application.

---

# High-Level Architecture

```text
                Kaggle Dataset
                      │
                      ▼
         Dataset Validation & Inspection
                      │
                      ▼
        MediaPipe Hand Landmark Extraction
                      │
                      ▼
         Coordinate Normalization Pipeline
                      │
                      ▼
          Landmark CSV Training Dataset
                      │
                      ▼
      TensorFlow Classification Model
                      │
                      ▼
        Model Evaluation & Benchmarking
                      │
                      ▼
         TensorFlow.js Model Export
                      │
                      ▼
        React Webcam Integration
                      │
                      ▼
      Educational Feedback & Lessons
```

The Machine Learning model is **one component** of Cappy.

The educational experience remains the primary product.

---

# Recommended Project Structure

```text
training/

│

├── datasets/
│   ├── raw/
│   │   └── asl_alphabet/
│   │
│   ├── processed/
│   │
│   └── README.md
│
├── scripts/
│   ├── inspect_dataset.py
│   ├── extract_landmarks.py
│   ├── normalize_landmarks.py
│   ├── create_csv.py
│   ├── train_model.py
│   ├── evaluate_model.py
│   ├── export_tfjs.py
│   └── webcam_test.py
│
├── notebooks/
│
├── experiments/
│
├── exports/
│   ├── tensorflow/
│   ├── tensorflowjs/
│   └── tflite/
│
├── reports/
│
├── requirements.txt
│
└── README.md
```

---

# Dataset Strategy

## Primary Dataset

Use the **ASL Alphabet Dataset** from Kaggle.

Reason:

* Large dataset
* Clean folder structure
* Widely used
* Suitable for static letter recognition
* Perfect starting point for MediaPipe extraction

We will **not** train directly on these images.

Instead, they will be converted into landmark coordinates.

---

# Why MediaPipe?

Training directly on images is unnecessary for Version 1.

MediaPipe already solves one of the hardest problems:

* Detecting the hand.
* Tracking the hand.
* Extracting landmarks.

Instead of training on pixels, we train on geometry.

```text
Image

↓

MediaPipe

↓

21 Hand Landmarks

↓

TensorFlow Classifier

↓

Letter Prediction
```

Advantages:

* Faster
* Smaller model
* Browser friendly
* Mobile friendly
* Easier debugging
* Better TensorFlow.js deployment

---

# Development Phases

---

# Phase 1   Dataset Research ✅

## Objective

Understand the dataset before writing ML code.

### Tasks

* ✅ Download the ASL Alphabet dataset.
* ✅ Verify all classes.
* ✅ Count images per class.
* ✅ Identify corrupt files.
* ✅ Inspect image quality.
* ✅ Record observations.

### Deliverables

* ✅ Dataset downloaded   87,000 images, 200×200px, 29 classes.
* ✅ Dataset report   `inspect_dataset.py` produces per-class counts and corrupt file list.
* ✅ Initial experiment log.

---

# Phase 2   MediaPipe Extraction ✅

## Objective

Convert every image into landmark coordinates.

Pipeline:

```text
Image → MediaPipe → 21 Hand Landmarks → CSV
```

### Tasks

* ✅ `extract_landmarks.py`   production-quality scaffold.

The script:

* ✅ Reads every image.
* ✅ Detects a hand with MediaPipe.
* ✅ Extracts and saves 21 landmarks per image.
* ✅ Skips invalid/unreadable images   logs them separately.
* ✅ Distinguishes failed reads vs no-hand-detected.
* ✅ Resume checkpoint (`progress.json`)   safe to interrupt and rerun.
* ✅ Per-class breakdown in final summary.

### Deliverables

* ✅ `datasets/csv/landmarks_raw.csv`   label + 63 raw coordinates per row.

---

# Phase 3   Data Normalization ✅

Raw coordinates must never be used directly for training.

### What is applied

```text
1. Translate    subtract wrist (landmark 0) from all 21 points
2. Scale        divide all points by the max landmark-to-wrist distance
```

This makes every sample invariant to:

* Hand position in the frame
* Distance from the camera
* Physical hand size

### Critical rule

> The normalization applied here must be **byte-for-byte identical** to the normalization inside `webcam_test.py`.
> If they ever diverge, the model will see a distribution at inference it was never trained on, and confidence will collapse.

Both currently use:
```python
pts = pts - pts[0]                              # wrist to origin
scale = np.max(np.linalg.norm(pts, axis=1))
if scale > 0:
    pts = pts / scale
```

This was verified mathematically   zero difference between training and inference normalization.

### Deliverables

* ✅ `normalize_landmarks.py`
* ✅ `datasets/csv/landmarks_normalized.csv`

---

# Phase 4   Exploratory Data Analysis

Before training.

Questions to answer:

* Balanced classes?
* Missing values?
* Incorrect labels?
* Landmark quality?
* Failed detections?

Generate:

* Histograms
* Class distributions
* Landmark visualizations

Only after understanding the data should training begin.

---

# Phase 5   Model Training ✅

Version 1 uses a Random Forest as the baseline classifier.

### Current model

* Algorithm: `RandomForestClassifier`
* Trees: 300
* Input: 63 normalized landmark coordinates
* Output: 29 classes (A–Z + del, space, nothing)
* Train/test split: 80/20 stratified, `random_state=42`

### Deliverables

* ✅ `models/random_forest.pkl`
* ✅ `models/scaler.pkl`
* ✅ `models/label_encoder.pkl`
* ✅ `experiments/EXP-001/`   config + metrics logged

### Next model (Phase 8 prerequisite)

Random Forest cannot be exported to TensorFlow.js. Before Phase 8, the model must be replaced with a lightweight MLP or dense neural network trained in TensorFlow/Keras. The pipeline (normalization → scaler → classifier) stays identical.

---

# Phase 6   Model Evaluation ✅

### Current results (EXP-001)

| Metric    | Target | Achieved |
| --------- | ------ | -------- |
| Accuracy  | ≥ 97%  | **98.9%** |
| Precision | ≥ 97%  | **98.9%** |
| Recall    | ≥ 97%  | **98.9%** |
| F1 Score  | ≥ 97%  | **98.9%** |

All targets met.

### Deliverables

* ✅ `reports/metrics.json`
* ✅ `reports/classification_report.txt`
* ✅ `reports/per_class_accuracy.csv`
* ✅ `reports/confusion_matrix.png`
* ✅ `reports/top_misclassifications.csv`
* ✅ `experiments/EXP-001/evaluation_metrics.json`

### Known issue in evaluate_model.py

`evaluate_model.py` currently re-fits a fresh `LabelEncoder` instead of loading `label_encoder.pkl`. This works by coincidence (alphabetical order matches), but must be fixed before React integration to avoid silent label mismatch if the dataset ever changes.

---

# Phase 7   Real Webcam Testing ✅

### Current webcam_test.py features

* MediaPipe skeleton drawn with default landmark style
* Bounding box   green when confidence ≥ 40%, grey when uncertain
* Top-5 candidate panel (right side of frame)   letter, confidence bar, percentage
* Smoothed prediction   7-frame mode vote
* Smoothed confidence   average confidence of frames that voted for the winner
* FPS counter

### Testing checklist

* ✅ Laptop webcam
* ⬜ External webcam
* ⬜ Different lighting conditions
* ⬜ Different rooms / backgrounds

---

# Top-5 Acceptance Policy

## Decision

> If the correct letter appears anywhere in the model's top-5 predictions, the user's attempt is considered **acceptable**.

## Rationale

ASL hand geometry is genuinely ambiguous for certain letter pairs (M/N, R/U, K/P). Requiring the model to be 100% certain on the top-1 prediction before accepting a user's attempt is too strict   it penalises the user for the model's inherent uncertainty, not for a wrong hand shape.

The top-5 panel already exists in the webcam UI. The same ranked probability list that drives the display also drives the acceptance check.

## Acceptance tiers

| Tier | Condition | Feedback shown to user |
| ---- | --------- | ---------------------- |
| ✅ Strong | Correct letter is top-1 AND confidence ≥ 60% | "Perfect" |
| 🟡 Accepted | Correct letter is top-1 but confidence < 60% | "Good   hold it a little steadier" |
| 🟡 Accepted | Correct letter is top-2 to top-5 | "Close   the model sees it" |
| ❌ Rejected | Correct letter not in top-5 | "Try again   adjust your hand position" |

## Implementation note

The model already returns `predict_proba()` on every frame. The acceptance check is a single comparison:

```python
top5_letters = [encoder.inverse_transform([i])[0] for i in np.argsort(probs)[::-1][:5]]
accepted = target_letter in top5_letters
```

No model changes required. This is purely a UI/UX policy layer.

---

# Lesson UX Design   Reference Image + Practice + Test

## Overview

Each letter lesson has two stages:

```text
Stage 1   Learn
    Show reference image from the Kaggle test set
    User studies and replicates the hand shape
    Model runs live   accepted when top-5 contains the target letter

Stage 2   Test
    Reference image hidden
    User must produce the letter from memory
    Stricter acceptance: top-1 only, confidence ≥ 60%
```

## Reference image source

The Kaggle dataset includes a small hand-curated test set   one image per letter   stored at:

```
app-cappy/apps/training/datasets/raw/asl_alphabet/test/
```

These images are clean, well-lit, and representative. They are the reference images shown to the user during Stage 1.

Example path for letter A:
```
datasets/raw/asl_alphabet/test/A_test.jpg
```

## Stage 1   Learn flow

```text
Show reference image (A_test.jpg)
            │
            ▼
User holds up hand in front of webcam
            │
            ▼
MediaPipe extracts landmarks
            │
            ▼
Model runs predict_proba()
            │
            ├── Target letter in top-5?
            │         │
            │         YES → flash green, mark as seen, move to Stage 2
            │         │
            │         NO  → show hint, keep trying
```

## Stage 2   Test flow

```text
Reference image hidden
            │
            ▼
User produces letter from memory
            │
            ▼
Model runs predict_proba()
            │
            ├── Top-1 correct AND confidence ≥ 60%?
            │         │
            │         YES → ✅ pass, award XP
            │         │
            │         NO, but in top-5?
            │               │
            │               YES → 🟡 partial credit, show reference again
            │               │
            │               NO  → ❌ fail, retry

---

# Phase 8   TensorFlow.js Export

Once the model is approved:

Export:

```
TensorFlow SavedModel

↓

TensorFlow.js
```

Store exports inside:

```
exports/

tensorflowjs/
```

This model will later be consumed by the React application.

---

# Phase 9   React Integration

Only after Phase 8 is complete.

Pipeline:

```text
Webcam

↓

MediaPipe

↓

21 Landmarks

↓

TensorFlow.js

↓

Prediction
```

Version 1 only needs to display:

```
Prediction

Confidence
```

Nothing else.

Educational feedback comes later.

---

# Phase 10   Educational Layer

Once prediction is reliable.

Add:

* Lessons
* Progress
* XP
* Mastery
* Daily Dip
* Review scheduling

At this point the ML model becomes part of Cappy.

---

# Folder Responsibilities

## datasets/

Contains:

* Raw datasets
* Processed datasets
* Generated CSVs

Never modify raw datasets directly.

---

## scripts/

Contains reusable scripts.

Every script should perform exactly one task.

---

## notebooks/

Exploration only.

Production code should never remain inside notebooks.

---

## experiments/

Every experiment should receive:

```
EXP-001.md

EXP-002.md

EXP-003.md
```

Document:

* Dataset version
* Hyperparameters
* Metrics
* Observations

---

## exports/

Contains production-ready models.

Never overwrite previous versions.

Version every model.

---

# Git Workflow

Every phase should conclude with a commit.

Examples:

```
feat(training): add dataset inspection pipeline

feat(training): implement mediapipe extraction

feat(training): normalize landmark dataset

feat(training): train first MLP classifier

feat(training): add evaluation metrics

feat(training): export tensorflowjs model
```

Small commits are preferred over large commits.

---

# Success Criteria

The Machine Learning phase is considered complete when:

* Dataset validated.
* Landmarks extracted.
* Coordinates normalized.
* CSV generated.
* Model trained.
* Validation accuracy ≥ 97%.
* Webcam testing successful.
* TensorFlow.js model exported.
* Ready for React integration.

Only then should development shift toward the web application.

---

# Version 2 Roadmap

After the alphabet classifier is stable.

Future milestones:

```
Letters

↓

Words

↓

Continuous Fingerspelling

↓

Sentence Recognition

↓

AI Tutor

↓

Adaptive Learning
```

Each stage builds upon the previous one.

Do not skip stages.

---

# Engineering Principles

1. Data quality is more important than model complexity.
2. Reproducibility is more important than speed.
3. Simplicity is preferred over cleverness.
4. Every experiment must be documented.
5. Never optimize before measuring.
6. The learner's experience is more important than benchmark accuracy.

---

# Final Checklist

Before integrating into the web application:

* [x] Dataset validated.
* [x] Landmarks extracted.
* [x] Normalized dataset created.
* [x] Model trained.
* [x] Metrics meet targets (98.9% across all four metrics).
* [x] Webcam testing completed   top-5 panel, smoothed confidence live.
* [ ] Fix `evaluate_model.py` LabelEncoder bug.
* [ ] Replace Random Forest with TensorFlow MLP for browser export.
* [ ] TensorFlow.js export verified.
* [ ] Git commits documented.
* [ ] Experiment logs completed.
* [ ] Lesson UX   Stage 1 (Learn with reference image) implemented in React.
* [ ] Lesson UX   Stage 2 (Test without reference image) implemented in React.

Only after every item is complete should work begin on the React learning interface.

---

# Final Goal

The outcome of this training pipeline is **not simply an AI model**.

It is a production-ready, browser-compatible ASL alphabet recognition engine that becomes the foundation of Cappy's educational platform.

Once this milestone is achieved, every future feature including word recognition, sentence recognition, Braille, Morse, adaptive learning, and the AI tutor will build upon this foundation.