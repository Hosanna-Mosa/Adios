import { StyleSheet, Text, TextInput } from "react-native";
import { fontFamilies, typography } from "@/constants/typography";

// --- Global Typography Patch ---
// Sizes are NOT touched here any more: every fontSize in the codebase is one of
// the four tokens in constants/typography.ts, so there is nothing left to snap.
// (The old version bucketed already-scaled numbers, which made the same
// declaration render at different sizes depending on screen width.)
//
// What remains is the font-family pairing: static font files mean each weight is
// its own family, so the family has to be derived from the weight at render time.
const patchComponentStyle = (Component: any) => {
  const originalRender = Component.render;
  if (!originalRender) return;

  // Picks the weight-matched family variant for a text role — heading sizes get
  // Familjen Grotesk, everything else Figtree, per constants/typography.ts.
  const familyFor = (isHeading: boolean, weight: any) => {
    const set = isHeading ? fontFamilies.heading : fontFamilies.body;
    if (weight === "800" || weight === "900" || weight === "bold" || weight === "700") return set.bold;
    if (weight === "600") return set.semibold;
    if (weight === "500") return set.medium;
    return set.regular;
  };

  Component.render = function (props: any, ref: any) {
    if (props && props.style) {
      const flat = StyleSheet.flatten(props.style);
      const updated = { ...flat };

      // "Heading" is an identity check against the very token the style used, so
      // it gives the same answer on every device width — no thresholds involved.
      const isHeading =
        flat.fontSize === typography.sizes.large || flat.fontSize === typography.sizes.extraLarge;

      // Keep the weights the old buckets forced, so headings look unchanged:
      // extraLarge was heading1 (600), large was heading2 (700).
      if (flat.fontSize === typography.sizes.extraLarge) {
        if (flat.fontWeight === undefined || flat.fontWeight === "700" || flat.fontWeight === "800" || flat.fontWeight === "900" || flat.fontWeight === "bold") {
          updated.fontWeight = "600";
        }
      } else if (flat.fontSize === typography.sizes.large) {
        if (flat.fontWeight === undefined || flat.fontWeight === "700" || flat.fontWeight === "800" || flat.fontWeight === "bold") {
          updated.fontWeight = "700";
        }
      }

      updated.fontFamily = familyFor(isHeading, updated.fontWeight ?? flat.fontWeight);

      props = {
        ...props,
        style: updated,
      };
    } else {
      // No style at all: default to regular Figtree (body is the common case).
      props = {
        ...props,
        style: { fontFamily: fontFamilies.body.regular },
      };
    }
    return originalRender.call(this, props, ref);
  };
};

patchComponentStyle(Text);
patchComponentStyle(TextInput);
// -------------------------------
