import { useRef, useState, useEffect } from "react";
import { Text, Animated, PanResponder } from "react-native";
import { BUTTON_WIDTH, MAX_SLIDE, SLIDER_WIDTH } from "./SlideToConfirm.styles";

// State and animation wiring for SlideToConfirm, moved out so both files stay
// under 150 lines. The statements keep their original order.

export function useSlideToConfirm(onConfirm: any) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  
  const onConfirmRef = useRef(onConfirm);
  useEffect(() => {
    onConfirmRef.current = onConfirm;
  }, [onConfirm]);

  // Loop animation for guiding arrows
  useEffect(() => {
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 3,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (isConfirmed) return;
        let newValue = gestureState.dx;
        if (newValue < 0) newValue = 0;
        if (newValue > MAX_SLIDE) newValue = MAX_SLIDE;
        slideAnim.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isConfirmed) return;
        if (gestureState.dx > MAX_SLIDE * 0.8) {
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
            bounciness: 10,
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

  // Calculate chevrons opacity based on loop value
  const opacities = [0, 1, 2].map((index) => {
    return pulseAnim.interpolate({
      inputRange: [index, index + 1, index + 2],
      outputRange: [0.2, 1, 0.2],
      extrapolate: 'clamp',
    });
  });

  // Text opacity fades out as user slides it
  const textOpacity = slideAnim.interpolate({
    inputRange: [0, MAX_SLIDE * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });


  return {
  isConfirmed, slideAnim, panResponder, activeWidth, opacities, textOpacity
  };
}
