// Radius, elevation and gradient scales — identical to app/constants/scales.ts.

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

// Tuples typed for expo-linear-gradient's `colors` prop (at least 2 entries).
export const gradients: {
  light: Record<"brand" | "food" | "meat", [string, string]>;
  dark: Record<"brand" | "food" | "meat", [string, string]>;
} = {
  light: {
    brand: ["#E8720C", "#F3924A"],
    food: ["#E8720C", "#F3924A"],
    meat: ["#C13566", "#D65F8A"],
  },
  dark: {
    brand: ["#FF9A4D", "#FFB878"],
    food: ["#FF9A4D", "#FFB878"],
    meat: ["#F589AC", "#FAAAC6"],
  },
};
