import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from "./SlideToConfirm.styles";
import { useSlideToConfirm } from "./useSlideToConfirm";

interface SlideToConfirmProps {
  onConfirm: () => void;
  title: string;
  colors: any;
}


export const SlideToConfirm: React.FC<SlideToConfirmProps> = ({ onConfirm, title, colors }) => {
  const {
  isConfirmed, slideAnim, panResponder, activeWidth, opacities, textOpacity
  } = useSlideToConfirm(onConfirm);

  return (
    <View style={[styles.container, { borderColor: '#F2C9D6', backgroundColor: '#FCEEF2' }]}>
      {/* Background track */}
      <View style={[styles.track, { backgroundColor: '#FCEEF2' }]}>
        <Animated.View style={[styles.guideRow, { opacity: textOpacity }]}>
          <Text style={[styles.title, { color: '#860132', marginRight: 8 }]}>{title}</Text>
          <View style={styles.chevronsContainer}>
            <Animated.View style={{ opacity: opacities[0] }}>
              <Feather name="chevron-right" size={16} color="#D98BA6" />
            </Animated.View>
            <Animated.View style={{ opacity: opacities[1], marginLeft: -4 }}>
              <Feather name="chevron-right" size={16} color="#860132" />
            </Animated.View>
            <Animated.View style={{ opacity: opacities[2], marginLeft: -4 }}>
              <Feather name="chevron-right" size={16} color="#5E0122" />
            </Animated.View>
          </View>
        </Animated.View>
      </View>

      {/* Active gradient track */}
      <Animated.View style={[styles.activeTrack, { width: activeWidth }]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.activeTextContainer}>
          <View style={styles.guideRow}>
            <Text style={[styles.title, { color: '#ffffff', marginRight: 8 }]}>{title}</Text>
            <View style={[styles.chevronsContainer, { opacity: 0 }]}>
              <Animated.View>
                <Feather name="chevron-right" size={16} />
              </Animated.View>
              <Animated.View style={{ marginLeft: -4 }}>
                <Feather name="chevron-right" size={16} />
              </Animated.View>
              <Animated.View style={{ marginLeft: -4 }}>
                <Feather name="chevron-right" size={16} />
              </Animated.View>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* The draggable thumb */}
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.thumbGradient}
        >
          <Feather name={isConfirmed ? "check" : "chevrons-right"} size={26} color="#ffffff" />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};
