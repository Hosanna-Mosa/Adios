import { View } from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { LeadingTile, ListRow } from "@/components/ui/ListRow";
import type { ThemeTokens } from "@/constants/colors";
import type { SupportedLanguage } from "@/contexts/languageStore";
import { staggerListItem } from "@/motion/presets";
import { LANGUAGES } from "../languages";
import type { LanguageStyles } from "../language.styles";

interface Props {
  selected: SupportedLanguage | null;
  onSelect: (code: SupportedLanguage) => void;
  styles: LanguageStyles;
  tokens: ThemeTokens;
}

/** The three language choices — used on first launch and in Account → Language. */
export function LanguageList({ selected, onSelect, styles, tokens }: Props) {
  return (
    <View style={styles.list}>
      {LANGUAGES.map((language, index) => {
        const isSelected = selected === language.code;
        return (
          <Animated.View key={language.code} entering={staggerListItem(index)}>
            <ListRow
              card
              selected={isSelected}
              label={language.native}
              description={language.english}
              leading={<LeadingTile active={isSelected}>{language.glyph}</LeadingTile>}
              right={
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                  size={moderateScale(24)}
                  color={isSelected ? tokens.brand : tokens.borderStrong}
                />
              }
              onPress={() => onSelect(language.code)}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}
