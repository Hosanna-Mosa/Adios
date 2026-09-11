import { View } from "react-native";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/149-store.tsx unchanged. Single-feature for now: promote to
// components/ui/ or components/shared/ if a second feature needs it.

export function DietMarker({ isVeg, color, style }: { isVeg: boolean; color: string; style?: any }) {
  return (
    <View style={[{ width: moderateScale(14), height: moderateScale(14), borderWidth: 1.5, borderColor: color, borderRadius: 3, alignItems: "center", justifyContent: "center" }, style]}>
      {isVeg ? (
        <View style={{ width: moderateScale(6), height: moderateScale(6), borderRadius: 999, backgroundColor: color }} />
      ) : (
        <View
          style={{
            width: 0, height: 0,
            borderLeftWidth: moderateScale(3.5), borderRightWidth: moderateScale(3.5), borderBottomWidth: moderateScale(6),
            borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: color,
          }}
        />
      )}
    </View>
  );
}
