import React from "react";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { GpsSimulatorPanel } from "../GpsSimulatorPanel";

/** The GPS simulator panel, pre-wired to the stop this stage travels toward. */
export function SimPanel({
  target,
  idleEta,
  idleDistance,
}: {
  target: any;
  idleEta?: string;
  idleDistance?: string;
}) {
  const { isSimulating, simSpeed, simETA, simRemainingDist, startGPSSimulator } =
    useActiveOrderCtx();

  return (
    <GpsSimulatorPanel
      isSimulating={isSimulating}
      speed={simSpeed}
      eta={simETA}
      remainingDistance={simRemainingDist}
      idleEta={idleEta}
      idleDistance={idleDistance}
      onToggle={() => target && startGPSSimulator(target.lat, target.lng)}
    />
  );
}
