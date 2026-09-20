import { Text, TouchableOpacity } from "react-native";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleSOS: any;
  styles: any;
  tokens: any;
}

export function TrackingFooterBtnOutline2({
  handleSOS,
  styles,
  tokens,
}: Props) {
  return (
    <TouchableOpacity style={[styles.footerBtnOutline, { borderColor: tokens.error }]} onPress={handleSOS}>
      <Text style={[styles.footerBtnOutlineText, { color: tokens.error }]}>Emergency</Text>
    </TouchableOpacity>
  );
}
