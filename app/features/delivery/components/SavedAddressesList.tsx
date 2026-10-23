import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type SavedAddressesStyles } from "@/features/delivery/saved-addresses.styles";

// Moved out of app/delivery/saved-addresses.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

// Edit/delete are their own icon buttons on the row (matching the driver app's pattern)
// instead of a single "⋯" that opened an options popup first.

interface Props {
  accent: ServiceTokens;
  addresses: any[];
  deletingId: any;
  handleEditAddress: any;
  handleDeleteAddress: any;
  handleSelectAddress: any;
  loading: boolean;
  parseInstructions: any;
  selectingId: any;
  stripMeta: any;
  styles: SavedAddressesStyles;
  tokens: ThemeTokens;
}

export function SavedAddressesList({
  accent,
  addresses,
  deletingId,
  handleEditAddress,
  handleDeleteAddress,
  handleSelectAddress,
  loading,
  parseInstructions,
  selectingId,
  stripMeta,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.delivery.saved")}</Text>
      {loading && addresses.length === 0 ? (
        <ActivityIndicator color={accent.accent} style={{ paddingVertical: 20 }} />
      ) : (
        <View style={styles.card}>
          {addresses.map((addr, idx) => {
            const isSelecting = selectingId === addr._id;
            const isDeleting = deletingId === addr._id;
            const instructions = parseInstructions(addr.addressLine);
            const contact = [addr.receiverName, addr.receiverPhone].filter(Boolean).join(" · ");
            return (
              <Animated.View key={addr._id} entering={staggerListItem(idx)}>
              <TouchableOpacity
                style={[styles.addressRow, idx < addresses.length - 1 && styles.addressRowDivider, isSelecting && { opacity: 0.6 }]}
                onPress={() => handleSelectAddress(addr)}
                disabled={selectingId !== null}
              >
                <View style={[styles.avatar, addr.label === "Home" && { backgroundColor: accent.skin }]}>
                  {isSelecting ? <ActivityIndicator size="small" color={accent.accent} /> : <Text style={[styles.avatarText, addr.label === "Home" && { color: accent.accent }]}>{(addr.label || "?")[0].toUpperCase()}</Text>}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.addrLabel} numberOfLines={1}>{addr.label}</Text>
                  <Text style={styles.addrLine} numberOfLines={1}>{stripMeta(addr.addressLine)}</Text>
                  {!!addr.landmark && <Text style={styles.addrInstructions} numberOfLines={1}>{t("app.delivery.near")} {addr.landmark}</Text>}
                  {instructions && <Text style={styles.addrInstructions} numberOfLines={1}>{instructions}</Text>}
                  {!!contact && <Text style={styles.addrContact} numberOfLines={1}>{contact}</Text>}
                </View>
                {isDeleting ? (
                  <ActivityIndicator size="small" color={tokens.error} style={{ width: moderateScale(32), height: moderateScale(32) }} />
                ) : (
                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      style={[styles.rowActionBtn, styles.rowActionBtnEdit]}
                      onPress={() => handleEditAddress(addr)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      disabled={selectingId !== null || deletingId !== null}
                      accessibilityRole="button"
                      accessibilityLabel={`${t("app.delivery.editWord")} ${addr.label}`}
                    >
                      <Ionicons name="pencil" size={moderateScale(15)} color={accent.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rowActionBtn, styles.rowActionBtnDelete]}
                      onPress={() => handleDeleteAddress(addr._id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      disabled={selectingId !== null || deletingId !== null}
                      accessibilityRole="button"
                      accessibilityLabel={`${t("app.delivery.deleteWord")} ${addr.label}`}
                    >
                      <Ionicons name="trash-outline" size={moderateScale(15)} color={tokens.error} />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}
    </View>
  );
}
