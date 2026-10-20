import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Chip } from "@/components/ui/Badge";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import type { OfferInput } from "@/types/insights";
import { sanitizeDecimal } from "@/utils/number";
import { MAX_FLAT, MAX_PERCENT, type OfferErrors } from "../offerRules";
import type { OffersStyles } from "../offers.styles";

interface Props {
  visible: boolean;
  form: OfferInput;
  update: <K extends keyof OfferInput>(key: K, value: OfferInput[K]) => void;
  errors: OfferErrors;
  serverError?: string;
  saving: boolean;
  onSubmit: () => void;
  onClose: () => void;
  styles: OffersStyles;
}

/** Create an offer: a code, a percentage or flat discount, an optional minimum order and expiry date. */
export function OfferSheet({ visible, form, update, errors, serverError, saving, onSubmit, onClose, styles }: Props) {
  const { t } = useTranslation();
  const isPercent = form.discountType === "PERCENTAGE";
  const say = (key?: string) => (key ? t(`offers.${key}`, { percent: MAX_PERCENT, flat: MAX_FLAT }) : undefined);
  return (
    <BottomSheet visible={visible} onClose={onClose} dismissible={!saving} title={t("offers.newTitle")} subtitle={t("offers.newSubtitle")}>
      <View style={styles.sheetBody}>
        <TextField
          label={t("offers.code")}
          placeholder={t("offers.codePlaceholder")}
          value={form.code}
          onChangeText={(v) => update("code", v.replace(/[^A-Za-z0-9]/g, "").toUpperCase())}
          error={say(errors.code)}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={20}
        />
        <View style={styles.choices}>
          <Chip label={t("offers.percentage")} selected={isPercent} onPress={() => update("discountType", "PERCENTAGE")} />
          <Chip label={t("offers.flat")} selected={!isPercent} onPress={() => update("discountType", "FLAT")} />
        </View>
        <TextField
          label={isPercent ? t("offers.percentOff") : t("offers.amountOff")}
          value={form.discountValue}
          onChangeText={(v) => update("discountValue", sanitizeDecimal(v))}
          error={say(errors.discountValue)}
          keyboardType="decimal-pad"
          icon={<Text style={styles.prefix}>{isPercent ? "%" : "₹"}</Text>}
        />
        {isPercent ? (
          <TextField label={t("offers.maxDiscount")} placeholder={t("offers.optional")} value={form.maxDiscount} onChangeText={(v) => update("maxDiscount", sanitizeDecimal(v))} keyboardType="decimal-pad" icon={<Text style={styles.prefix}>₹</Text>} />
        ) : null}
        <TextField
          label={t("offers.minOrderLabel")}
          placeholder="0"
          value={form.minOrderValue}
          onChangeText={(v) => update("minOrderValue", sanitizeDecimal(v))}
          error={say(errors.minOrderValue)}
          keyboardType="decimal-pad"
          icon={<Text style={styles.prefix}>₹</Text>}
        />
        <TextField
          label={t("offers.expiryLabel")}
          placeholder="YYYY-MM-DD"
          value={form.expiryDate}
          onChangeText={(v) => update("expiryDate", v.replace(/[^0-9-]/g, "").slice(0, 10))}
          error={say(errors.expiryDate)}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
        <Text style={styles.hint}>{t("offers.costNote")}</Text>
        {serverError ? <Text style={styles.hint}>{serverError}</Text> : null}
        <Button title={t("offers.create")} onPress={onSubmit} loading={saving} fullWidth />
      </View>
    </BottomSheet>
  );
}
