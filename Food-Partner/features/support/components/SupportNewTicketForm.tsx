import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TextField } from "@/components/ui/TextField";
import { fadeInUp } from "@/motion/presets";
import { formatOrderId } from "@/utils/format";
import type { SupportChatStyles } from "../support-chat.styles";

interface Props {
  categories: { label: string; value: string }[];
  newCategory: string;
  setNewCategory: (value: string) => void;
  newTitle: string;
  setNewTitle: (value: string) => void;
  newMessage: string;
  setNewMessage: (value: string) => void;
  /** Recent order ids the case can be about; the agent sees the chosen one. */
  orderChoices: string[];
  newOrderId: string | null;
  setNewOrderId: (value: string | null) => void;
  creatingTicket: boolean;
  onSubmit: () => void;
  styles: SupportChatStyles;
}

/** "Raise a new ticket": category, the order it's about, title, description, submit. */
export function SupportNewTicketForm(p: Props) {
  const { t } = useTranslation();
  return (
    <>
      <SectionHeader title={t("support.raiseNewTicket")} style={p.styles.sectionHead} />
      <Animated.View entering={fadeInUp(0)} style={p.styles.formWrap}>
        <Card bordered elevationLevel="none" style={p.styles.form}>
          <Text style={p.styles.formLabel}>{t("support.issueCategory")}</Text>
          <View style={p.styles.chips}>
            {p.categories.map((c) => (
              <Chip key={c.value} label={c.label} selected={p.newCategory === c.value} onPress={() => p.setNewCategory(c.value)} />
            ))}
          </View>
          {p.orderChoices.length > 0 && (
            <>
              <Text style={p.styles.formLabel}>{t("support.aboutOrder")}</Text>
              <View style={p.styles.chips}>
                <Chip label={t("support.notAboutOrder")} selected={!p.newOrderId} onPress={() => p.setNewOrderId(null)} />
                {p.orderChoices.map((id) => (
                  <Chip key={id} label={formatOrderId(id)} selected={p.newOrderId === id} onPress={() => p.setNewOrderId(id)} />
                ))}
              </View>
            </>
          )}
          <TextField label={t("support.ticketTitle")} placeholder={t("support.ticketTitlePlaceholder")} value={p.newTitle} onChangeText={p.setNewTitle} maxLength={60} />
          <TextField
            label={t("support.description")}
            placeholder={t("support.descriptionPlaceholder")}
            value={p.newMessage}
            onChangeText={p.setNewMessage}
            multiline
            multilineHeight={110}
          />
        </Card>
      </Animated.View>
      <Button title={t("support.submitTicket")} onPress={p.onSubmit} loading={p.creatingTicket} style={p.styles.submit} />
    </>
  );
}
