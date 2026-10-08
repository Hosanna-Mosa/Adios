import { useCallback, useEffect, useRef, useState } from "react";
import type MapView from "react-native-maps";

import { LOCATION_FAST_INTERVAL_MS, syncDriverLocation } from "@/utils/locationSync";
import { calculateBearing, fitMapToCoords, stopCoords, type LatLng } from "../mapFit";

const TOTAL_STEPS = 10;
const TICK_MS = 1500;

type Args = {
  currentOrder: any;
  driverPhone: string | undefined;
  pickupStop: any;
  deliveryStop: any;
  driverLocation: { lat: number; lng: number } | null;
  driverHeading: number;
  setDriverLocation: (loc: { lat: number; lng: number }) => void;
  setDriverHeading: (h: number) => void;
  mapRef: React.RefObject<MapView | null>;
  onArrived: () => void;
};

/** Fakes movement toward a stop so the flow can be walked through off-road. */
export function useGpsSimulator(args: Args) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(0);
  const [simRemainingDist, setSimRemainingDist] = useState(0);
  const [simETA, setSimETA] = useState(0);
  const simInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (simInterval.current) clearInterval(simInterval.current);
  }, []);

  const stopSimulation = useCallback(() => {
    if (simInterval.current) clearInterval(simInterval.current);
    simInterval.current = null;
    setIsSimulating(false);
  }, []);

  const startGPSSimulator = useCallback(
    (targetLat: number, targetLng: number) => {
      const {
        currentOrder, pickupStop, deliveryStop,
        driverLocation, driverHeading, setDriverLocation, setDriverHeading,
        mapRef, onArrived,
      } = args;

      if (simInterval.current) {
        stopSimulation();
        setSimSpeed(0);
        return;
      }

      setIsSimulating(true);
      setSimSpeed(35);
      const initialDistance = parseFloat(currentOrder.distance || "4.2") || 4.2;
      const initialDuration = parseInt(currentOrder.duration || "15") || 15;
      setSimRemainingDist(initialDistance);
      setSimETA(initialDuration);

      // No real GPS fix yet — very likely exactly when this "simulate" feature
      // gets used — used to fall back to a hardcoded Bengaluru point (and `||`
      // would trigger it again even for a genuine 0 coordinate). That made the
      // simulated marker "teleport" in from across the country whenever the
      // order itself was anywhere else. Anchor near the actual target instead,
      // so the simulated route always stays local to this order.
      const startLat = driverLocation?.lat ?? targetLat + 0.015;
      const startLng = driverLocation?.lng ?? targetLng + 0.015;
      const calculatedBearing = calculateBearing(startLat, startLng, targetLat, targetLng);
      setDriverHeading(calculatedBearing);

      let step = 0;
      simInterval.current = setInterval(() => {
        step++;
        const ratio = step / TOTAL_STEPS;
        const curLat = startLat + (targetLat - startLat) * ratio;
        const curLng = startLng + (targetLng - startLng) * ratio;
        setDriverLocation({ lat: curLat, lng: curLng });

        const remainRatio = 1 - ratio;
        setSimRemainingDist(Math.round(initialDistance * remainRatio * 10) / 10);
        setSimETA(Math.round(initialDuration * remainRatio));
        setSimSpeed(Math.floor(30 + Math.random() * 15));

        syncDriverLocation(curLat, curLng, calculatedBearing || driverHeading || 0, {
          minIntervalMs: LOCATION_FAST_INTERVAL_MS,
        });

        const coords: LatLng[] = [{ latitude: curLat, longitude: curLng }];
        const p = stopCoords(pickupStop);
        const d = stopCoords(deliveryStop);
        if (p) coords.push(p);
        if (d) coords.push(d);
        fitMapToCoords(mapRef.current, coords, { lat: curLat, lng: curLng }, 0.015, 1000);

        if (step >= TOTAL_STEPS) {
          stopSimulation();
          setSimSpeed(0);
          setSimRemainingDist(0);
          setSimETA(0);
          onArrived();
        }
      }, TICK_MS);
    },
    [args, stopSimulation],
  );

  return {
    isSimulating, simSpeed, simRemainingDist, simETA,
    startGPSSimulator, stopSimulation, simInterval,
  };
}
