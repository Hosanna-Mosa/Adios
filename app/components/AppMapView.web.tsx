import React, { forwardRef, useImperativeHandle } from "react";
import { View, Text, StyleSheet, type ViewStyle, type StyleProp } from "react-native";

type AppMapViewHandle = { animateToRegion: (region: unknown, duration?: number) => void };

// react-native-maps has no web implementation. Callers only ever call
// animateToRegion() on the ref, so a no-op is enough to keep them from
// crashing when the user is on web.
const AppMapView = forwardRef<AppMapViewHandle, { style?: StyleProp<ViewStyle> }>((props, ref) => {
  useImperativeHandle(ref, () => ({ animateToRegion: () => {} }));

  return (
    <View style={[styles.placeholder, props.style]}>
      <Text style={styles.text}>Map picking isn&apos;t available on web — use the mobile app.</Text>
    </View>
  );
});
AppMapView.displayName = "AppMapView";

const styles = StyleSheet.create({
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#e5e5e5", padding: 24 },
  text: { textAlign: "center", color: "#555" },
});

export default AppMapView;
