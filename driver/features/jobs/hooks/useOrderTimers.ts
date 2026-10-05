import { useEffect, useState } from "react";

/** The helper task clock. (The restaurant prep countdown and the waiting fee it
 * counted on the phone were removed — neither came from the server.) */
export function useOrderTimers(status: string | undefined, isHelper: boolean) {
  const [taskTimerSeconds, setTaskTimerSeconds] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isHelper && status !== "delivered" && status !== "completed") {
      timer = setInterval(() => setTaskTimerSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [status, isHelper]);

  return { taskTimerSeconds };
}
