import React, { forwardRef } from "react";
import {
  Pressable as RNPressable,
  TouchableOpacity as RNTouchableOpacity,
  type GestureResponderEvent,
  type View,
} from "react-native";
import { trackTap } from "@/utils/analytics";

// Drop-in replacements for React Native's TouchableOpacity and Pressable that
// log a `button_tap` analytics event on every press. Files import these instead
// of the react-native ones, so every button in the app is counted without
// touching its JSX.
//
// The event is named after, in order: an explicit `trackName` prop, the
// accessibilityLabel, the testID, or the text rendered inside the button.
// Icon-only buttons with none of those are logged as "(icon button)" with the
// screen they are on.

type TrackProps = {
  /** Overrides the label the tap is logged under. */
  trackName?: string;
};

/** The visible text inside a button, read from its React children. */
function textOf(node: React.ReactNode, depth = 0): string {
  if (node == null || typeof node === "boolean" || depth > 8) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    return node.map((child) => textOf(child, depth + 1)).filter(Boolean).join(" ");
  }
  if (React.isValidElement(node)) {
    const props = node.props as Record<string, unknown>;
    if (typeof props.accessibilityLabel === "string" && props.accessibilityLabel) return props.accessibilityLabel;
    const inner = textOf(props.children as React.ReactNode, depth + 1);
    if (inner) return inner;
    if (typeof props.title === "string") return props.title;
    if (typeof props.label === "string") return props.label;
  }
  return "";
}

function labelOf(props: {
  trackName?: string;
  accessibilityLabel?: string;
  testID?: string;
  children?: unknown;
}): string {
  if (props.trackName) return props.trackName;
  if (props.accessibilityLabel) return props.accessibilityLabel;
  if (props.testID) return props.testID;
  let children = props.children;
  // Pressable also accepts a render function for its children.
  if (typeof children === "function") {
    try {
      children = children({ pressed: false, hovered: false });
    } catch {
      children = null;
    }
  }
  return textOf(children as React.ReactNode) || "(icon button)";
}

function tracked<P extends { onPress?: ((e: GestureResponderEvent) => void) | null; disabled?: boolean | null }>(
  props: P & TrackProps,
) {
  const { onPress } = props;
  if (!onPress || props.disabled) return onPress;
  return (e: GestureResponderEvent) => {
    trackTap(labelOf(props as never));
    onPress(e);
  };
}

export type TouchableOpacityProps = React.ComponentProps<typeof RNTouchableOpacity> & TrackProps;

export const TouchableOpacity = forwardRef<View, TouchableOpacityProps>(function TrackedTouchableOpacity(props, ref) {
  const { trackName: _trackName, ...rest } = props;
  return <RNTouchableOpacity ref={ref} {...rest} onPress={tracked(props) ?? undefined} />;
});

export type PressableProps = React.ComponentProps<typeof RNPressable> & TrackProps;

export const Pressable = forwardRef<View, PressableProps>(function TrackedPressable(props, ref) {
  const { trackName: _trackName, ...rest } = props;
  return <RNPressable ref={ref} {...rest} onPress={tracked(props) ?? undefined} />;
});
