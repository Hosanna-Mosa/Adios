import React from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Field } from "../../utils/format";
import { modalStyles } from "../../profile-tab.styles";
import { EditField } from "../EditField";
import { ModalActionButton, ModalFormActions } from "../ModalFormActions";
import { SectionFieldRows } from "../SectionFieldRows";
import { GenderPicker } from "./GenderPicker";
import type { GenderOption } from "./GenderPicker";

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
}) {
  if (isEditing) {
    return (
      <View style={modalStyles.formWrap}>
        <EditField
          label="Name"
          value={values.name}
          onChangeText={(t) => onChange("name", t)}
          icon="user"
          placeholder="Your name"
        />
        <EditField
          label="Username"
          value={values.username}
          onChangeText={(t) => onChange("username", t)}
          icon="at-sign"
          placeholder="username"
          autoCapitalize="none"
        />
        <EditField
          label="Email"
          value={values.email}
          onChangeText={(t) => onChange("email", t)}
          icon="mail"
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <EditField
          label="Phone"
          value={values.phone}
          onChangeText={(t) => onChange("phone", t)}
          icon="phone"
          placeholder="Phone number"
          keyboardType="phone-pad"
        />

        <GenderPicker options={genders} selected={selectedGender} onSelect={onSelectGender} />

        <ModalFormActions
          onCancel={onCancel}
          onConfirm={onSave}
          confirmLabel="Save Changes"
          busyLabel="Saving..."
          busy={isSaving}
        />
      </View>
    );
  }

  return (
    <View>
      <SectionFieldRows fields={fields} />
      <ModalActionButton
        icon={<Feather name="edit-2" size={15} color={Colors.primary} />}
        label="Edit Profile"
        onPress={onStartEditing}
      />
    </View>
  );
}
