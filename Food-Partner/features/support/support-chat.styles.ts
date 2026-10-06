import { StyleSheet } from "react-native";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/support-chat.tsx — the case cards and chat bubbles from the
// customer app's support-chat.styles.ts. Buttons, inputs, chips, the header,
// the reply bar and the resolve prompt are all components/ui now, so their
// styles are gone from here.
export const createStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
    loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    casesContent: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
    sectionHead: { marginTop: 22, paddingHorizontal: 16 },
    formWrap: { paddingHorizontal: 16 },
    form: { gap: 14 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    formLabel: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    submit: { marginHorizontal: 16, marginTop: 18 },

    caseCard: { borderLeftWidth: 3, padding: 14 },
    caseTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    caseEyebrow: { flex: 1, fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase" },
    caseTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    newReply: { marginTop: 8 },
    caseMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 4 },
    caseActions: { flexDirection: "row", gap: 8, marginTop: 12 },
    flex: { flex: 1 },

    header: { backgroundColor: tokens.surface },
    messages: { flex: 1 },
    messagesList: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: 10 },
    systemRow: { alignItems: "center", marginVertical: 8 },
    systemText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, textTransform: "uppercase", letterSpacing: 1, color: tokens.muted },
    messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
    avatar: { width: 24, height: 24, borderRadius: 8, backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center", marginBottom: 2 },
    bubble: { maxWidth: "78%", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
    bubbleMine: { backgroundColor: accent.accent, borderBottomRightRadius: 4 },
    bubbleTheirs: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderBottomLeftRadius: 4 },
    bubbleText: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium },
    bubbleTime: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, alignSelf: "flex-end", marginTop: 2 },

    resolvedBar: {
      alignItems: "center",
      gap: 8,
      paddingTop: 16,
      paddingHorizontal: 16,
      backgroundColor: tokens.surface,
      borderTopWidth: 1,
      borderTopColor: tokens.border,
    },
    resolvedText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, textAlign: "center" },
    resolvedActions: { flexDirection: "row", gap: 10, alignSelf: "stretch", marginTop: 6 },
    sheetActions: { flexDirection: "row", gap: 10, marginTop: 20, marginBottom: 6 },
  });

export type SupportChatStyles = ReturnType<typeof createStyles>;
