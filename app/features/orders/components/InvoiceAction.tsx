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
 * "Invoice" on a delivered / completed order: asks the backend for a short-lived link
 * and opens it in the in-app browser, whose menu can share, print or save it as a PDF.
 * (The backend already generated invoices; the app never offered them.)
 */
export function InvoiceAction({ orderId, styles, tokens }: { orderId: string; styles: OrdersStyles; tokens: ThemeTokens }) {
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
    <TouchableOpacity style={styles.rowAction} onPress={open} disabled={opening} hitSlop={8} accessibilityRole="button">
      {opening ? (
        <ActivityIndicator size="small" color={tokens.sec} />
      ) : (
        <>
          <Ionicons name="document-text-outline" size={moderateScale(14)} color={tokens.sec} />
          <Text style={styles.rowActionText}>{t("app.orders.invoice")}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
