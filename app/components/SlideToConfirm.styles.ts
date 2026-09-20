import { StyleSheet, Dimensions } from "react-native";
import { typography } from "@/constants/typography";

// Styles for SlideToConfirm.tsx, moved out so the component file stays under 150 lines.
// Values are unchanged.

export const BUTTON_WIDTH = Dimensions.get('window').width - 80;

export const SLIDER_WIDTH = 56;

export const styles = StyleSheet.create({
  container: {
    width: BUTTON_WIDTH,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 4,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SLIDER_WIDTH / 2 + 12,
  },
  chevronsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 32,
    overflow: 'hidden',
  },
  activeTextContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.medium,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  thumb: {
    width: SLIDER_WIDTH,
    height: SLIDER_WIDTH,
    borderRadius: SLIDER_WIDTH / 2,
    position: 'absolute',
    left: 4,
    top: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
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
