import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import * as WebBrowser from "expo-web-browser";
import { type ThemeTokens } from "@/constants/colors";
import { showAlert } from "@/components/ui/AppAlert";
import { getInvoiceLink } from "@/services/orders.service";
import { type OrdersStyles } from "../orders.styles";

/**
 * "View Bill" / "View Receipt" on a delivered / completed order: asks the backend for a
 * short-lived link and opens it in the in-app browser, whose menu can share, print or
 * save it as a PDF.
 */
export function InvoiceAction({ orderId, label, styles, tokens }: { orderId: string; label: string; styles: OrdersStyles; tokens: ThemeTokens }) {
  const { t } = useTranslation();
  const [opening, setOpening] = useState(false);

  const open = async () => {
    setOpening(true);
    try {
      const { url } = await getInvoiceLink(orderId);
      await WebBrowser.openBrowserAsync(url);
    } catch (error: any) {
      showAlert(t("app.orders.invoiceUnavailable"), error?.message || t("app.ride.pleaseTryAgain"), undefined, "error");
    } finally {
      setOpening(false);
    }
  };

  return (
    <TouchableOpacity style={styles.cardAction} onPress={open} disabled={opening} hitSlop={8} accessibilityRole="button">
      {opening ? (
        <ActivityIndicator size="small" color={tokens.brand} />
      ) : (
        <>
          <Ionicons name="document-text-outline" size={moderateScale(16)} color={tokens.brand} />
          <Text style={styles.cardActionText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
