import { Text, TouchableOpacity } from "react-native";

// One outline button for the tracking sheet footer. Replaces the four
// TrackingFooterBtnOutline{,2,3,4} copies, which were the same button with a
// different label, handler and tone.
//
// "danger" reproduces the emergency variant exactly: the error colour was
// applied as an inline override on top of the shared outline styles, so it is
// kept as an override here rather than folded into the stylesheet.

type Tone = "default" | "danger";

interface Props {
  label: string;
  onPress: () => void;
  tone?: Tone;
  /** Theme tokens; only read when tone is "danger". */
  tokens?: { error: string };
  styles: { footerBtnOutline: object; footerBtnOutlineText: object };
}

export function TrackingFooterButton({
  label,
  onPress,
  tone = "default",
  tokens,
  styles,
}: Props) {
  const isDanger = tone === "danger";
  return (
    <TouchableOpacity
      style={isDanger ? [styles.footerBtnOutline, { borderColor: tokens?.error }] : styles.footerBtnOutline}
      onPress={onPress}
    >
      <Text style={isDanger ? [styles.footerBtnOutlineText, { color: tokens?.error }] : styles.footerBtnOutlineText}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
