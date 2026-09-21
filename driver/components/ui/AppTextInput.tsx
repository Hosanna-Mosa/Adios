import React from "react";
import { TextInput, TextInputProps } from "react-native";

/** Transparent `TextInput`.
 *
 * Distinct from `TextField`, which is the *styled* field with a label, error
 * text and border. This one adds nothing, so screens that build their own input
 * chrome can migrate without inheriting `TextField`'s look.
 */
export const AppTextInput = React.forwardRef<TextInput, TextInputProps>(
  function AppTextInput(props, ref) {
    return <TextInput ref={ref} {...props} />;
  },
);
