import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Section of AddressFormPaneSaveAs, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  addressLine: any;
  completeAddress: any;
  handleUseCurrentLocation: any;
  instructions: any;
  landmark: any;
  receiverName: any;
  receiverPhone: any;
  setAddressLine: React.Dispatch<React.SetStateAction<any>>;
  setCompleteAddress: React.Dispatch<React.SetStateAction<any>>;
  setInstructions: React.Dispatch<React.SetStateAction<any>>;
  setLandmark: React.Dispatch<React.SetStateAction<any>>;
  setReceiverName: React.Dispatch<React.SetStateAction<any>>;
  setReceiverPhone: React.Dispatch<React.SetStateAction<any>>;
  styles: any;
  tokens: any;
}

export function AddressFormPaneSaveAsStreetAddress({
  addressLine,
  completeAddress,
  handleUseCurrentLocation,
  instructions,
  landmark,
  receiverName,
  receiverPhone,
  setAddressLine,
  setCompleteAddress,
  setInstructions,
  setLandmark,
  setReceiverName,
  setReceiverPhone,
  styles,
  tokens,
}: Props) {
  return (
    <>
    <Animated.View style={styles.section} entering={fadeInUp(180)}>
      <Text style={styles.fieldLabel}>Street address</Text>
      <View style={styles.fieldRow}>
        <TextInput style={styles.fieldInput} placeholder="Street address" placeholderTextColor={tokens.muted} value={addressLine} onChangeText={setAddressLine} />
        <TouchableOpacity onPress={handleUseCurrentLocation}><Ionicons name="locate-outline" size={17} color={tokens.sec} /></TouchableOpacity>
      </View>
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Apartment / suite / floor · optional</Text>
      <View style={styles.fieldRow}>
        <TextInput style={styles.fieldInput} placeholder="Apartment / suite / floor" placeholderTextColor={tokens.muted} value={completeAddress} onChangeText={setCompleteAddress} />
      </View>
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Landmark · optional</Text>
      <View style={styles.fieldRow}>
        <TextInput style={styles.fieldInput} placeholder="Opposite the blue water tank" placeholderTextColor={tokens.muted} value={landmark} onChangeText={setLandmark} />
      </View>
    </Animated.View>

    <Animated.View style={styles.section} entering={fadeInUp(210)}>
      <Text style={styles.sectionLabel}>Receiver details</Text>
      <Text style={styles.fieldLabel}>Receiver name · optional</Text>
      <View style={styles.fieldRow}>
        <TextInput style={styles.fieldInput} placeholder="Who is receiving this order?" placeholderTextColor={tokens.muted} value={receiverName} onChangeText={setReceiverName} />
      </View>
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Receiver phone · optional</Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.fieldInput}
          placeholder="10-digit mobile number"
          placeholderTextColor={tokens.muted}
          keyboardType="phone-pad"
          maxLength={10}
          value={receiverPhone}
          onChangeText={(text) => setReceiverPhone(text.replace(/\D/g, ""))}
        />
      </View>
      <Text style={styles.fieldHint}>Leave these blank to deliver to your own name and number.</Text>
    </Animated.View>

    <Animated.View style={styles.section} entering={fadeInUp(270)}>
      <Text style={styles.sectionLabel}>Delivery instructions</Text>
      <View style={styles.instructionsBox}>
        <TextInput
          style={styles.instructionsInput}
          placeholder="Gate 2, ask the guard for tower B…"
          placeholderTextColor={tokens.muted}
          multiline
          maxLength={200}
          value={instructions}
          onChangeText={setInstructions}
        />
      </View>
      <Text style={styles.charCounter}>{instructions.length} / 200</Text>
    </Animated.View>
    </>
  );
}
