import React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { Loader } from "@/components/ui/Loader";
import { PressBox } from "@/components/ui/PressBox";

interface CashOutButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function CashOutButton({ onPress, disabled = false, isLoading = false }: CashOutButtonProps) {
  return (
    <PressBox
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      <Box style={styles.iconContainer}>
        <Feather name="dollar-sign" size={18} color={Colors.white} />
      </Box>
      <AppText style={styles.text}>Cash Out</AppText>
      {isLoading ? (
        <Loader size="small" color={Colors.white} />
      ) : (
        <Feather name="chevron-right" size={20} color={Colors.white} />
      )}
    </PressBox>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  text: {
    fontWeight: "600",
    fontSize: typography.sizes.large,
    color: Colors.white,
    flex: 1,
  },
});
