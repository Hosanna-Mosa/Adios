import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type ThemeTokens } from "@/constants/colors";
import { type HelperTaskStyles } from "@/features/delivery/helper-task.styles";

// Section of TaskComposeFormWhereTheWork, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  customHours: any;
  customMinutes: any;
  description: any;
  durationMode: any;
  setCustomHours: React.Dispatch<React.SetStateAction<number>>;
  setCustomMinutes: React.Dispatch<React.SetStateAction<number>>;
  setDescription: React.Dispatch<React.SetStateAction<any>>;
  setDurationMode: React.Dispatch<React.SetStateAction<any>>;
  styles: HelperTaskStyles;
  tokens: ThemeTokens;
}

export function TaskComposeFormWhereTheWorkTimeRequired({
  customHours,
  customMinutes,
  description,
  durationMode,
  setCustomHours,
  setCustomMinutes,
  setDescription,
  setDurationMode,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
    <Animated.View style={styles.section} entering={fadeInUp(140)}>
      <Text style={styles.sectionLabel}>{t("app.delivery.timeRequired")}</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={styles.timeStepper}>
          <TouchableOpacity onPress={() => { setDurationMode("custom"); setCustomHours((h) => Math.max(0, h - 1)); }}>
            <Text style={styles.stepperSign}>−</Text>
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.stepperValue}>{durationMode === "1hr" ? 1 : durationMode === "2hr" ? 2 : customHours}</Text>
            <Text style={styles.stepperUnit}>{t("app.delivery.hours")}</Text>
          </View>
          <TouchableOpacity onPress={() => { setDurationMode("custom"); setCustomHours((h) => h + 1); }}>
            <Text style={styles.stepperSign}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.timeStepper}>
          <TouchableOpacity onPress={() => { setDurationMode("custom"); setCustomMinutes((m) => (m === 0 ? 45 : m - 15)); }}>
            <Text style={styles.stepperSign}>−</Text>
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.stepperValue}>{durationMode === "1hr" ? 0 : durationMode === "2hr" ? 0 : customMinutes}</Text>
            <Text style={styles.stepperUnit}>{t("app.delivery.minutes")}</Text>
          </View>
          <TouchableOpacity onPress={() => { setDurationMode("custom"); setCustomMinutes((m) => (m === 45 ? 0 : m + 15)); }}>
            <Text style={styles.stepperSign}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>

    <Animated.View style={styles.section} entering={fadeInUp(200)}>
      <Text style={styles.sectionLabel}>{t("app.delivery.taskDescription")}</Text>
      <View style={styles.descBox}>
        <TextInput
          style={styles.descInput}
          placeholder={t("app.delivery.twoPeopleToCarryA3seater")}
          placeholderTextColor={tokens.muted}
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />
      </View>
      <Text style={styles.descHint}>{t("app.delivery.helpersSeeThisBeforeTheyBid")}</Text>
    </Animated.View>
    </>
  );
}
