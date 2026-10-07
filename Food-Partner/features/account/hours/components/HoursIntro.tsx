import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { InfoNote } from "@/components/ui/InfoNote";
import type { HoursStyles } from "../hours.styles";

interface Props {
  /** The server's live label, e.g. "Closed · opens Mon 9:00 AM". */
  status?: string;
  unscheduled: boolean;
  styles: HoursStyles;
}

/** What customers see right now, and what the hours mean for them. */
export function HoursIntro({ status, unscheduled, styles }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.intro}>
      {status ? <Text style={styles.hint}>{t("hours.currently", { status })}</Text> : null}
      <InfoNote text={unscheduled ? t("hours.unscheduledNote") : t("hours.note")} />
    </View>
  );
}
