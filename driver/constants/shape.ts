/** Corner radii, elevation presets and brand gradients. */
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

export const gradients: Record<"brand" | "food" | "meat" | "ride" | "task" | "delivery", [string, string]> = {
  brand: ["#00B4C6", "#3FCBD8"],
  food: ["#E8720C", "#F3924A"],
  meat: ["#C13566", "#D65F8A"],
  ride: ["#0A7EA8", "#3AA7CE"],
  task: ["#6C4FE0", "#9078EE"],
  delivery: ["#5B8A1E", "#82AE49"],
};
