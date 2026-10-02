import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.sizes.medium,
    color: Colors.textSecondary,
  },
  errorText: {
    marginTop: 12,
    fontSize: typography.sizes.large,
    color: Colors.error,
    textAlign: "center",
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.brand,
    borderRadius: 24,
  },
  backButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: typography.sizes.medium,
  },
  headerOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  roundBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.large,
    fontWeight: "700",
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: typography.sizes.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
