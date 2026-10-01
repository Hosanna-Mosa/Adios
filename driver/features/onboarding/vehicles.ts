import i18n from "@/i18n";

// A function rather than a static array so labels/descriptions can call
// i18n.t() and re-read the current language on every call.
export function getVehicles() {
  return [
    {
      id: "bike",
      label: i18n.t("onboarding.vehicles.bike.label", "Bike"),
      icon: "truck" as const,
      desc: i18n.t("onboarding.vehicles.bike.desc", "Fast & fuel-efficient for deliveries"),
    },
    {
      id: "auto",
      label: i18n.t("onboarding.vehicles.auto.label", "Auto"),
      icon: "box" as const,
      desc: i18n.t("onboarding.vehicles.auto.desc", "Spacious for larger orders"),
    },
  ];
}
