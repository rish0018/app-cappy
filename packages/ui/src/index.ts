/**
 * @cappy/ui — WEB-ONLY React DOM component library.
 *
 * These components use react-dom primitives (button, div, Tailwind
 * utility classes) and are intended for apps/web only. They are NOT
 * compatible with React Native.
 *
 * This is a deliberate scope tradeoff for the current stage of the
 * project: a future `packages/ui-native` would house React Native /
 * NativeWind equivalents sharing the same design tokens (see
 * ./tokens) so apps/mobile can consume an equivalent API without
 * pulling in DOM-only code.
 */

export * from "./tokens";

export * from "./components/Button";
export * from "./components/Card";
export * from "./components/ProgressBar";
export * from "./components/StreakBadge";
export * from "./components/XPBadge";
export * from "./components/LessonTile";
export * from "./components/AchievementBadge";
export * from "./components/MascotMoment";
export * from "./components/ConfidenceIndicator";
export * from "./components/MorseKeyer";
export * from "./components/MorseAudioPlayer";
export * from "./components/MorseSequenceDisplay";
