// react-native-maps-directions depends on react-native-maps, which has no web
// implementation. It's non-visual (fetches a route and reports back via
// onReady/onError), so rendering nothing is a safe no-op on web.
export default function MapViewDirections(_props: any) {
  return null;
}
