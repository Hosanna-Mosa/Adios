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
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  lg: {
    shadowColor: "#171717",
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
    brand: ["#860132", "#990039"],
    food: ["#860132", "#990039"],
    meat: ["#860132", "#990039"],
    ride: ["#860132", "#990039"],
    task: ["#860132", "#990039"],
    delivery: ["#860132", "#990039"],
  },
  dark: {
    brand: ["#E5648F", "#EE86A8"],
    food: ["#E5648F", "#EE86A8"],
    meat: ["#E5648F", "#EE86A8"],
    ride: ["#E5648F", "#EE86A8"],
    task: ["#E5648F", "#EE86A8"],
    delivery: ["#E5648F", "#EE86A8"],
  },
};
