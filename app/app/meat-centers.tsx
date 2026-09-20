import { MeatCentersTopRow } from "@/features/meat/components/MeatCentersTopRow";
import { MeatCentersCenterContainer } from "@/features/meat/components/MeatCentersCenterContainer";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { MeatCentersBody } from "@/features/meat/components/MeatCentersBody";
import { useMeatCenters } from "@/features/meat/useMeatCenters";

export default function MeatCentersScreen() {
  const {
  insets, tokens, accent, styles, loading, loadingMore, setPage, setHasMore, meatCenters,
  selectedAddress, selectedCategory, searchOpen, setSearchOpen, getCoords, fetchMeatCenters,
  loadMore, visibleCenters, renderHeader
  } = useMeatCenters();

  return (
    <ScreenShell>
      <MeatCentersTopRow
        insets={insets}
        searchOpen={searchOpen}
        selectedAddress={selectedAddress}
        setSearchOpen={setSearchOpen}
        styles={styles}
        tokens={tokens}
      />

      {loading && meatCenters.length === 0 ? (
        <MeatCentersCenterContainer
          accent={accent}
          styles={styles}
        />
      ) : (
        <MeatCentersBody
          accent={accent}
          fetchMeatCenters={fetchMeatCenters}
          getCoords={getCoords}
          loadMore={loadMore}
          loading={loading}
          loadingMore={loadingMore}
          renderHeader={renderHeader}
          selectedCategory={selectedCategory}
          setHasMore={setHasMore}
          setPage={setPage}
          visibleCenters={visibleCenters}
        />
      )}
    </ScreenShell>
  );
}
