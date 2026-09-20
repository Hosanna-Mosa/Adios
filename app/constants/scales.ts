import { moderateScale } from "react-native-size-matters";
import type { ThemeTokens } from "@/constants/colors";

// Radius, elevation and gradient scales. Split out of constants/colors.ts
// unchanged — colors.ts kept only the colour tokens.

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const elevation = {
  sm: {
    shadowColor: "#14101E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#14101E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  lg: {
    shadowColor: "#14101E",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 12,
  },
} as const;

// Tuples typed for react-native-linear-gradient / expo-linear-gradient's
// `colors` prop (requires at least 2 entries).
export const gradients: {
  light: Record<"brand" | "food" | "meat" | "ride" | "task" | "delivery", [string, string]>;
  dark: Record<"brand" | "food" | "meat" | "ride" | "task" | "delivery", [string, string]>;
} = {
  light: {
    brand: ["#4F3CF2", "#7C63F5"],
    food: ["#E8720C", "#F3924A"],
    meat: ["#C13566", "#D65F8A"],
    ride: ["#0A7EA8", "#3AA7CE"],
    task: ["#6C4FE0", "#9078EE"],
    delivery: ["#5B8A1E", "#82AE49"],
  },
  dark: {
    brand: ["#8B7FFF", "#B0A6FF"],
    food: ["#FF9A4D", "#FFB878"],
    meat: ["#F589AC", "#FAAAC6"],
    ride: ["#4FC7EC", "#82D9F3"],
    task: ["#B7A6FF", "#D0C4FF"],
    delivery: ["#A6D65C", "#C1E58A"],
  },
};
