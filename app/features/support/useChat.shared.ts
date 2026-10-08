import { FlatList, StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Module-level values shared by the parts of useChat.

export const RIDE_TYPES = ["bike", "auto", "cab", "cab_prime"];

/** One stored ChatMessage document as the chat list renders it. `id` is the
 * sender's clientId when there was one, so history lines up with optimistic sends. */
export const toChatMessage = (m: any) => ({
  id: String(m.id || m.clientId || m._id),
  text: m.text,
  sender: (m.role === "driver" || m.from === "driver" ? "driver" : "customer") as "driver" | "customer",
  timestamp: m.time,
});

/** `incoming` appended to `current`, skipping ids already shown. */
export const mergeChatMessages = <T extends { id: string }>(current: T[], incoming: T[]) => {
  const seen = new Set(current.map((m) => m.id));
  const added = incoming.filter((m) => !seen.has(m.id));
  return { merged: added.length ? [...current, ...added] : current, added };
};

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({
    header: {
      flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 12,
      backgroundColor: tokens.surface, borderBottomWidth: 1, borderBottomColor: tokens.border,
    },
    backBtn: { width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19), backgroundColor: tokens.bg, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    headerAvatar: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20), backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    headerName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    headerStatus: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, marginTop: 2 },
    callBtn: { width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19), alignItems: "center", justifyContent: "center" },

    safetyBanner: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: tokens.warningSkin, marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 12 },
    safetyText: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec },

    // Without an explicit flex the FlatList sizes to its own content instead
    // of the space left between the safety banner and the quick-reply row —
    // as messages accumulate it pushes the chips and composer off-screen.
    messagesFlatList: { flex: 1 },
    messagesList: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    dateDivider: { textAlign: "center", fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginBottom: 12 },
    messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 10 },
    partnerAvatarSmall: { width: moderateScale(24), height: moderateScale(24), borderRadius: moderateScale(12), backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center", marginBottom: 2 },
    bubble: { maxWidth: "78%", borderRadius: 16, paddingHorizontal: 13, paddingVertical: 11, gap: 5 },
    bubbleText: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium },
    bubbleTime: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small },

    emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 10 },
    emptyStateText: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec, textAlign: "center", paddingHorizontal: 40 },

    assignRow: { flexDirection: "row", alignItems: "center", gap: 11, marginHorizontal: 16, marginTop: 8, borderWidth: 1, borderRadius: 12, padding: 11, minHeight: 48 },
    assignIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
    assignText: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    assignSend: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.8 },

    quickRepliesRow: { flexGrow: 0, flexShrink: 0, marginTop: 10 },
    quickReplyChip: { borderWidth: 1, borderColor: tokens.borderStrong, backgroundColor: tokens.surface, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, minHeight: 36, justifyContent: "center" },
    quickReplyChipText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },

    inputBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: tokens.surface, borderTopWidth: 1, borderTopColor: tokens.border, marginTop: 10 },
    inputContainer: { flex: 1, backgroundColor: tokens.bg, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 22, minHeight: moderateScale(44), maxHeight: 100, paddingHorizontal: 16, justifyContent: "center" },
    textInput: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.text, paddingVertical: 10 },
    sendBtn: { width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(22), alignItems: "center", justifyContent: "center" },
  });

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type ChatStyles = ReturnType<typeof createStyles>;
