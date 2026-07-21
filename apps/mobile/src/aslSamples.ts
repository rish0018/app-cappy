import type { Letter } from "@cappy/types";
import type { ImageSourcePropType } from "react-native";

/**
 * Per-letter ASL fingerspelling reference photos, one per letter A-Z.
 * Sourced from the same curated test split the web app and the ML training
 * pipeline use (apps/training/datasets/raw/asl_alphabet/asl_alphabet_test),
 * copied into apps/mobile/assets/asl-samples so Metro can bundle them.
 *
 * Metro's static analysis requires `require()` calls to use literal string
 * paths, so this map is written out explicitly rather than built from a
 * template string.
 */
export const ASL_SAMPLE_IMAGES: Record<Letter, ImageSourcePropType> = {
  A: require("../assets/asl-samples/A_test.jpg"),
  B: require("../assets/asl-samples/B_test.jpg"),
  C: require("../assets/asl-samples/C_test.jpg"),
  D: require("../assets/asl-samples/D_test.jpg"),
  E: require("../assets/asl-samples/E_test.jpg"),
  F: require("../assets/asl-samples/F_test.jpg"),
  G: require("../assets/asl-samples/G_test.jpg"),
  H: require("../assets/asl-samples/H_test.jpg"),
  I: require("../assets/asl-samples/I_test.jpg"),
  J: require("../assets/asl-samples/J_test.jpg"),
  K: require("../assets/asl-samples/K_test.jpg"),
  L: require("../assets/asl-samples/L_test.jpg"),
  M: require("../assets/asl-samples/M_test.jpg"),
  N: require("../assets/asl-samples/N_test.jpg"),
  O: require("../assets/asl-samples/O_test.jpg"),
  P: require("../assets/asl-samples/P_test.jpg"),
  Q: require("../assets/asl-samples/Q_test.jpg"),
  R: require("../assets/asl-samples/R_test.jpg"),
  S: require("../assets/asl-samples/S_test.jpg"),
  T: require("../assets/asl-samples/T_test.jpg"),
  U: require("../assets/asl-samples/U_test.jpg"),
  V: require("../assets/asl-samples/V_test.jpg"),
  W: require("../assets/asl-samples/W_test.jpg"),
  X: require("../assets/asl-samples/X_test.jpg"),
  Y: require("../assets/asl-samples/Y_test.jpg"),
  Z: require("../assets/asl-samples/Z_test.jpg"),
};

/** Letters mentioned in a lesson title, e.g. "Meet A, B, C" -> ["A","B","C"]. */
export function extractLettersFromTitle(title: string): Letter[] {
  const matches = title.match(/\b[A-Z]\b/g) ?? [];
  const letters: Letter[] = [];
  for (const m of matches) {
    if (m in ASL_SAMPLE_IMAGES) {
      letters.push(m as Letter);
    }
  }
  return letters;
}
