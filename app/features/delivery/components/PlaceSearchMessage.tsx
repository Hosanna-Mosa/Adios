import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import { usePlaceSearchStatus, type PlaceSearchStatus } from "@/features/delivery/placeSearch";

interface Props {
  /** Style for the text, taken from the dropdown it sits in. */
  style: any;
  /** Results are already listed above — "searching" is then left off rather than shown under them. */
  hasResults: boolean;
}

// The status that has a line to show. "loading" only counts while there is nothing listed yet.
const showsMessage = (status: PlaceSearchStatus, hasResults: boolean) =>
  status === "empty" || status === "error" || (status === "loading" && !hasResults);

/**
 * The line a place-search dropdown shows when there is nothing to pick: "searching",
 * "no places found" or "couldn't search". Renders nothing while results are listed.
 */
export function PlaceSearchMessage({ style, hasResults }: Props) {
  const { t } = useTranslation();
  const status = usePlaceSearchStatus((s) => s.status);
  if (!showsMessage(status, hasResults)) return null;
  return (
    <Text style={style}>
      {status === "error"
        ? t("app.packageDelivery.searchFailed")
        : status === "loading"
          ? t("app.ride.searchingPlaces")
          : t("app.ride.noMatchingPlacesFound")}
    </Text>
  );
}

/** True when the dropdown has a message to show, so the screen knows to open it. */
export function usePlaceSearchHasMessage(hasResults: boolean): boolean {
  const status = usePlaceSearchStatus((s) => s.status);
  return showsMessage(status, hasResults);
}
