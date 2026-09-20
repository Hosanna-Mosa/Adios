import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** Merged from the part files that used to sit beside this one: they were
 *  split only to satisfy a 150-line cap, and re-spread here at runtime. */
export const styles = StyleSheet.create({

  root: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    backgroundColor: Colors.surface,
    gap: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    borderWidth: 1.5,
    borderColor: Colors.white,
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  headerName: {
    fontSize: typography.sizes.medium,
    fontWeight: "700",
  },
  headerStatus: {
    fontSize: typography.sizes.small,
    color: Colors.success,
    fontWeight: "600",
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  label: {
    fontSize: typography.sizes.medium,
    fontWeight: "700",
    marginBottom: 8,
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  pickerButton: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: typography.sizes.medium,
    fontWeight: "500",
  },
  textArea: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: typography.sizes.medium,
    fontWeight: "500",
  },
  submitBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: "800",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: typography.sizes.small,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowAgent: {
    justifyContent: "flex-start",
  },

  avatar: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleAgent: {
    borderBottomLeftRadius: 4,
  },
  bubbleTextUser: {
    fontSize: typography.sizes.medium,
    color: Colors.white,
    fontWeight: "500",
    lineHeight: typography.lineHeights.medium,
  },
  bubbleTextAgent: {
    fontSize: typography.sizes.medium,
    fontWeight: "500",
    lineHeight: typography.lineHeights.medium,
  },
  timeUser: {
    fontSize: typography.sizes.small,
    color: "rgba(255,255,255,0.7)",
    alignSelf: "flex-end",
  },
  timeAgent: {
    fontSize: typography.sizes.small,
    alignSelf: "flex-end",
  },

  resolvedNotice: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 10,
  },
  resolvedText: {
    fontSize: typography.sizes.medium,
    fontWeight: "600",
    textAlign: "center",
  },
  reopenBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  reopenBtnText: {
    fontSize: typography.sizes.medium,
    fontWeight: "700",
  },
  resolveRequestContainer: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
  },
  resolveRequestTitle: {
    fontSize: typography.sizes.large,
    fontWeight: "bold",
    marginTop: 8,
  },
  resolveRequestDesc: {
    fontSize: typography.sizes.medium,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  resolveRequestButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    paddingHorizontal: 16,
  },
  resolveBtnConfirm: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  resolveBtnTextConfirm: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: typography.sizes.medium,
  },
  resolveBtnDecline: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  resolveBtnTextDecline: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
  },
});
