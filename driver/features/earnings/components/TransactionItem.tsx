import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";

interface TransactionItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  amount: string;
  time?: string;
}

export function TransactionItem({ icon, label, amount, time }: TransactionItemProps) {
  const isPositive = amount.startsWith("+");

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name={icon} size={18} color={isPositive ? Colors.primary : Colors.textMuted} />
      </View>
      <View style={styles.details}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {time && <Text style={styles.time}>{time}</Text>}
      </View>
      <Text style={[styles.amount, isPositive && styles.amountPositive]}>
        {amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontWeight: "500",
    fontSize: typography.sizes.medium,
    color: Colors.text,
  },
  time: {
    fontWeight: "400",
    fontSize: typography.sizes.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  amount: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.text,
    marginLeft: 8,
  },
  amountPositive: {
    color: Colors.success,
  },
});
