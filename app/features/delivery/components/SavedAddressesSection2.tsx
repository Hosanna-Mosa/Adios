import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";

// Moved out of app/delivery/saved-addresses.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  addresses: any[];
  deletingId: any;
  handleMoreOptions: any;
  handleSelectAddress: any;
  loading: any;
  parseInstructions: any;
  selectingId: any;
  stripMeta: any;
  styles: any;
  tokens: any;
}

export function SavedAddressesSection2({
  accent,
  addresses,
  deletingId,
  handleMoreOptions,
  handleSelectAddress,
  loading,
  parseInstructions,
  selectingId,
  stripMeta,
  styles,
  tokens,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Saved</Text>
      {loading && addresses.length === 0 ? (
        <ActivityIndicator color={accent.accent} style={{ paddingVertical: 20 }} />
      ) : (
        <View style={styles.card}>
          {addresses.map((addr, idx) => {
            const isSelecting = selectingId === addr._id;
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
                  <Text style={styles.addrLabel}>{addr.label}</Text>
                  <Text style={styles.addrLine} numberOfLines={1}>{stripMeta(addr.addressLine)}</Text>
                  {!!addr.landmark && <Text style={styles.addrInstructions} numberOfLines={1}>Near {addr.landmark}</Text>}
                  {instructions && <Text style={styles.addrInstructions} numberOfLines={1}>{instructions}</Text>}
                  {!!contact && <Text style={styles.addrContact} numberOfLines={1}>{contact}</Text>}
                </View>
                <TouchableOpacity onPress={() => handleMoreOptions(addr)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} disabled={selectingId !== null || deletingId !== null}>
                  {deletingId === addr._id ? <ActivityIndicator size="small" color={tokens.error} /> : <Ionicons name="ellipsis-horizontal" size={18} color={tokens.muted} />}
                </TouchableOpacity>
              </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}
    </View>
  );
}
