import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import type { ThemeTokens } from "@/constants/colors";
import type { PackageDeliveryHomeStyles } from "../packageDeliveryHome.styles";

// Switch between the two cards, the button on to vehicles once both ends are set, and
// the prohibited-items / terms note.

interface SwitchProps {
  styles: PackageDeliveryHomeStyles;
  tokens: ThemeTokens;
  onSwitch: () => void;
}

export function PackageDeliverySwitchButton({ styles, tokens, onSwitch }: SwitchProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.switchRow}>
      <TouchableOpacity style={styles.switchBtn} onPress={onSwitch} activeOpacity={0.85} accessibilityRole="button">
        <Ionicons name="swap-vertical" size={moderateScale(16)} color={tokens.text} />
        <Text style={styles.switchText}>{t("app.packageDelivery.switch")}</Text>
      </TouchableOpacity>
    </View>
  );
}

interface FooterProps {
  styles: PackageDeliveryHomeStyles;
  canContinue: boolean;
  onContinue: () => void;
  onProhibited: () => void;
  onTerms: () => void;
}

export function PackageDeliveryHomeFooter({ styles, canContinue, onContinue, onProhibited, onTerms }: FooterProps) {
  const { t } = useTranslation();
  return (
    <>
      {canContinue && (
        <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.9} accessibilityRole="button">
          <Text style={styles.continueText}>{t("app.packageDelivery.chooseVehicle")}</Text>
        </TouchableOpacity>
      )}
      <View style={styles.note}>
        <Text style={styles.noteText}>
          {t("app.packageDelivery.readAbout")}{" "}
          <Text style={styles.noteLink} onPress={onProhibited}>{t("app.packageDelivery.prohibitedItems")}</Text>
        </Text>
        <Text style={styles.noteText}>
          {t("app.packageDelivery.byContinuing")}{" "}
          <Text style={styles.noteLink} onPress={onTerms}>{t("app.packageDelivery.terms")}</Text>
        </Text>
      </View>
    </>
  );
}
