import { View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { Skeleton } from "@/components/ui/Skeleton";
import { type OffersStyles } from "../offers.styles";

// Placeholder cards shaped like OfferRestaurantCard while GET /offers loads.

export function OffersSkeleton({ styles }: { styles: OffersStyles }) {
  return (
    <View style={styles.listContent}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.vendorRow}>
            <Skeleton width={moderateScale(64)} height={moderateScale(64)} radius={moderateScale(12)} />
            <View style={styles.vendorInfo}>
              <Skeleton width="65%" height={moderateScale(16)} />
              <Skeleton width="40%" height={moderateScale(12)} />
            </View>
          </View>
          <View style={styles.offerRow}>
            <Skeleton width="80%" height={moderateScale(14)} />
            <Skeleton width="50%" height={moderateScale(12)} />
          </View>
        </View>
      ))}
    </View>
  );
}
