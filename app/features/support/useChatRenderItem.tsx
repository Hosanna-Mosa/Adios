import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { fadeInUp } from "@/motion/presets";
import { ChatBubbleBody } from "./components/ChatBubbleBody";

// Split out of useChat so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

/** "Today" / "Yesterday" / a plain formatted date — same 3-way split as
 * app/support.tsx's formatRelativeDate, reused here for consistency. Falls
 * back to the device's own locale (no Intl.* call) for the same reason that
 * function avoids it: this Hermes build has no ICU data for locale-aware
 * Intl formatting. */
function formatChatDivider(dateValue: string, t: (key: string) => string): string {
  const d = new Date(dateValue);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return t("app.notifications.today");
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return t("app.support.yesterday");
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

export function useChatRenderItem(tokens: any, accent: any, styles: any, messages: any[]) {
  const { t } = useTranslation();
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isUser = item.sender === "customer";
    // A real day boundary: the item's own date differs from the previous
    // message's date (or it's the very first message). Without a usable date
    // on either side, skip the divider rather than guess.
    const prevDate = index > 0 ? messages[index - 1]?.date : null;
    const showDateDivider = !!item.date && (index === 0 || (!!prevDate && new Date(item.date).toDateString() !== new Date(prevDate).toDateString()));
    return (
      <>
        {showDateDivider && <Text style={styles.dateDivider}>{formatChatDivider(item.date, t)}</Text>}
        <Animated.View entering={fadeInUp(0)} style={[styles.messageRow, isUser ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }]}>
          {!isUser && (
            <View style={styles.partnerAvatarSmall}>
              <Ionicons name="person" size={13} color={tokens.sec} />
            </View>
          )}
          <ChatBubbleBody
            isUser={isUser}
            item={item}
            accent={accent}
            styles={styles}
            tokens={tokens}
          />
        </Animated.View>
      </>
    );
  };

  return { renderItem };
}
