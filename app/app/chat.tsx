import { useMemo } from "react";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { ChatInputBar } from "@/features/support/components/ChatInputBar";
import { ChatQuickRepliesRow } from "@/features/support/components/ChatQuickRepliesRow";
import { ChatAssignRow } from "@/features/support/components/ChatAssignRow";
import { ChatHeader } from "@/features/support/components/ChatHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ChatBody } from "@/features/support/components/ChatBody";
import { useChat } from "@/features/support/useChat";
import type { OrderStatus } from "@/contexts/deliveryStore";
import { ChatSafetyBanner } from "@/features/support/components/ChatSafetyBanner";

export default function ChatScreen() {
  const {
  driver, activeChat, status, insets, tokens, isRide, isHelper, accent, partnerLabel, styles,
  inputText, setInputText, flatListRef, taskAssigned, handleAssignTask, sendMessage, renderItem,
  loadingHistory, refresh, refreshing
  } = useChat();
  const { t } = useTranslation();

  const QUICK_REPLIES = useMemo(() => [
    t("app.quickReplies.onMyWay"),
    t("app.quickReplies.waitingAtPickup"),
    t("app.quickReplies.locationAsPerMap"),
    t("app.quickReplies.messageWhenClose"),
  ], [t]);

  const STATUS_LABEL: Partial<Record<OrderStatus, string>> = useMemo(() => ({
    confirmed: t("app.chat.statusLabel.confirmed"),
    driver_assigned: t("app.chat.statusLabel.driverAssigned"),
    en_route_pickup: t("app.chat.statusLabel.enRoutePickup"),
    arrived_pickup: t("app.chat.statusLabel.arrivedPickup"),
    picking_items: t("app.chat.statusLabel.pickingItems"),
    en_route_delivery: t("app.chat.statusLabel.enRouteDelivery"),
    arrived_delivery: t("app.chat.statusLabel.arrivedDelivery"),
    delivered: t("app.chat.statusLabel.delivered"),
  }), [t]);

  return (
    <ScreenShell keyboardAvoiding>
      <ChatHeader
        Linking={Linking}
        STATUS_LABEL={STATUS_LABEL}
        accent={accent}
        driver={driver}
        insets={insets}
        partnerLabel={partnerLabel}
        status={status}
        styles={styles}
        tokens={tokens}
        onRefresh={refresh}
        refreshing={refreshing}
      />

      <ChatSafetyBanner
        partnerLabel={partnerLabel}
        isHelper={isHelper}
        isRide={isRide}
        styles={styles}
        tokens={tokens}
      />

      <ChatBody
        accent={accent}
        activeChat={activeChat}
        loadingHistory={loadingHistory}
        flatListRef={flatListRef}
        partnerLabel={partnerLabel}
        renderItem={renderItem}
        styles={styles}
        tokens={tokens}
      />

      {isHelper && !taskAssigned && (
        <Animated.View entering={fadeInUp(0)}>
          <ChatAssignRow
            accent={accent}
            handleAssignTask={handleAssignTask}
            styles={styles}
          />
        </Animated.View>
      )}

      <ChatQuickRepliesRow
        QUICK_REPLIES={QUICK_REPLIES}
        sendMessage={sendMessage}
        styles={styles}
      />

      <ChatInputBar
        accent={accent}
        driver={driver}
        inputText={inputText}
        insets={insets}
        partnerLabel={partnerLabel}
        sendMessage={sendMessage}
        setInputText={setInputText}
        styles={styles}
        tokens={tokens}
      />
    </ScreenShell>
  );
}

// QUICK_REPLIES and STATUS_LABEL moved inside ChatScreen() as useMemo values
// so their text can call t() — see
// ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md, Section 11.
