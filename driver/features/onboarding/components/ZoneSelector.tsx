import React from "react";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";
import { FormInput } from "./FormInput";
import { zoneSelectorStyles as styles } from "./ZoneSelector.styles";
import { Touchable } from "@/components/ui/Touchable";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

export interface Zone {
  _id: string;
  name: string;
  description?: string | null;
}

/** Preferred-zone step: search, the matching list, and the chosen zone's card. */
export function ZoneSelector({
  zones,
  searchText,
  onSearchChange,
  isDropdownOpen,
  selectedZoneId,
  onSelectZone,
  onOpenZoneMap,
}: {
  zones: Zone[];
  searchText: string;
  onSearchChange: (t: string) => void;
  isDropdownOpen: boolean;
  selectedZoneId: string | null;
  onSelectZone: (id: string) => void;
  onOpenZoneMap: (zone: Zone) => void;
}) {
  const { t } = useTranslation();
  const filtered = zones.filter((z) =>
    z.name.toLowerCase().includes(searchText.toLowerCase()),
  );
  const selected = zones.find((z) => z._id === selectedZoneId);

  return (
    <Box style={styles.wrap}>
      <FormInput
        label={t("onboarding.searchZone")}
        value={searchText}
        onChangeText={onSearchChange}
        placeholder={t("onboarding.searchByCityOrZoneName")}
        icon="search"
      />

      {isDropdownOpen && (
        <Box style={styles.dropdown}>
          <ScrollBox nestedScrollEnabled={true} style={styles.scroll}>
            {filtered.length === 0 ? (
              <AppText style={styles.empty}>{t("onboarding.noMatchingZonesFound")}</AppText>
            ) : (
              filtered.map((z) => (
                <Touchable key={z._id} onPress={() => onSelectZone(z._id)} style={styles.row}>
                  <AppText style={styles.rowText}>{z.name}</AppText>
                </Touchable>
              ))
            )}
          </ScrollBox>
        </Box>
      )}

      {selected && (
        <Box style={styles.selectedWrap}>
          <AppText style={styles.selectedLabel}>{t("onboarding.selectedPreferredZone")}</AppText>
          <Touchable onPress={() => onOpenZoneMap(selected)} style={styles.selectedCard}>
            <Box style={styles.selectedIconWrap}>
              <Feather name="map-pin" size={20} color={Colors.info} />
            </Box>
            <Box style={styles.selectedCopy}>
              <AppText style={styles.selectedName}>{selected.name}</AppText>
              <AppText style={styles.selectedDesc}>
                {selected.description || t("onboarding.operationalGeofenceArea")}
              </AppText>
              <AppText style={styles.selectedLink}>🗺️ {t("onboarding.viewZoneCoverageMap")}</AppText>
            </Box>
            <Feather name="chevron-right" size={20} color={Colors.info} />
          </Touchable>
        </Box>
      )}
    </Box>
  );
}
