import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type ThemeTokens } from "@/constants/colors";
import { type AddAddressStyles } from "@/features/delivery/add-address.styles";

// Section of AddressFormPaneSaveAs, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  addressLine: any;
  completeAddress: any;
  handleUseCurrentLocation: () => void;
  instructions: any;
  landmark: any;
  receiverName: string;
  receiverPhone: string;
  setAddressLine: React.Dispatch<React.SetStateAction<any>>;
  setCompleteAddress: React.Dispatch<React.SetStateAction<any>>;
  setInstructions: React.Dispatch<React.SetStateAction<any>>;
  setLandmark: React.Dispatch<React.SetStateAction<any>>;
  setReceiverName: React.Dispatch<React.SetStateAction<any>>;
  setReceiverPhone: React.Dispatch<React.SetStateAction<any>>;
  styles: AddAddressStyles;
  tokens: ThemeTokens;
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
  const { t } = useTranslation();
  return (
    <>
    <Animated.View style={styles.section} entering={fadeInUp(180)}>
      <Text style={styles.fieldLabel}>{t("app.delivery.streetAddress")}</Text>
      <View style={styles.fieldRow}>
        <TextInput style={styles.fieldInput} placeholder={t("app.delivery.streetAddress")} placeholderTextColor={tokens.muted} value={addressLine} onChangeText={setAddressLine} />
        <TouchableOpacity onPress={handleUseCurrentLocation}><Ionicons name="locate-outline" size={17} color={tokens.sec} /></TouchableOpacity>
      </View>
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>{t("app.delivery.apartmentSuiteFloorOptional")}</Text>
      <View style={styles.fieldRow}>
        <TextInput style={styles.fieldInput} placeholder={t("app.delivery.apartmentSuiteFloor")} placeholderTextColor={tokens.muted} value={completeAddress} onChangeText={setCompleteAddress} />
      </View>
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>{t("app.delivery.landmarkOptional")}</Text>
      <View style={styles.fieldRow}>
        <TextInput style={styles.fieldInput} placeholder={t("app.delivery.oppositeTheBlueWaterTank")} placeholderTextColor={tokens.muted} value={landmark} onChangeText={setLandmark} />
      </View>
    </Animated.View>

    <Animated.View style={styles.section} entering={fadeInUp(210)}>
      <Text style={styles.sectionLabel}>{t("app.delivery.receiverDetails")}</Text>
      <Text style={styles.fieldLabel}>{t("app.delivery.receiverNameOptional")}</Text>
      <View style={styles.fieldRow}>
        <TextInput style={styles.fieldInput} placeholder={t("app.delivery.whoIsReceivingThisOrder")} placeholderTextColor={tokens.muted} value={receiverName} onChangeText={setReceiverName} />
      </View>
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>{t("app.delivery.receiverPhoneOptional")}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.fieldInput}
          placeholder={t("app.delivery.10digitMobileNumber")}
          placeholderTextColor={tokens.muted}
          keyboardType="phone-pad"
          maxLength={10}
          value={receiverPhone}
          onChangeText={(text) => setReceiverPhone(text.replace(/\D/g, ""))}
        />
      </View>
      <Text style={styles.fieldHint}>{t("app.delivery.leaveTheseBlankToDeliverTo")}</Text>
    </Animated.View>

    <Animated.View style={styles.section} entering={fadeInUp(270)}>
      <Text style={styles.sectionLabel}>{t("app.delivery.deliveryInstructions")}</Text>
      <View style={styles.instructionsBox}>
        <TextInput
          style={styles.instructionsInput}
          placeholder={t("app.delivery.gate2AskTheGuardFor")}
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
