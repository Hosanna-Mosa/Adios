import React from "react";
import { KeyboardAvoidingView, KeyboardAvoidingViewProps } from "react-native";

/** Transparent `KeyboardAvoidingView`. `behavior` is deliberately not defaulted:
 *  it differs per platform per screen, and a default would change layout. */
export function KeyboardView(props: KeyboardAvoidingViewProps) {
  return <KeyboardAvoidingView {...props} />;
}
