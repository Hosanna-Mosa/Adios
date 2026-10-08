import { ScreenShell } from "@/components/ui/ScreenShell";
import { PackageDeliverySearchBar } from "@/features/package-delivery/components/PackageDeliverySearchBar";
import { PackageDeliveryPlaceList } from "@/features/package-delivery/components/PackageDeliveryPlaceList";
import { usePackageDeliverySearch } from "@/features/package-delivery/usePackageDeliverySearch";

// Package delivery: find the pickup or drop address (?kind=pickup|drop).

export default function PackageDeliverySearchScreen() {
  const {
    tokens, accent, styles, kind, query, setQuery, results, searching, searchError, saved, busyId,
    selectResult, selectSaved, pickCurrentLocation, goBack,
  } = usePackageDeliverySearch();

  return (
    <ScreenShell keyboardAvoiding>
      <PackageDeliverySearchBar
        kind={kind}
        query={query}
        searching={searching}
        styles={styles}
        tokens={tokens}
        accent={accent}
        onChange={setQuery}
        onBack={goBack}
      />
      <PackageDeliveryPlaceList
        query={query}
        results={results}
        searching={searching}
        searchError={searchError}
        saved={saved}
        busyId={busyId}
        styles={styles}
        tokens={tokens}
        accent={accent}
        onCurrentLocation={pickCurrentLocation}
        onSaved={selectSaved}
        onResult={selectResult}
      />
    </ScreenShell>
  );
}
