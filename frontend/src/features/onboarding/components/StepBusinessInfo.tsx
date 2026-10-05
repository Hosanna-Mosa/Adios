import { useTranslation } from "react-i18next";
import { Icon } from "../../../components/shared/Icon";
import { categoryOptionLabel } from "../constants";
import { isValidEmail } from "../hooks/useOnboardingForm";
import type { useOnboardingForm } from "../hooks/useOnboardingForm";

type Props = { form: ReturnType<typeof useOnboardingForm> };

export function StepBusinessInfo({ form }: Props) {
  const { t } = useTranslation();
  const {
    copy,
    categoryOptions,
    restaurantName,
    setRestaurantName,
    cuisines,
    toggleCuisine,
    ownerName,
    setOwnerName,
    ownerEmail,
    setOwnerEmail,
    portalPassword,
    setPortalPassword,
    confirmPortalPassword,
    setConfirmPortalPassword,
    ownerPhone,
    setOwnerPhone,
    primaryContact,
    setPrimaryContact,
    sameAsOwner,
    setSameAsOwner,
    mapRef,
    searchInputRef,
    locationSearch,
    setLocationSearch,
    isMapsLoaded,
    handleMapZoom,
    handleUseCurrentLocation,
    mapView,
    setMapView,
    gpsLat,
    gpsLng,
    shopNo,
    setShopNo,
    floor,
    setFloor,
    area,
    setArea,
    city,
    setCity,
    landmark,
    setLandmark,
  } = form;
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl lg:text-3xl font-bold mb-2">
          {copy.infoTitle}
        </h1>
        <p className="text-secondary-app text-sm">{copy.infoIntro}</p>
      </div>

      {/* ── Section 1.1: Restaurant Details ── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
            <Icon name="store" className="text-base text-brand-kinetic" />
          </div>
          <h2 className="font-display text-lg font-bold">
            {copy.detailsTitle}
          </h2>
        </div>

        <div className="space-y-5 bg-white rounded-2xl border border-gray-200 p-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              {copy.businessLabel} <span className="text-brand-kinetic">*</span>
            </label>
            <p className="text-xs text-secondary-app mb-2">
              {t("onboarding.publicNameDesc")}
            </p>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder={copy.businessPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              {copy.categoryLabel} <span className="text-brand-kinetic">*</span>
            </label>
            <p className="text-xs text-secondary-app mb-2">
              {copy.categoryHelp}
            </p>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCuisine(c)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                    cuisines.includes(c)
                      ? "bg-brand-kinetic text-white border-brand-kinetic"
                      : "bg-white text-secondary-app border-gray-200 hover:border-brand-kinetic/30"
                  }`}
                >
                  {categoryOptionLabel(c)}
                </button>
              ))}
            </div>
            {cuisines.length > 0 && (
              <p className="text-xs text-secondary-app mt-2">
                {t("onboarding.selectedColon")}{" "}
                {cuisines.map(categoryOptionLabel).join(", ")}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 1.2: Owner & Communication Details ── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
            <Icon
              name="contact_phone"
              className="text-base text-brand-kinetic"
            />
          </div>
          <h2 className="font-display text-lg font-bold">
            {t("onboarding.ownerAndCommunicationDetails")}
          </h2>
        </div>

        <div className="space-y-5 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("onboarding.fullName")}{" "}
                <span className="text-brand-kinetic">*</span>
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder={t("onboarding.ownersFullName")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("onboarding.emailAddress")}{" "}
                <span className="text-brand-kinetic">*</span>
              </label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="owner@business.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
              />
              {ownerEmail.trim() && !isValidEmail(ownerEmail) ? (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {t("onboarding.invalidEmail", "Enter a valid email address.")}
                </p>
              ) : (
                <p className="mt-2 text-xs text-secondary-app">
                  {t(
                    "onboarding.emailUsedForUpdates",
                    "We'll email your application status here.",
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-brand-kinetic/20 bg-brand-kinetic/5 p-4">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-kinetic shadow-sm">
                <Icon name="admin_panel_settings" className="text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {t("onboarding.vendorPortalLogin")}
                </p>
                <p className="mt-1 text-xs text-secondary-app">
                  {t("onboarding.vendorPortalLoginDesc")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t("onboarding.password")}{" "}
                  <span className="text-brand-kinetic">*</span>
                </label>
                <input
                  type="password"
                  value={portalPassword}
                  onChange={(e) => setPortalPassword(e.target.value)}
                  placeholder={t("onboarding.minimum6Characters")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t("onboarding.confirmPassword")}{" "}
                  <span className="text-brand-kinetic">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPortalPassword}
                  onChange={(e) => setConfirmPortalPassword(e.target.value)}
                  placeholder={t("onboarding.reEnterPassword")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
                />
              </div>
            </div>
            {confirmPortalPassword &&
              portalPassword !== confirmPortalPassword && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {t("onboarding.passwordsDoNotMatch")}
                </p>
              )}
          </div>

          {/* Owner mobile number — recorded as entered, no OTP step */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t("onboarding.phoneNumber")}{" "}
              <span className="text-brand-kinetic">*</span>
            </label>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white">
                <span className="text-sm font-semibold">🇮🇳 +91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                value={ownerPhone}
                onChange={(e) =>
                  setOwnerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder={t("onboarding.enterPhoneNumber")}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
              />
            </div>
            {ownerPhone.length > 0 && ownerPhone.length < 10 && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {t(
                  "onboarding.enterValidTenDigitPhone",
                  "Enter a valid 10-digit mobile number.",
                )}
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold">
                {t("onboarding.primaryContactNumber")}
              </label>
              <label
                className="flex items-center gap-2 text-xs font-medium text-secondary-app cursor-pointer"
                htmlFor="same-as-owner"
              >
                <input
                  id="same-as-owner"
                  type="checkbox"
                  checked={sameAsOwner}
                  onChange={() => {
                    setSameAsOwner(!sameAsOwner);
                    if (sameAsOwner) setPrimaryContact("");
                    else setPrimaryContact(ownerPhone);
                  }}
                  className="accent-brand-kinetic"
                />
                {t("onboarding.sameAsOwnerMobileNumber")}
              </label>
            </div>
            <p className="text-xs text-secondary-app mb-2">
              {t("onboarding.usedForCustomerDriverSupport")}
            </p>
            <input
              type="tel"
              value={sameAsOwner ? ownerPhone : primaryContact}
              onChange={(e) =>
                setPrimaryContact(
                  e.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
              disabled={sameAsOwner}
              placeholder={t("onboarding.primaryContactNumberPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        </div>
      </section>

      {/* ── Section 1.3: Location & Geocoding ── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
            <Icon name="map" className="text-base text-brand-kinetic" />
          </div>
          <h2 className="font-display text-lg font-bold">
            {t("onboarding.locationAndGeocoding")}
          </h2>
        </div>

        <div className="space-y-5 bg-white rounded-2xl border border-gray-200 p-6">
          {/* Google Maps Container */}
          <div className="h-72 rounded-xl bg-gray-100 border border-gray-200 relative overflow-hidden">
            <div ref={mapRef} className="absolute inset-0 z-0 h-full w-full" />

            <div className="pointer-events-none absolute inset-0 z-[1000]">
              {/* Search bar overlay */}
              <div className="pointer-events-auto absolute left-3 right-16 top-3">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex items-center gap-2 px-3 py-2.5">
                  <Icon name="search" className="text-lg text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    placeholder={
                      isMapsLoaded
                        ? t("onboarding.searchForAreaStreetName")
                        : t("onboarding.loadingGoogleMaps")
                    }
                    className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-gray-400 outline-none"
                  />
                </div>
              </div>

              {/* Zoom controls */}
              <div className="pointer-events-auto absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => handleMapZoom("in")}
                  className="flex h-9 w-9 items-center justify-center border-b border-gray-200 text-lg font-bold text-on-surface hover:bg-gray-50"
                  title={t("onboarding.zoomIn")}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => handleMapZoom("out")}
                  className="flex h-9 w-9 items-center justify-center text-lg font-bold text-on-surface hover:bg-gray-50"
                  title={t("onboarding.zoomOut")}
                >
                  -
                </button>
              </div>

              {/* Center crosshair hint */}
              <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-brand-kinetic/90 shadow-lg">
                <Icon name="my_location" className="text-xl text-white" />
              </div>

              {/* Crosshair current location button */}
              <div className="pointer-events-auto absolute bottom-3 left-3">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-on-surface shadow-lg transition-colors hover:bg-gray-50"
                  title={t("onboarding.useCurrentLocationCoordinates")}
                >
                  <Icon
                    name="filter_center_focus"
                    className="text-xl text-brand-kinetic"
                  />
                  {t("onboarding.locate")}
                </button>
              </div>

              {/* Map type toggle */}
              <div className="pointer-events-auto absolute bottom-3 right-3 overflow-hidden rounded-lg border border-gray-200 bg-white text-xs font-semibold shadow-lg">
                <button
                  type="button"
                  onClick={() => setMapView("map")}
                  className={`px-4 py-2 transition-colors ${
                    mapView === "map"
                      ? "bg-brand-kinetic text-white"
                      : "text-secondary-app hover:bg-gray-50"
                  }`}
                >
                  {t("onboarding.map")}
                </button>
                <button
                  type="button"
                  onClick={() => setMapView("satellite")}
                  className={`px-4 py-2 transition-colors ${
                    mapView === "satellite"
                      ? "bg-brand-kinetic text-white"
                      : "text-secondary-app hover:bg-gray-50"
                  }`}
                >
                  {t("onboarding.satellite")}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-app mb-1">
                {t("onboarding.gpsLatitude")}
              </label>
              <input
                type="text"
                value={gpsLat}
                readOnly
                placeholder={t("onboarding.autoFilled")}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-app mb-1">
                {t("onboarding.gpsLongitude")}
              </label>
              <input
                type="text"
                value={gpsLng}
                readOnly
                placeholder={t("onboarding.autoFilled")}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 1.4: Detailed Address ── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
            <Icon name="location_on" className="text-base text-brand-kinetic" />
          </div>
          <h2 className="font-display text-lg font-bold">
            {t("onboarding.detailedAddress")}
          </h2>
        </div>

        <div className="space-y-5 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("onboarding.shopNoBuildingTower")}{" "}
                <span className="text-gray-400 font-normal">
                  {t("onboarding.optional")}
                </span>
              </label>
              <input
                type="text"
                value={shopNo}
                onChange={(e) => setShopNo(e.target.value)}
                placeholder={t("onboarding.egShop42")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("onboarding.floorDetails")}{" "}
                <span className="text-gray-400 font-normal">
                  {t("onboarding.optional")}
                </span>
              </label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder={t("onboarding.egGroundFloor")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              {t("onboarding.areaSectorLocality")}{" "}
              <span className="text-brand-kinetic">*</span>
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder={t("onboarding.egHsrLayout")}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("onboarding.city")}{" "}
                <span className="text-brand-kinetic">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("onboarding.egMumbai")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("onboarding.nearbyLandmark")}{" "}
                <span className="text-brand-kinetic">*</span>
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder={t("onboarding.egNearCityMall")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
              />
              <p className="text-[10px] text-secondary-app/60 mt-1">
                {t("onboarding.ensureMatchesFssai")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
