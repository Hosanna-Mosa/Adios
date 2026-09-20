import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { modalSlideUp } from "@/motion/presets";
import { AddressMapPane } from "./AddressMapPane";

// Moved out of app/delivery/add-address.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  cityOrCountry: any;
  insets: any;
  isResolvingAddress: any;
  latLabel: any;
  lngLabel: any;
  searchInputRef: any;
  setStep: any;
  shortAddress: any;
  styles: any;
}

export function AddAddressBottomCard({
  accent,
  cityOrCountry,
  insets,
  isResolvingAddress,
  latLabel,
  lngLabel,
  searchInputRef,
  setStep,
  shortAddress,
  styles,
}: Props) {
  return (
    <Animated.View style={[styles.bottomCard, { paddingBottom: insets.bottom + 16 }]} entering={modalSlideUp}>
      <View style={styles.sheetHandle} />
      <View style={styles.addressCard}>
        <View style={styles.addressIcon}>
          {isResolvingAddress ? <ActivityIndicator size="small" color={accent.accent} /> : <Ionicons name="location" size={17} color={accent.accent} />}
        </View>
        <AddressMapPane
          cityOrCountry={cityOrCountry}
          isResolvingAddress={isResolvingAddress}
          latLabel={latLabel}
          lngLabel={lngLabel}
          shortAddress={shortAddress}
          styles={styles}
        />
        <TouchableOpacity onPress={() => searchInputRef.current?.focus()}>
          <Text style={styles.changeLink}>Change</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.nextBtn, isResolvingAddress && { opacity: 0.6 }]} onPress={() => setStep(2)} disabled={isResolvingAddress}>
        <Text style={styles.nextBtnText}>Add more address details</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
