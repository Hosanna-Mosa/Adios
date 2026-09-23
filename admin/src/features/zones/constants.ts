export const getAvailableServices = (t: (key: string) => string) => [
  { id: "bike", label: t("zones.serviceBike") },
  { id: "auto", label: t("zones.serviceAuto") },
  { id: "cab", label: t("zones.serviceCab") },
  { id: "cab_prime", label: t("zones.serviceCabPrime") },
  { id: "delivery", label: t("zones.serviceDelivery") },
  { id: "helper", label: t("zones.serviceHelper") },
];
