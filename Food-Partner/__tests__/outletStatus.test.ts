import type { TFunction } from "i18next";
import { outletStatus } from "@/features/dashboard/outletStatus";
import type { PartnerProfile } from "@/types/models";

// Echoes the key and its params, so the tests read the decision, not the copy.
const t = ((key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key)) as unknown as TFunction;

const base: PartnerProfile = { _id: "v1", name: "Outlet", role: "restaurant_vendor", isManuallyClosed: false };

describe("outletStatus", () => {
  it("is open when the switch is on and it's within hours", () => {
    const s = outletStatus({ ...base, openState: { isOpen: true, label: "Open now", today: null } }, t);
    expect(s).toMatchObject({ kind: "open", accepting: true, badge: { tone: "success", label: "dashboard.openNow" } });
  });

  it("says the hours closed it — not a bare Closed — when the switch is on", () => {
    const s = outletStatus({ ...base, openState: { isOpen: false, label: "Closed · opens 9:00 AM", today: null } }, t);
    expect(s).toMatchObject({ kind: "outsideHours", accepting: true, badge: { tone: "warning", label: 'dashboard.closedOpensAt:{"time":"9:00 AM"}' } });
    const noTime = outletStatus({ ...base, openState: { isOpen: false, label: "Closed", today: null } }, t);
    expect(noTime?.badge.label).toBe("dashboard.closedOutsideHours");
  });

  it("is paused when the partner switched it off", () => {
    const s = outletStatus({ ...base, isManuallyClosed: true, openState: { isOpen: false, label: "Closed", today: null } }, t);
    expect(s).toMatchObject({ kind: "paused", accepting: false, badge: { tone: "error" } });
  });

  it("the Adios team's switch wins over everything", () => {
    const s = outletStatus({ ...base, isOpen: false, openState: { isOpen: true, label: "Open now", today: null } }, t);
    expect(s).toMatchObject({ kind: "closedByTeam", accepting: false, badge: { label: "dashboard.closedByTeam" } });
  });

  it("waits for the server after the switch is turned on", () => {
    const s = outletStatus({ ...base, openStatePending: true, openState: { isOpen: false, label: "Closed", today: null } }, t);
    expect(s).toMatchObject({ kind: "pending", accepting: true, badge: { tone: "neutral" } });
  });

  it("shows nothing until the server's open state is known", () => {
    expect(outletStatus(base, t)).toBeNull();
    expect(outletStatus(null, t)).toBeNull();
  });
});
