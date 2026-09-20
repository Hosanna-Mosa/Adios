import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BUTTON_WIDTH, MAX_SLIDE, SLIDER_WIDTH, isStandardOrSmall, styles } from "./DeliverySlider.styles";
import { useDeliverySlider } from "./useDeliverySlider";

interface DeliverySliderProps {
  onConfirm: () => void;
  title: string;
  colors: any;
}



export const DeliverySlider: React.FC<DeliverySliderProps> = ({ onConfirm, title, colors }) => {
  const {
  isConfirmed, slideAnim, pulseAnim, wobbleAnim, shimmerAnim, panResponder, activeWidth,
  textOpacity, rotation
  } = useDeliverySlider(onConfirm);

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
      
      {/* Target Docking Zone */}
      <View style={styles.dockZone}>
         <View style={[styles.dockCircle, { borderColor: `${colors.primary}40` }]} />
      </View>

      {/* Base Text Layer (Visible when idle) */}
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]} pointerEvents="none">
        <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
        
        {/* Shimmer Highlight */}
        <Animated.View style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(255,255,255,0.8)',
            width: 30,
            transform: [{
              translateX: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-150, 300] })
            }]
          }
        ]} />

        {/* Pulsing Chevrons */}
        <Animated.View style={{ marginLeft: 8, flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="chevron-right" size={16} color={colors.primary} style={{ opacity: 0.3 }} />
          <Animated.View style={{ marginLeft: -6, transform: [{ translateX: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) }] }}>
             <Feather name="chevron-right" size={16} color={colors.primary} style={{ opacity: 0.8 }} />
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* Premium Active Track (Vibrant solid fill that masks white text) */}
      <Animated.View style={[styles.activeTrack, { width: activeWidth, backgroundColor: colors.primary, overflow: 'hidden' }]}>
         <View style={styles.maskedTextContainer}>
            <Text style={[styles.title, { color: '#ffffff' }]}>{title}</Text>
            <View style={{ marginLeft: 8, flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="check" size={18} color="#ffffff" />
            </View>
         </View>
      </Animated.View>

      {/* The Draggable Scooter Thumb */}
      <Animated.View
        style={[
          styles.thumb,
          { 
            transform: [
              { translateX: slideAnim },
              { translateY: wobbleAnim }, // Bounces up and down when dragged
              { rotate: rotation } // Leans forward slightly when dragged
            ],
            shadowColor: colors.primary,
            zIndex: 10
          }
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={isConfirmed ? ['#10B981', '#059669'] : [colors.primary, colors.primaryDark]}
          style={styles.thumbGradient}
        >
          <MaterialCommunityIcons 
            name={isConfirmed ? "check-bold" : "moped"} 
            size={isStandardOrSmall ? 22 : 28} 
            color="#ffffff" 
            style={{ transform: [{ translateX: isConfirmed ? 0 : 2 }] }} // Minor optical alignment
          />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};
