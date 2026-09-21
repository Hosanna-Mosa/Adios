import { useEffect, useState } from "react";

/** Restaurant wait compensation and the helper task clock. */
export function useOrderTimers(status: string | undefined, isHelper: boolean) {
  const [prepTimeRemaining, setPrepTimeRemaining] = useState(180); // 3 mins prep time
  const [waitTimerSeconds, setWaitTimerSeconds] = useState(0);
  const [waitingComp, setWaitingComp] = useState(0);
  const [taskTimerSeconds, setTaskTimerSeconds] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (status === "picking_items") {
      timer = setInterval(() => {
        setPrepTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
        setWaitTimerSeconds((prev) => {
          const next = prev + 1;
          const comp = (next / 60) * 0.5; // ₹0.50 per min waiting fee
          setWaitingComp(Math.round(comp * 100) / 100);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isHelper && status !== "delivered" && status !== "completed") {
      timer = setInterval(() => setTaskTimerSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [status, isHelper]);

  return { prepTimeRemaining, waitTimerSeconds, waitingComp, taskTimerSeconds };
}
