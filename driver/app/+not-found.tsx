import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { typography } from "@/constants/typography";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <Box style={styles.container}>
        <AppText style={styles.title}>This screen doesn&apos;t exist.</AppText>

        <Link href="/" style={styles.link}>
          <AppText style={styles.linkText}>Go to home screen!</AppText>
        </Link>
      </Box>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: typography.sizes.large,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: typography.sizes.medium,
    color: "#2e78b7",
  },
});
