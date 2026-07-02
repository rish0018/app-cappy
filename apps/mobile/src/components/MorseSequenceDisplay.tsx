import React from "react";
import { Animated, View } from "react-native";

export interface MorseSequenceDisplayProps {
  pattern: string;
  textClassName?: string;
}

/**
 * Renders a dot/dash pattern as large, legible symbols (e.g. ".-" for A).
 * Mirrors packages/ui/src/components/MorseSequenceDisplay.tsx (web). Each
 * newly-appended symbol fades/slides in so live taps visibly register on
 * the Send screen.
 */
export function MorseSequenceDisplay({ pattern, textClassName = "" }: MorseSequenceDisplayProps) {
  const symbols = pattern.split("");

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Pattern: ${symbols.map((symbol) => (symbol === "-" ? "dash" : "dot")).join(" ")}`}
      className="flex-row items-center gap-sm"
    >
      {symbols.map((symbol, index) => (
        <SequenceSymbol key={index} symbol={symbol} textClassName={textClassName} />
      ))}
    </View>
  );
}

function SequenceSymbol({ symbol, textClassName }: { symbol: string; textClassName: string }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(4)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.Text
      className={`font-mono text-3xl text-neutral-800 ${textClassName}`}
      style={{ opacity, transform: [{ translateY }] }}
    >
      {symbol === "-" ? "▬" : "•"}
    </Animated.Text>
  );
}
