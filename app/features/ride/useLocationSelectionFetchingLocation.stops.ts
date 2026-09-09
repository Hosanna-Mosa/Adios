// The stop-selection handler, lifted out to keep the hook under 150 lines.
// A factory over the values it closed over, rebuilt on every render.

export const buildHandleStopSelection = (saveRecentPlace: any, setStops: any) =>
  (id: string, data: any, details: any = null) => {
    const lat = details?.geometry?.location?.lat || data.lat;
    const lng = details?.geometry?.location?.lng || data.lng;
    const addrName = data.description || data.name;
    const placeId = data.place_id || data.id || details?.place_id;
    const placeName = data.structured_formatting?.main_text || data.name || addrName?.split(",")?.[0]?.trim();

    saveRecentPlace({
      id: placeId || addrName,
      name: placeName,
      address: addrName,
      lat,
      lng,
    });

    setStops((prev: any) => prev.map((s: any) => s.id === id ? { ...s, name: addrName, lat, lng } : s));
  };
