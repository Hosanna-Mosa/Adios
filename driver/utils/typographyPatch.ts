import React from "react";
import { StyleSheet } from "react-native";

import { fontFamilies, typography } from "@/constants/typography";

// --- Global font-family routing ---------------------------------------------
// Every <Text> and <TextInput> gets the right family without each style having
// to name one: Familjen Grotesk for heading-sized text, Figtree for the rest,
// matched to the weight the style already asks for.
//
// This file used to do `Component.render = ...`. That silently did nothing on
// every launch: React Native exports Text as `TextImpl`, a plain function
// component with no `.render` property (see
// node_modules/react-native/Libraries/Text/Text.js), so the old guard
// `if (!originalRender) return;` returned on its second line and no text in the
// app ever received a family.
//
// react-native/index.js is a plain object literal of lazy getters, so its `Text`
// and `TextInput` accessors are configurable and can be replaced with ones that
// hand back a wrapped component. Every module that writes
// `import { Text } from "react-native"` reads through that accessor — which is
// why this module must be imported before any component module in the root
// layout.
//
// Sizes are deliberately NOT touched here. Every fontSize in the codebase is
// already a typography token, and the old bucketing compared post-moderateScale
// values against raw-dp thresholds, so on a wide phone it re-mapped correct
// tokens to the wrong size.

// eslint-disable-next-line @typescript-eslint/no-require-imports
const RN: Record<string, any> = require("react-native");

const familyFor = (isHeading: boolean, weight: unknown) => {
  const set = isHeading ? fontFamilies.heading : fontFamilies.body;
  const w = String(weight);
  if (w === "700" || w === "800" || w === "900" || w === "bold") return set.bold;
  if (w === "600") return set.semibold;
  if (w === "500") return set.medium;
  return set.regular;
};

// The threshold is the scaled token, not a raw dp number: a flattened style
// holds moderateScale()d values, so typography.sizes.large is the only
// comparison that means the same thing on every screen width.
const resolveFamily = (style: unknown) => {
  const flat = StyleSheet.flatten(style as never) as Record<string, unknown> | undefined;
  if (!flat) return fontFamilies.body.regular;
  const size = typeof flat.fontSize === "number" ? flat.fontSize : 0;
  return familyFor(size >= typography.sizes.large, flat.fontWeight);
};

const SKIP_STATICS = new Set(["length", "name", "prototype", "$$typeof", "render", "caller", "arguments"]);

const wrap = (key: "Text" | "TextInput") => {
  const descriptor = Object.getOwnPropertyDescriptor(RN, key);
  if (!descriptor || typeof descriptor.get !== "function") return;

  const Base = descriptor.get();
  if (!Base || Base.__typographyWrapped) return;

  const Wrapped: any = React.forwardRef((props: any, ref: unknown) =>
    React.createElement(Base, {
      ...props,
      // The caller's own style comes last, so a style that names a fontFamily
      // explicitly still wins.
      style: [{ fontFamily: resolveFamily(props.style) }, props.style],
      ref,
    }),
  );

  // Carry over statics such as TextInput.State, which callers still reach for.
  for (const name of Object.getOwnPropertyNames(Base)) {
    if (SKIP_STATICS.has(name)) continue;
    const d = Object.getOwnPropertyDescriptor(Base, name);
    if (d) {
      try {
        Object.defineProperty(Wrapped, name, d);
      } catch {
        // A non-configurable static is not worth failing startup over.
      }
    }
  }
  Wrapped.displayName = key;
  Wrapped.__typographyWrapped = true;

  Object.defineProperty(RN, key, {
    configurable: true,
    enumerable: true,
    get: () => Wrapped,
  });
};

wrap("Text");
wrap("TextInput");
