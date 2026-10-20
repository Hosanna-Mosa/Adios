import { useTranslation } from "react-i18next";
import { Header } from "@/components/ui/Header";
import { WEB_TOP_OFFSET } from "@/constants/layout";

// The support-chat header (case list + conversation view). Built from the
// shared Header so it matches the Help & Support screen's header instead of
// carrying its own 38pt/surface-bar chip.

interface Props {
  title: string;
  subtitle?: string;
  onBack: () => void;
  insets: { top: number };
}

export function SupportChatHeader({ title, subtitle, onBack, insets }: Props) {
  const { t } = useTranslation();
  return (
    <Header
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      backHitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel={t("app.a11y.goBack")}
      style={{ paddingTop: insets.top + WEB_TOP_OFFSET + 12 }}
    />
  );
}
