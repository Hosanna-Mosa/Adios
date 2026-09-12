import { useCallback, useEffect, useRef, useState } from "react";
import type MapView from "react-native-maps";

import { socketService } from "@/utils/socketService";
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
        currentOrder, driverPhone, pickupStop, deliveryStop,
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

      const startLat = driverLocation?.lat || 12.9716;
      const startLng = driverLocation?.lng || 77.5946;
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

        socketService.emit("driver_location_update", {
          driverId: driverPhone || "driver-123",
          lat: curLat,
          lng: curLng,
          heading: calculatedBearing || driverHeading || 0,
          orderId: currentOrder.id,
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
