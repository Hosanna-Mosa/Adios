import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Moved out of app/ride-searching.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  CANCEL_REASONS: any[];
  cancelConfirmVisible: any;
  cancelLocationAddress: any;
  cancelLocationLabel: any;
  cancelLocationTitle: any;
  cancelReasonVisible: any;
  cancelRide: any;
  cancelUsesDrop: any;
  colors: any;
  dropTitle: any;
  fare: any;
  keepSearching: any;
  params: any;
  pickupTitle: any;
  selectCancelReason: any;
  selectedCancelReason: any;
  setCancelReasonVisible: React.Dispatch<React.SetStateAction<any>>;
  setTripDetailsVisible: React.Dispatch<React.SetStateAction<any>>;
  showCancelReasons: any;
  styles: any;
}

export function BookAgainOverlay({
  CANCEL_REASONS,
  cancelConfirmVisible,
  cancelLocationAddress,
  cancelLocationLabel,
  cancelLocationTitle,
  cancelReasonVisible,
  cancelRide,
  cancelUsesDrop,
  colors,
  dropTitle,
  fare,
  keepSearching,
  params,
  pickupTitle,
  selectCancelReason,
  selectedCancelReason,
  setCancelReasonVisible,
  setTripDetailsVisible,
  showCancelReasons,
  styles,
}: Props) {
  return (
    <View style={styles.bookAgainOverlay}>
      <TouchableOpacity
        style={styles.bookAgainBackdrop}
        activeOpacity={1}
        onPress={() => setTripDetailsVisible(false)}
      />
      <TouchableOpacity
        style={styles.bookAgainBackFloating}
        onPress={() => setTripDetailsVisible(false)}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.bookAgainSheet}>
        <Text style={styles.bookAgainTitle}>Searching for below services...</Text>

        <View style={styles.serviceSummaryCard}>
          <View style={styles.serviceLeft}>
            <View style={styles.serviceBikeBadge}>
              <MaterialCommunityIcons name="motorbike" size={30} color={colors.text} />
            </View>
            <Text style={styles.serviceName}>Bike</Text>
          </View>
          <Text style={styles.serviceFare}>₹{fare}</Text>
        </View>

        <View style={styles.bookDashedLine} />

        <Text style={styles.locationTitle}>Location Details</Text>
        <View style={styles.locationRows}>
          <View style={styles.locationRail}>
            <View style={styles.pickupSmallDot} />
            <View style={styles.locationDashes} />
            <View style={styles.dropSmallDot} />
          </View>
          <View style={styles.locationTextColumn}>
            <View style={styles.locationRow}>
              <Text style={styles.locationName} numberOfLines={1}>
                {pickupTitle}
              </Text>
              <Text style={styles.locationAddress} numberOfLines={2}>
                {params.pickupName}
              </Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={styles.locationName} numberOfLines={1}>
                {dropTitle}
              </Text>
              <Text style={styles.locationAddress} numberOfLines={2}>
                {params.dropName}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.totalFareRow}>
          <Text style={styles.totalFareLabel}>Total Fare</Text>
          <Text style={styles.totalFareValue}>₹{fare}</Text>
        </View>

        <View style={styles.paymentRow}>
          <Ionicons name="cash-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.paymentText}>Paying via cash</Text>
        </View>

        <TouchableOpacity
          style={styles.backYellowButton}
          onPress={() => setTripDetailsVisible(false)}
        >
          <Text style={styles.backYellowText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelRideButton}
          onPress={showCancelReasons}
        >
          <Text style={styles.cancelRideText}>Cancel Ride</Text>
        </TouchableOpacity>
      </View>

      {cancelReasonVisible && (
        <View style={styles.cancelFlowOverlay}>
          <TouchableOpacity
            style={styles.cancelFlowBackdrop}
            activeOpacity={1}
            onPress={() => setCancelReasonVisible(false)}
          />
          <TouchableOpacity
            style={styles.cancelFlowBackButton}
            onPress={() => setCancelReasonVisible(false)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.cancelReasonSheet}>
            <View style={styles.cancelSheetHandle} />
            <Text style={styles.cancelReasonTitle}>Why do you want to cancel?</Text>
            <Text style={styles.cancelReasonSubtitle}>
              Please provide the reason for cancellation
            </Text>
            <View style={styles.cancelReasonDivider} />

            {CANCEL_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={styles.cancelReasonRow}
                onPress={() => selectCancelReason(reason)}
              >
                <Text style={styles.cancelReasonText}>{reason}</Text>
                <Ionicons name="chevron-forward" size={22} color={colors.text} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {cancelConfirmVisible && (
        <View style={styles.cancelFlowOverlay}>
          <TouchableOpacity
            style={styles.cancelFlowBackdrop}
            activeOpacity={1}
            onPress={keepSearching}
          />

          <TouchableOpacity style={styles.cancelConfirmClose} onPress={keepSearching}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.cancelConfirmSheet}>
            <View style={styles.cancelSheetHandle} />
            <Text style={styles.cancelConfirmTitle}>
              Are you sure you want to cancel{"\n"}this ride?
            </Text>
            <View style={styles.cancelReasonDivider} />

            <Text style={styles.cancelConfirmCopy}>
              {cancelUsesDrop
                ? "Drop location can be changed before booking another ride."
                : "Pickup location can be changed up to a radius of 200m even after the captain is assigned."}
            </Text>

            <View style={styles.selectedReasonBox}>
              <Text style={styles.selectedReasonLabel}>Reason</Text>
              <Text style={styles.selectedReasonText}>{selectedCancelReason}</Text>
            </View>

            <Text style={styles.currentAddressLabel}>
              Your current {cancelLocationLabel} address is
            </Text>
            <View style={styles.cancelAddressRow}>
              <View style={styles.cancelAddressDot} />
              <View style={styles.cancelAddressTextGroup}>
                <Text style={styles.cancelAddressTitle} numberOfLines={1}>
                  {cancelLocationTitle}
                </Text>
                <Text style={styles.cancelAddressDetail} numberOfLines={1}>
                  {cancelLocationAddress}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.cancelMyRideButton} onPress={cancelRide}>
              <Text style={styles.cancelMyRideText}>Cancel my ride</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.keepSearchingButton} onPress={keepSearching}>
              <Text style={styles.keepSearchingText}>Keep searching</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
