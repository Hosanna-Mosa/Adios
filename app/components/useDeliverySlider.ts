import { useRef, useState, useEffect } from "react";
import { Animated, PanResponder } from "react-native";
import { BUTTON_WIDTH, MAX_SLIDE, SLIDER_WIDTH } from "./DeliverySlider.styles";

// State and animation wiring for DeliverySlider, moved out so both files stay
// under 150 lines. The statements keep their original order.

export function useDeliverySlider(onConfirm: any) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  const onConfirmRef = useRef(onConfirm);
  useEffect(() => {
    onConfirmRef.current = onConfirm;
  }, [onConfirm]);

  useEffect(() => {
    // Pulse animation for the guiding arrows
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
      ])
    ).start();

    // Continuous shimmer effect across the text
    Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 2500, useNativeDriver: true })
    ).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Start wobble animation to simulate driving when the user grabs the scooter
        Animated.loop(
          Animated.sequence([
            Animated.timing(wobbleAnim, { toValue: -2, duration: 80, useNativeDriver: false }),
            Animated.timing(wobbleAnim, { toValue: 2, duration: 80, useNativeDriver: false })
          ])
        ).start();
      },
      onPanResponderMove: (_, gestureState) => {
        if (isConfirmed) return;
        let newValue = gestureState.dx;
        if (newValue < 0) newValue = 0;
        if (newValue > MAX_SLIDE) newValue = MAX_SLIDE;
        slideAnim.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isConfirmed) return;
        
        wobbleAnim.stopAnimation();
        wobbleAnim.setValue(0);

        if (gestureState.dx > MAX_SLIDE * 0.7) {
          Animated.spring(slideAnim, {
            toValue: MAX_SLIDE,
            useNativeDriver: false,
            bounciness: 0,
          }).start(() => {
            setIsConfirmed(true);
            onConfirmRef.current();
          });
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 12,
          }).start();
        }
      },
    })
  ).current;

  const activeWidth = slideAnim.interpolate({
    inputRange: [0, MAX_SLIDE],
    outputRange: [SLIDER_WIDTH + 8, BUTTON_WIDTH],
    extrapolate: 'clamp',
  });

  const textOpacity = slideAnim.interpolate({
    inputRange: [0, MAX_SLIDE * 0.5],
    outputRange: [1, 0.1], // Soft fade for the base text so the new vibrant track stands out
    extrapolate: 'clamp',
  });

  // Calculate the rotation based on how far they have slid (wheelie effect)
  const rotation = slideAnim.interpolate({
    inputRange: [0, MAX_SLIDE / 2, MAX_SLIDE],
    outputRange: ['0deg', '-5deg', '0deg'],
    extrapolate: 'clamp',
  });


  return {
  isConfirmed, slideAnim, pulseAnim, wobbleAnim, shimmerAnim, panResponder, activeWidth,
  textOpacity, rotation
  };
}
