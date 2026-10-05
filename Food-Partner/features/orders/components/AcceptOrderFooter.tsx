import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ThemeTokens } from "@/constants/colors";
import { PREP_TIME_OPTIONS } from "@/utils/orderStatus";
import type { OrderDetailStyles } from "../orderDetail.styles";

interface Props {
  /** When the order is cancelled automatically if still not accepted (ISO). */
  acceptBy?: string | null;
  prepMinutes: number;
  onPrepMinutesChange: (minutes: number) => void;
  onAccept: () => void;
  onReject: () => void;
  accepting: boolean;
  rejecting: boolean;
  styles: OrderDetailStyles;
  tokens: ThemeTokens;
}

/**
 * A new food order: accept it with a prep time, or turn it down. Accepting is
 * what starts the search for a delivery partner — every rider who can reach the
 * outlet before the food is ready is offered it at once.
 */
export function AcceptOrderFooter({
  acceptBy, prepMinutes, onPrepMinutesChange, onAccept, onReject, accepting, rejecting, styles, tokens,
}: Props) {
  const { t } = useTranslation();
  const busy = accepting || rejecting;
  const secondsLeft = useSecondsUntil(acceptBy);
  return (
    <>
      {secondsLeft !== null ? (
        <Text style={[styles.acceptDeadline, { color: secondsLeft <= 30 ? tokens.error : tokens.warning }]}>
          {secondsLeft > 0
            ? t("orderDetail.acceptWithin", { time: formatMmSs(secondsLeft) })
            : t("orderDetail.acceptTimeUp")}
        </Text>
      ) : null}
      <Text style={styles.readyHint}>{t("orderDetail.prepTimeQuestion")}</Text>
      <View style={styles.prepChips}>
        {PREP_TIME_OPTIONS.map((minutes) => (
          <Chip
            key={minutes}
            label={t("orderDetail.prepMinutes", { count: minutes })}
            selected={prepMinutes === minutes}
            onPress={() => onPrepMinutesChange(minutes)}
          />
        ))}
      </View>
      <Button
        title={t("orderDetail.acceptOrder", { count: prepMinutes })}
        icon={<Ionicons name="checkmark-circle" size={20} color={tokens.onBrand} />}
        onPress={onAccept}
        loading={accepting}
        disabled={busy}
        fullWidth
      />
      <Button title={t("orderDetail.rejectOrder")} variant="ghost" onPress={onReject} loading={rejecting} disabled={busy} fullWidth />
    </>
  );
}

/** Seconds until `deadline`, ticking every second; null when there is no deadline. */
function useSecondsUntil(deadline?: string | null) {
  const [seconds, setSeconds] = useState(() => secondsUntil(deadline));
  useEffect(() => {
    setSeconds(secondsUntil(deadline));
    if (!deadline) return;
    const timer = setInterval(() => setSeconds(secondsUntil(deadline)), 1000);
    return () => clearInterval(timer);
  }, [deadline]);
  return seconds;
}

const secondsUntil = (deadline?: string | null) =>
  deadline ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 1000)) : null;

const formatMmSs = (total: number) => `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
