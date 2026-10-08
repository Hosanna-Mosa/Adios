import { ScreenShell } from "@/components/ui/ScreenShell";
import { PackageDeliveryRouteMap } from "@/features/package-delivery/components/PackageDeliveryRouteMap";
import { PackageDeliveryConfirmTopBar } from "@/features/package-delivery/components/PackageDeliveryConfirmTopBar";
import { PackageDeliveryConfirmSheet } from "@/features/package-delivery/components/PackageDeliveryConfirmSheet";
import { usePackageDeliveryConfirm } from "@/features/package-delivery/usePackageDeliveryConfirm";

// Package delivery, step 3: pick Bike or Auto, choose how and where to pay, and book. Booking
// hands over to the ride screens (finding-driver, then tracking).

export default function PackageDeliveryConfirmScreen() {
  const confirm = usePackageDeliveryConfirm();
  const { pickup, drop, insets, tokens, styles } = confirm;
  if (!pickup || !drop) return null;

  return (
    <ScreenShell>
      <PackageDeliveryRouteMap
        pickup={pickup}
        drop={drop}
        route={confirm.route}
        drivers={confirm.drivers}
        vehicle={confirm.vehicle}
        topInset={insets.top + 90}
        bottomInset={confirm.sheetHeight + 40}
        tokens={tokens}
        fitKey={confirm.fitKey}
      />
      <PackageDeliveryConfirmTopBar
        pickup={pickup}
        drop={drop}
        bottomOffset={confirm.sheetHeight}
        styles={styles}
        tokens={tokens}
        onBack={confirm.editRoute}
        onRecenter={confirm.recenter}
      />
      <PackageDeliveryConfirmSheet confirm={confirm} />
    </ScreenShell>
  );
}
