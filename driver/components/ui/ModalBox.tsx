import React from "react";
import { Modal, ModalProps } from "react-native";

/** Transparent `Modal`.
 *
 * Distinct from `components/shared/AppModal`, which is the *styled* dialog with
 * a backdrop and card. This adds nothing, so screens that build their own
 * overlay chrome migrate without inheriting that look.
 */
export function ModalBox(props: ModalProps) {
  return <Modal {...props} />;
}
