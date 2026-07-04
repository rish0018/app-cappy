"""
Cappy - webcam_test.py

Real-time ASL hand landmark recognition.

Display:
  - MediaPipe skeleton + bounding box
  - Top prediction with smoothed confidence
  - Top-5 candidates panel (letter + confidence bar)
  - FPS counter
"""

from pathlib import Path
from collections import deque
import time

import cv2
import joblib
import mediapipe as mp
import numpy as np

# ----------------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------------
ROOT   = Path(__file__).resolve().parent.parent
MODELS = ROOT / "models"

TOP_N          = 5        # how many candidates to show in the side panel
HISTORY_LEN    = 7        # smoothing window (frames)
CONF_THRESHOLD = 40.0     # below this → show prediction dimmed

# Panel layout
PANEL_W        = 220      # width of the right-hand candidates panel
BAR_MAX_W      = 140      # max width of a confidence bar inside the panel
ROW_H          = 52       # height per candidate row
PANEL_PAD      = 12       # inner padding

# Colours  (BGR)
COL_GREEN      = (0,   220,  80)
COL_YELLOW     = (0,   210, 255)
COL_CYAN       = (255, 220,   0)
COL_WHITE      = (255, 255, 255)
COL_DARK       = ( 30,  30,  30)
COL_PANEL_BG   = ( 20,  20,  20)
COL_BAR_TOP    = (0,   200,  80)
COL_BAR_REST   = ( 60,  60,  60)
COL_DIM        = (120, 120, 120)

# ----------------------------------------------------------------------------
# Load models
# ----------------------------------------------------------------------------
model   = joblib.load(MODELS / "random_forest.pkl")
scaler  = joblib.load(MODELS / "scaler.pkl")
encoder = joblib.load(MODELS / "label_encoder.pkl")

# ----------------------------------------------------------------------------
# MediaPipe
# ----------------------------------------------------------------------------
mp_hands = mp.solutions.hands
mp_draw  = mp.solutions.drawing_utils
mp_style = mp.solutions.drawing_styles

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6,
)

# ----------------------------------------------------------------------------
# State
# ----------------------------------------------------------------------------
# history stores (idx, confidence) tuples so we can retrieve the smoothed
# confidence that actually corresponds to the smoothed prediction.
history: deque = deque(maxlen=HISTORY_LEN)

cap  = cv2.VideoCapture(0)
prev = time.time()

# ----------------------------------------------------------------------------
# Helper: draw the top-N candidates panel on the right side of the frame
# ----------------------------------------------------------------------------
def draw_candidates_panel(frame, candidates, smooth_letter):
    """
    candidates : list of (letter, prob_pct) sorted descending, length TOP_N
    smooth_letter : the smoothed prediction letter (highlighted differently)
    """
    h, w = frame.shape[:2]
    panel_h = TOP_N * ROW_H + PANEL_PAD * 2 + 30   # 30 for the header row
    px = w - PANEL_W
    py = 10

    # Semi-transparent panel background
    overlay = frame.copy()
    cv2.rectangle(overlay, (px, py), (px + PANEL_W, py + panel_h), COL_PANEL_BG, -1)
    cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, frame)

    # Header
    cv2.putText(frame, "Top candidates", (px + PANEL_PAD, py + 22),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, COL_DIM, 1, cv2.LINE_AA)

    for i, (letter, pct) in enumerate(candidates):
        row_y  = py + 30 + PANEL_PAD + i * ROW_H
        is_top = (letter == smooth_letter)

        bar_w  = int(BAR_MAX_W * pct / 100.0)
        bar_x  = px + PANEL_PAD + 36    # leave space for the letter label

        # Bar background
        cv2.rectangle(frame,
                      (bar_x, row_y + 8),
                      (bar_x + BAR_MAX_W, row_y + ROW_H - 16),
                      COL_BAR_REST, -1)

        # Bar fill
        bar_col = COL_BAR_TOP if is_top else (40, 140, 60)
        if bar_w > 0:
            cv2.rectangle(frame,
                          (bar_x, row_y + 8),
                          (bar_x + bar_w, row_y + ROW_H - 16),
                          bar_col, -1)

        # Letter label
        letter_col = COL_GREEN if is_top else COL_WHITE
        scale      = 0.8 if is_top else 0.65
        thickness  = 2 if is_top else 1
        cv2.putText(frame, letter,
                    (px + PANEL_PAD, row_y + ROW_H - 20),
                    cv2.FONT_HERSHEY_SIMPLEX, scale, letter_col, thickness, cv2.LINE_AA)

        # Percentage label
        pct_col = COL_GREEN if is_top else COL_DIM
        cv2.putText(frame, f"{pct:.1f}%",
                    (bar_x + BAR_MAX_W + 4, row_y + ROW_H - 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, pct_col, 1, cv2.LINE_AA)

        # Highlight border for the top smoothed prediction
        if is_top:
            cv2.rectangle(frame,
                          (px + 2, row_y + 2),
                          (px + PANEL_W - 2, row_y + ROW_H - 4),
                          COL_GREEN, 1)


# ----------------------------------------------------------------------------
# Main loop
# ----------------------------------------------------------------------------
while True:
    ok, frame = cap.read()
    if not ok:
        break

    frame = cv2.flip(frame, 1)
    h, w  = frame.shape[:2]

    rgb    = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    prediction    = "-"
    smoothed_conf = 0.0
    candidates    = []           # list of (letter, pct) for the panel

    if result.multi_hand_landmarks:
        hand = result.multi_hand_landmarks[0]

        # Draw skeleton with default MediaPipe style
        mp_draw.draw_landmarks(
            frame, hand, mp_hands.HAND_CONNECTIONS,
            mp_style.get_default_hand_landmarks_style(),
            mp_style.get_default_hand_connections_style(),
        )

        # --- Feature extraction (identical to training normalization) ---
        pts   = np.array([[lm.x, lm.y, lm.z] for lm in hand.landmark], dtype=np.float32)
        wrist = pts[0].copy()
        pts   = pts - wrist
        scale = np.max(np.linalg.norm(pts, axis=1))
        if scale > 0:
            pts = pts / scale

        feat  = pts.flatten().reshape(1, -1)
        feat  = scaler.transform(feat)

        # --- Inference ---
        probs = model.predict_proba(feat)[0]

        # Top-N candidates (unsorted raw probs → sort descending)
        top_indices = np.argsort(probs)[::-1][:TOP_N]
        candidates  = [
            (encoder.inverse_transform([i])[0], float(probs[i]) * 100.0)
            for i in top_indices
        ]

        # --- Smoothing on the top-1 index ---
        top1_idx = int(top_indices[0])
        history.append((top1_idx, float(probs[top1_idx]) * 100.0))

        # Mode of the history indices
        smooth_idx = max(set(h_idx for h_idx, _ in history),
                         key=lambda idx: sum(1 for h_idx, _ in history if h_idx == idx))

        prediction = encoder.inverse_transform([smooth_idx])[0]

        # Smoothed confidence = average confidence of frames that voted for smooth_idx
        votes       = [c for idx, c in history if idx == smooth_idx]
        smoothed_conf = float(np.mean(votes)) if votes else 0.0

        # --- Bounding box ---
        xs = [lm.x * w for lm in hand.landmark]
        ys = [lm.y * h for lm in hand.landmark]
        x1, y1 = int(min(xs)) - 20, int(min(ys)) - 20
        x2, y2 = int(max(xs)) + 20, int(max(ys)) + 20
        box_col = COL_GREEN if smoothed_conf >= CONF_THRESHOLD else COL_DIM
        cv2.rectangle(frame, (x1, y1), (x2, y2), box_col, 2)

    # --- Candidates panel ---
    if candidates:
        draw_candidates_panel(frame, candidates, prediction)

    # --- FPS ---
    now  = time.time()
    fps  = 1.0 / max(now - prev, 1e-6)
    prev = now

    # --- HUD overlay (top-left) ---
    pred_col = COL_GREEN if smoothed_conf >= CONF_THRESHOLD else COL_DIM
    cv2.putText(frame, f"Prediction : {prediction}", (20, 38),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, pred_col, 2, cv2.LINE_AA)
    cv2.putText(frame, f"Confidence : {smoothed_conf:.1f}%", (20, 72),
                cv2.FONT_HERSHEY_SIMPLEX, 0.75, COL_YELLOW, 2, cv2.LINE_AA)
    cv2.putText(frame, f"FPS        : {fps:.1f}", (20, 104),
                cv2.FONT_HERSHEY_SIMPLEX, 0.65, COL_CYAN, 1, cv2.LINE_AA)

    cv2.imshow("Cappy ASL Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# ----------------------------------------------------------------------------
# Cleanup
# ----------------------------------------------------------------------------
cap.release()
hands.close()
cv2.destroyAllWindows()