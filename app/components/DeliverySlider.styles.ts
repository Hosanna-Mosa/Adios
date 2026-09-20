import { StyleSheet, Dimensions } from "react-native";
import { typography } from "@/constants/typography";

// Styles for DeliverySlider.tsx, moved out so the component file stays under 150 lines.
// Values are unchanged except fontSize/lineHeight, which now come from the
// four typography tokens (both branches of the old 13/15 title size map to medium).

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export const isStandardOrSmall = SCREEN_HEIGHT < 850;

export const BUTTON_WIDTH = SCREEN_WIDTH - 40;

export const SLIDER_WIDTH = isStandardOrSmall ? 48 : 56;

const CONTAINER_HEIGHT = isStandardOrSmall ? 54 : 64;

export const styles = StyleSheet.create({
  container: {
    width: BUTTON_WIDTH,
    height: CONTAINER_HEIGHT,
    borderRadius: CONTAINER_HEIGHT / 2,
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  dockZone: {
    position: 'absolute',
    right: 4,
    top: (CONTAINER_HEIGHT - SLIDER_WIDTH) / 2,
    width: SLIDER_WIDTH,
    height: SLIDER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dockCircle: {
    width: SLIDER_WIDTH - 8,
    height: SLIDER_WIDTH - 8,
    borderRadius: (SLIDER_WIDTH - 8) / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  title: {
    fontSize: typography.sizes.medium,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  activeTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: CONTAINER_HEIGHT / 2,
    zIndex: 5,
  },
  maskedTextContainer: {
    width: BUTTON_WIDTH,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: SLIDER_WIDTH,
    height: SLIDER_WIDTH,
    borderRadius: SLIDER_WIDTH / 2,
    position: 'absolute',
    left: 4,
    top: (CONTAINER_HEIGHT - SLIDER_WIDTH) / 2,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: '#ffffff',
  },
  thumbGradient: {
    flex: 1,
    borderRadius: SLIDER_WIDTH / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const MAX_SLIDE = BUTTON_WIDTH - SLIDER_WIDTH - 8;
