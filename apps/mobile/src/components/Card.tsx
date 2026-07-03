import React from "react";
import { View, type ViewProps } from "react-native";

export interface CardProps extends ViewProps {
  children: React.ReactNode;
}

/** Generic elevated surface used across dashboard, lessons, and profile screens. */
export function Card({ children, className, ...viewProps }: CardProps & { className?: string }) {
  return (
    <View
      className={`rounded-lg bg-white p-lg shadow-sm ${className ?? ""}`}
      style={{
        shadowColor: "#171410",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
      {...viewProps}
    >
      {children}
    </View>
  );
}
