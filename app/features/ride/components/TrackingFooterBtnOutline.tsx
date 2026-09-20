import { Text, TouchableOpacity } from "react-native";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleShareTrip: any;
  styles: any;
}

export function TrackingFooterBtnOutline({
  handleShareTrip,
  styles,
}: Props) {
  return (
    <TouchableOpacity style={styles.footerBtnOutline} onPress={handleShareTrip}>
      <Text style={styles.footerBtnOutlineText}>Share trip</Text>
    </TouchableOpacity>
  );
}
