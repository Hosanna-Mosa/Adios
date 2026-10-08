import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, type KeyboardTypeOptions } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import type { ThemeTokens } from "@/constants/colors";
import type { PackageDeliveryPointKind } from "@/contexts/packageDeliveryStore";
import type { PackageDeliveryDetailsStyles } from "../packageDeliveryDetails.styles";
import { firstLine } from "../packageDelivery.utils";

// The chosen address, the flat / building field, and who to contact at this end.

interface FieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  placeholder: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  styles: PackageDeliveryDetailsStyles;
  tokens: ThemeTokens;
  onChange: (text: string) => void;
}

export function PackageDeliveryField({ icon, value, placeholder, error, keyboardType, maxLength, styles, tokens, onChange }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <View style={[styles.field, focused && styles.fieldFocused, !!error && styles.fieldError]}>
        <Ionicons name={icon} size={moderateScale(18)} color={tokens.sec} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={tokens.muted}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

interface Props {
  kind: PackageDeliveryPointKind;
  address: string;
  houseNo: string;
  name: string;
  phone: string;
  useMine: boolean;
  hasMyContact: boolean;
  nameError: string;
  phoneError: string;
  styles: PackageDeliveryDetailsStyles;
  tokens: ThemeTokens;
  onHouseNo: (text: string) => void;
  onName: (text: string) => void;
  onPhone: (text: string) => void;
  onToggleMine: () => void;
  onChangeAddress: () => void;
}

export function PackageDeliveryContactForm(props: Props) {
  const { kind, address, houseNo, name, phone, useMine, hasMyContact, nameError, phoneError, styles, tokens } = props;
  const { t } = useTranslation();
  const fieldTheme = { styles, tokens };
  return (
    <>
      <View style={styles.addressRow}>
        <View style={[styles.addressDot, { backgroundColor: kind === "pickup" ? tokens.success : tokens.error }]} />
        <View style={styles.addressBody}>
          <Text style={styles.addressTitle} numberOfLines={1}>{firstLine(address)}</Text>
          <Text style={styles.addressSub} numberOfLines={2}>{address}</Text>
        </View>
        <TouchableOpacity onPress={props.onChangeAddress} accessibilityRole="button">
          <Text style={styles.changeLink}>{t("app.packageDelivery.change")}</Text>
        </TouchableOpacity>
      </View>

      <PackageDeliveryField {...fieldTheme} icon="home-outline" value={houseNo} placeholder={t("app.packageDelivery.houseNo")} onChange={props.onHouseNo} />

      <Text style={styles.sectionLabel}>{kind === "pickup" ? t("app.packageDelivery.senderDetails") : t("app.packageDelivery.receiverDetails")}</Text>
      <PackageDeliveryField {...fieldTheme} icon="person-outline" value={name} placeholder={t("app.packageDelivery.name")} error={nameError} onChange={props.onName} />

      {hasMyContact && (
        <TouchableOpacity style={styles.checkRow} onPress={props.onToggleMine} activeOpacity={0.7} accessibilityRole="checkbox" accessibilityState={{ checked: useMine }}>
          <View style={[styles.checkBox, useMine && styles.checkBoxOn]}>
            {useMine && <Ionicons name="checkmark" size={moderateScale(15)} color={tokens.surface} />}
          </View>
          <Text style={styles.checkText}>{t("app.packageDelivery.useMyContact")}</Text>
        </TouchableOpacity>
      )}

      <PackageDeliveryField
        {...fieldTheme}
        icon="call-outline"
        value={phone}
        placeholder={t("app.packageDelivery.phone")}
        error={phoneError}
        keyboardType="number-pad"
        maxLength={10}
        onChange={props.onPhone}
      />
    </>
  );
}
