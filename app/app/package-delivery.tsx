import { router } from "expo-router";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { PackageDeliveryHero } from "@/features/package-delivery/components/PackageDeliveryHero";
import { PackageDeliveryPointCard } from "@/features/package-delivery/components/PackageDeliveryPointCard";
import { PackageDeliveryHomeFooter, PackageDeliverySwitchButton } from "@/features/package-delivery/components/PackageDeliveryHomeFooter";
import { usePackageDeliveryHome } from "@/features/package-delivery/usePackageDeliveryHome";

// Package delivery, step 1: where the package is picked up and where it goes.

export default function PackageDeliveryHomeScreen() {
  const {
    tokens, accent, styles, pickup, drop, locating, swap,
    openSearch, editDetails, goToVehicles, showProhibitedItems, showTerms,
  } = usePackageDeliveryHome();

  return (
    <ScreenShell scroll scrollProps={{ contentContainerStyle: styles.scroll, showsVerticalScrollIndicator: false }}>
      <PackageDeliveryHero styles={styles} tokens={tokens} onBack={() => router.back()} />

      <Animated.View style={styles.cards} entering={fadeInUp(120)}>
        <PackageDeliveryPointCard
          kind="pickup"
          point={pickup}
          loading={locating && !pickup}
          styles={styles}
          tokens={tokens}
          accent={accent}
          onSearch={() => openSearch("pickup")}
          onEditDetails={() => editDetails("pickup")}
        />
        <PackageDeliverySwitchButton styles={styles} tokens={tokens} onSwitch={swap} />
        <PackageDeliveryPointCard
          kind="drop"
          point={drop}
          styles={styles}
          tokens={tokens}
          accent={accent}
          onSearch={() => openSearch("drop")}
          onEditDetails={() => editDetails("drop")}
        />
      </Animated.View>

      <PackageDeliveryHomeFooter
        styles={styles}
        canContinue={!!pickup && !!drop}
        onContinue={goToVehicles}
        onProhibited={showProhibitedItems}
        onTerms={showTerms}
      />
    </ScreenShell>
  );
}
