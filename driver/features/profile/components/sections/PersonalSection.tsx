import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Field } from "../../utils/format";
import { modalStyles } from "../../profile-tab.styles";
import { EditField } from "../EditField";
import { ModalActionButton, ModalFormActions } from "../ModalFormActions";
import { SectionFieldRows } from "../SectionFieldRows";
import { GenderPicker } from "./GenderPicker";
import type { GenderOption } from "./GenderPicker";
import { Box } from "@/components/ui/Box";

export interface PersonalValues {
  name: string;
  username: string;
  email: string;
  phone: string;
}

/** The "Personal" section — reads as rows, or as an editable form. */
export function PersonalSection({
  fields,
  isEditing,
  values,
  onChange,
  genders,
  selectedGender,
  onSelectGender,
  isSaving,
  onStartEditing,
  onCancel,
  onSave,
  passwordForm,
}: {
  fields: Field[];
  isEditing: boolean;
  values: PersonalValues;
  onChange: (field: keyof PersonalValues, value: string) => void;
  genders: GenderOption[];
  selectedGender: string | null;
  onSelectGender: (id: string) => void;
  isSaving: boolean;
  onStartEditing: () => void;
  onCancel: () => void;
  onSave: () => void;
  /** Change Password control, shown under Edit Profile while not editing. */
  passwordForm?: React.ReactNode;
}) {
  const { t } = useTranslation();
  if (isEditing) {
    return (
      <Box style={modalStyles.formWrap}>
        <EditField
          label={t("profile.name")}
          value={values.name}
          onChangeText={(t) => onChange("name", t)}
          icon="user"
          placeholder={t("profile.yourName")}
        />
        <EditField
          label={t("profile.username")}
          value={values.username}
          onChangeText={(t) => onChange("username", t)}
          icon="at-sign"
          placeholder={t("profile.usernamePlaceholder")}
          autoCapitalize="none"
        />
        <EditField
          label={t("profile.email")}
          value={values.email}
          onChangeText={(t) => onChange("email", t)}
          icon="mail"
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <EditField
          label={t("profile.phone")}
          value={values.phone}
          onChangeText={(t) => onChange("phone", t)}
          icon="phone"
          placeholder={t("profile.phoneNumber")}
          keyboardType="phone-pad"
        />

        <GenderPicker options={genders} selected={selectedGender} onSelect={onSelectGender} />

        <ModalFormActions
          onCancel={onCancel}
          onConfirm={onSave}
          confirmLabel={t("profile.saveChanges")}
          busyLabel={t("profile.saving")}
          busy={isSaving}
        />
      </Box>
    );
  }

  return (
    <Box>
      <SectionFieldRows fields={fields} />
      <ModalActionButton
        icon={<Feather name="edit-2" size={15} color={Colors.primary} />}
        label={t("profile.editProfile")}
        onPress={onStartEditing}
      />
      {passwordForm}
    </Box>
  );
}
