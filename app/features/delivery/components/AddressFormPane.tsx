import React from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeIn, fadeInUp, staggerListItem } from "@/motion/presets";

import { moderateScale } from "react-native-size-matters";
import { AddressFormPaneSaveAs } from "./AddressFormPaneSaveAs";

// Moved out of app/delivery/add-address.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  PROVIDER_GOOGLE: any;
  PROVIDER_DEFAULT: any;
  MapView: any;
  accent: any;
  addressLine: any;
  completeAddress: any;
  handleSave: any;
  handleUseCurrentLocation: any;
  insets: any;
  instructions: any;
  isEditMode: any;
  isResolvingAddress: any;
  label: any;
  landmark: any;
  latLabel: any;
  lngLabel: any;
  loading: any;
  receiverName: any;
  receiverPhone: any;
  region: any;
  router: any;
  selectedChip: any;
  setAddressLine: React.Dispatch<React.SetStateAction<any>>;
  setCompleteAddress: React.Dispatch<React.SetStateAction<any>>;
  setInstructions: React.Dispatch<React.SetStateAction<any>>;
  setLabel: React.Dispatch<React.SetStateAction<any>>;
  setLandmark: React.Dispatch<React.SetStateAction<any>>;
  setReceiverName: React.Dispatch<React.SetStateAction<any>>;
  setReceiverPhone: React.Dispatch<React.SetStateAction<any>>;
  setSelectedChip: React.Dispatch<React.SetStateAction<any>>;
  setStep: React.Dispatch<React.SetStateAction<any>>;
  shortAddress: any;
  styles: any;
  tokens: any;
}

export function AddressFormPane(props: Props) {
  const { insets, isEditMode, router, styles, tokens } = props;
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[styles.header, { paddingTop: insets.top + 6 }]} entering={fadeIn(0)}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? t("app.delivery.editAddress") : t("app.delivery.addAddress")}</Text>
      </Animated.View>

      <AddressFormPaneSaveAs {...props} />
    </View>
  );
}
