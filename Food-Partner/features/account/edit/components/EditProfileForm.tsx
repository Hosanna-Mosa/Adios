import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import type { ThemeTokens } from "@/constants/colors";
import { sanitizeInteger } from "@/utils/number";
import type { EditProfileStyles } from "../editProfile.styles";
import type { ProfileErrors, ProfileForm } from "../useEditProfile";
import { LocationField } from "./LocationField";

interface Props {
  form: ProfileForm;
  update: <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => void;
  errors: ProfileErrors;
  locating: boolean;
  onCaptureLocation: () => void;
  onRemoveLocation: () => void;
  styles: EditProfileStyles;
  tokens: ThemeTokens;
}

/** The outlet's name and contact details, then where it is: address, branch code and current location. */
export function EditProfileForm({ form, update, errors, locating, onCaptureLocation, onRemoveLocation, styles, tokens }: Props) {
  const { t } = useTranslation();
  const icon = (name: keyof typeof Ionicons.glyphMap) => <Ionicons name={name} size={18} color={tokens.muted} />;
  return (
    <>
      <Card bordered elevationLevel="none" style={styles.card}>
        <TextField
          label={t("editProfile.name")}
          placeholder={t("editProfile.namePlaceholder")}
          value={form.name}
          onChangeText={(v) => update("name", v)}
          error={errors.name}
          maxLength={80}
          icon={icon("storefront-outline")}
        />
        <TextField
          label={t("editProfile.phone")}
          placeholder="9876543210"
          value={form.phone}
          onChangeText={(v) => update("phone", sanitizeInteger(v).slice(0, 10))}
          error={errors.phone}
          keyboardType="phone-pad"
          maxLength={10}
          icon={<Text style={styles.prefix}>+91</Text>}
        />
        <TextField
          label={t("editProfile.email")}
          placeholder={t("editProfile.emailPlaceholder")}
          value={form.email}
          onChangeText={(v) => update("email", v)}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          icon={icon("mail-outline")}
        />
      </Card>
      <Card bordered elevationLevel="none" style={styles.card}>
        <TextField
          label={t("editProfile.address")}
          placeholder={t("editProfile.addressPlaceholder")}
          value={form.address}
          onChangeText={(v) => update("address", v)}
          multiline
          multilineHeight={96}
          maxLength={300}
        />
        <TextField
          label={t("editProfile.branchCode")}
          placeholder={t("editProfile.branchCodePlaceholder")}
          value={form.branchCode}
          onChangeText={(v) => update("branchCode", v)}
          autoCapitalize="characters"
          maxLength={30}
          icon={icon("git-branch-outline")}
        />
        <LocationField
          location={form.location}
          locating={locating}
          onCapture={onCaptureLocation}
          onRemove={onRemoveLocation}
          styles={styles}
          tokens={tokens}
        />
      </Card>
    </>
  );
}
