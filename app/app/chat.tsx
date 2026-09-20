import { Linking } from "react-native";
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
  inputText, setInputText, flatListRef, taskAssigned, handleAssignTask, sendMessage, renderItem
  } = useChat();

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
      />

      <ChatSafetyBanner
        partnerLabel={partnerLabel}
        isHelper={isHelper}
        isRide={isRide}
        styles={styles}
        tokens={tokens}
      />

      <ChatBody
        activeChat={activeChat}
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

const QUICK_REPLIES = ["On my way", "Waiting at pickup", "My location is as per map", "Message when you're close"];

const STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  confirmed: "Order confirmed",
  driver_assigned: "Assigned to you",
  en_route_pickup: "Heading to pickup",
  arrived_pickup: "Arrived at pickup",
  picking_items: "Picking your order",
  en_route_delivery: "On the way",
  arrived_delivery: "Arrived",
  delivered: "Completed",
};
