/** Per-service accent colours — same hues as the customer app. */
export type ServiceTokens = { accent: string; skin: string; on: string };
export const services: {
  food: ServiceTokens;
  meat: ServiceTokens;
  ride: ServiceTokens;
  task: ServiceTokens;
  delivery: ServiceTokens;
} = {
  food: { accent: "#E8720C", skin: "#FDF0E2", on: "#FFFFFF" },
  meat: { accent: "#C13566", skin: "#FBE8EF", on: "#FFFFFF" },
  ride: { accent: "#0A7EA8", skin: "#E1F2F8", on: "#FFFFFF" },
  task: { accent: "#6C4FE0", skin: "#EEE9FC", on: "#FFFFFF" },
  delivery: { accent: "#5B8A1E", skin: "#EFF5E1", on: "#FFFFFF" },
};
