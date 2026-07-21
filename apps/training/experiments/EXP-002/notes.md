# Experiment: Random Forest baseline (re-run 2026-07-17)

The previously reported model artifact and processed landmark CSV were not
actually present on disk (only summary reports survived) -- re-ran the full
pipeline from scratch: extracted landmarks from all 87,000 raw images
(63,581 successful detections, "nothing" class excluded -- see below),
normalized, and retrained.

Dataset: `datasets/csv/landmarks_normalized.csv`, minus the `nothing` class
(only 1 successful landmark extraction across 3,000 images -- expected,
since "nothing" means no hand is visible, so there's nothing to learn from
as a landmark classifier target).

Metrics: accuracy 0.9869, precision 0.9870, recall 0.9869, f1 0.9869 --
matches the previously claimed 98.9% now backed by real artifacts
(`models/random_forest.pkl`, `models/scaler.pkl`, `models/label_encoder.pkl`).

Kept as the offline-accuracy reference; see EXP-003 for the Keras MLP
actually used for the browser TF.js export (sklearn RandomForest can't be
converted to TF.js directly).
