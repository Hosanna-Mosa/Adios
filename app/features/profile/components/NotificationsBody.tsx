import { FlatList } from "react-native";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { NotificationsRow } from "./NotificationsRow";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type NotificationsStyles } from "@/features/profile/notifications.styles";

// Moved out of app/notifications.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  formatWhen: any;
  CATEGORY_ICON: any;
  accent: ServiceTokens;
  handleOpen: any;
  insets: EdgeInsets;
  items: any;
  styles: NotificationsStyles;
  tokens: ThemeTokens;
}

export function NotificationsBody({
  formatWhen,
  CATEGORY_ICON,
  accent,
  handleOpen,
  insets,
  items,
  styles,
  tokens,
}: Props) {
  return (
    <>
    <FlatList
      data={items}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 24, gap: 10 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <Animated.View entering={staggerListItem(index)}>
          <NotificationsRow
            CATEGORY_ICON={CATEGORY_ICON}
            formatWhen={formatWhen}
            item={item}
            accent={accent}
            handleOpen={handleOpen}
            styles={styles}
            tokens={tokens}
          />
        </Animated.View>
      )}
    />
    </>
  );
}
