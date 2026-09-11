// Date/time helpers for ScheduleDateTimeSheet, in their own file so the
// component and its hook both stay under 150 lines.

export const timePartsOf = (date: Date) => {
  let hourVal = date.getHours();
  const ampmVal = hourVal >= 12 ? "PM" : "AM";
  hourVal = hourVal % 12;
  hourVal = hourVal ? hourVal : 12;

  let minVal = Math.round(date.getMinutes() / 5) * 5;
  if (minVal >= 60) minVal = 0;

  return {
    hour: String(hourVal),
    minute: String(minVal).padStart(2, "0"),
    ampm: ampmVal as "AM" | "PM",
  };
};

export const getDefaultTimeParts = (baseDate = new Date()) => {
  const next = new Date(baseDate);
  next.setMinutes(next.getMinutes() + 45);
  return { date: next, ...timePartsOf(next) };
};
