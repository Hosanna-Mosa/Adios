import { ScreenShell } from "@/components/ui/ScreenShell";
import { PackageDeliveryDetailsMap } from "@/features/package-delivery/components/PackageDeliveryDetailsMap";
import { PackageDeliveryDetailsSheet } from "@/features/package-delivery/components/PackageDeliveryDetailsSheet";
import { usePackageDeliveryDetails } from "@/features/package-delivery/usePackageDeliveryDetails";

// Package delivery, step 2: flat / building and the contact person at the pickup or drop.

export default function PackageDeliveryDetailsScreen() {
  const details = usePackageDeliveryDetails();
  return (
    <ScreenShell keyboardAvoiding>
      <PackageDeliveryDetailsMap
        kind={details.kind}
        lat={details.place.lat}
        lng={details.place.lng}
        styles={details.styles}
        tokens={details.tokens}
        onBack={details.goBack}
      />
      <PackageDeliveryDetailsSheet details={details} />
    </ScreenShell>
  );
}
