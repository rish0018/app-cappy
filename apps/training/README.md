# Cappy Training Pipeline
activate python env .venv\Scripts\activate.bat for cmd 
for powershell .\.venv\Scripts\Activate.ps1

## Current Status — 2026-07-17

> **Note:** as of this update, the entire pipeline below was re-run from scratch. The 2026-07-04 status table below had claimed "Complete" for extraction/training, but the actual model file and processed CSV were not present on disk anywhere in the repo — only summary reports had survived. Everything below is now backed by real artifacts.

| Phase | Status | Notes |
| ----- | ------ | ----- |
| Dataset inspection | ✅ Complete | 87,000 images and 29 classes verified |
| Landmark extraction | ✅ Complete | Re-run on all 87,000 images: 63,581 successful detections, 0 failures. Ported `extract_landmarks.py` from the legacy `mp.solutions.hands` API (removed in the installed MediaPipe build) to the current Tasks API (`HandLandmarker`), and fixed a stale dataset path. Also fixed a quadratic-slowdown bug in the resume-checkpoint writer. |
| Normalization | ✅ Complete | Wrist-relative + max-norm scaling, `datasets/csv/landmarks_normalized.csv` (63,582 rows). |
| Model training | ✅ Complete | Random Forest baseline (`models/random_forest.pkl`): **98.7% validation accuracy** (`nothing` class excluded — it's "no hand visible" by definition, not a landmark-classifiable target). A Keras MLP (128→64→28, dropout 0.2) was also trained for TF.js export, since sklearn's RandomForest can't be converted to TF.js directly: **98.8% validation accuracy**. |
| Evaluation | ✅ Complete | Per-class metrics, confusion matrix, and misclassification report generated for the RF baseline; see `experiments/EXP-002` and `EXP-003`. |
| Webcam testing | ⬜ Not re-verified this pass | `webcam_test.py` exists but wasn't re-run in this session — verify against the freshly retrained model before relying on this row. |
| TensorFlow.js export | ✅ Complete | `scripts/export_tfjs.py` converts the Keras MLP to `exports/tensorflowjs/` (graph model + weights + `preprocessing.json` with the scaler mean/scale and label list, since TF.js can't load sklearn's pickle format). |
| React integration | ✅ Complete (web) | `apps/web/src/ml/` loads the exported model + MediaPipe's browser `HandLandmarker`, replicates the training normalization exactly, and implements `packages/core`'s `HandPosePredictor` contract. Wired into `apps/web/src/screens/LessonPractice.tsx` — live webcam → prediction + confidence, per Phase 9 scope. **Mobile integration is a follow-up** (react-native TF.js is a different runtime; `apps/mobile/app/lesson/[id]/practice.tsx` still has its `HandPosePredictor` TODO). |
| Educational layer | ⬜ Pending | Lesson UX and acceptance flow remain to be built |

The detailed implementation notes, decisions, and acceptance policy live in [datasets/README.md](datasets/README.md).

## Version 1.0 — Machine Learning Roadmap

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

# Phase 1 — Dataset Research

## Objective

Understand the dataset before writing ML code.

### Tasks

* Download the ASL Alphabet dataset.
* Verify all classes.
* Count images per class.
* Identify corrupt files.
* Inspect image quality.
* Record observations.

### Deliverables

* Dataset downloaded.
* Dataset report.
* Initial experiment log.

---

# Phase 2 — MediaPipe Extraction

## Objective

Convert every image into landmark coordinates.

Pipeline:

```text
Image

↓

MediaPipe

↓

21 Hand Landmarks

↓

CSV
```

### Tasks

Create:

* extract_landmarks.py

The script should:

* Read every image.
* Detect a hand.
* Extract landmarks.
* Skip invalid samples.
* Save results.

### Deliverables

CSV containing:

* Label
* Landmark coordinates
* Confidence

---

# Phase 3 — Data Normalization

Raw coordinates should never be used directly.

Normalize:

* Position
* Scale
* Rotation (where appropriate)

Purpose:

Improve generalization across:

* Different cameras
* Hand sizes
* Distances

Deliverable:

Normalized CSV dataset.

---

# Phase 4 — Exploratory Data Analysis

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

# Phase 5 — Model Training

Version 1 should begin with a lightweight classifier.

Suggested progression:

1. Multilayer Perceptron (MLP)
2. Random Forest (baseline comparison)
3. Lightweight Dense Neural Network

Avoid unnecessary complexity.

The simplest model that achieves excellent performance is the preferred solution.

---

# Phase 6 — Model Evaluation

Evaluate using:

* Accuracy
* Precision
* Recall
* F1 Score
* Confusion Matrix

Target Metrics

| Metric    | Target |
| --------- | ------ |
| Accuracy  | ≥ 97%  |
| Precision | ≥ 97%  |
| Recall    | ≥ 97%  |
| F1 Score  | ≥ 97%  |

If these metrics are not achieved, improve the dataset before changing the model.

---

# Phase 7 — Real Webcam Testing

Testing on validation data is not enough.

Run the model using:

* Laptop webcam
* External webcam
* Different lighting
* Different rooms
* Different backgrounds

Observe:

* Latency
* Prediction stability
* Misclassifications

The model should perform consistently under realistic conditions.

---

# Phase 8 — TensorFlow.js Export

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

# Phase 9 — React Integration

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

# Phase 10 — Educational Layer

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

* [ ] Dataset validated.
* [ ] Landmarks extracted.
* [ ] Normalized dataset created.
* [ ] Model trained.
* [ ] Metrics meet targets.
* [ ] Webcam testing completed.
* [ ] TensorFlow.js export verified.
* [ ] Git commits documented.
* [ ] Experiment logs completed.

Only after every item is complete should work begin on the React learning interface.

---

# Final Goal

The outcome of this training pipeline is **not simply an AI model**.

It is a production-ready, browser-compatible ASL alphabet recognition engine that becomes the foundation of Cappy's educational platform.

Once this milestone is achieved, every future feature—including word recognition, sentence recognition, Braille, Morse, adaptive learning, and the AI tutor—will build upon this foundation.
