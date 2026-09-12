import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Field } from "../../utils/format";
import { modalStyles } from "../../profile-tab.styles";
import { ModalActionButton } from "../ModalFormActions";
import { SectionFieldRows } from "../SectionFieldRows";
import { Box } from "@/components/ui/Box";

/** Documents on file, plus shortcuts to add the ones that are missing. */
export function DocumentsSection({
  fields,
  hasPan,
  hasLicense,
  onAddPan,
  onAddLicense,
}: {
  fields: Field[];
  hasPan: boolean;
  hasLicense: boolean;
  onAddPan: () => void;
  onAddLicense: () => void;
}) {
  const showActions = !hasPan || !hasLicense;

  return (
    <Box>
      <SectionFieldRows fields={fields} />
      {showActions && (
        <Box style={modalStyles.docActions}>
          {!hasPan && (
            <ModalActionButton
              icon={<Feather name="plus-circle" size={16} color={Colors.primary} />}
              label="Add PAN Card"
              onPress={onAddPan}
            />
          )}
          {!hasLicense && (
            <ModalActionButton
              icon={<Feather name="plus-circle" size={16} color={Colors.primary} />}
              label="Add Driving License"
              onPress={onAddLicense}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
