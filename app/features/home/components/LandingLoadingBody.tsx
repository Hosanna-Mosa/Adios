// Animated must come from react-native, not reanimated: the opacity/translate
// values below are RN Animated.Value instances created in app/index.tsx.
import { View, Animated } from "react-native";
import { typography } from "@/constants/typography";

// Moved out of app/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  letters: any[];
  opacityAnim: any;
  translateAnim: any;
}

export function LandingLoadingBody({
  letters,
  opacityAnim,
  translateAnim,
}: Props) {
  return (
    <>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {letters.map((letter, idx) => (
        <Animated.Text
          key={idx}
          style={{
            fontSize: typography.sizes.extraLarge,
            fontWeight: "900",
            color: "#ffffff",
            marginHorizontal: 4,
            textTransform: "uppercase",
            letterSpacing: 2,
            transform: [{ translateY: translateAnim[idx] }],
            opacity: opacityAnim[idx],
            textShadowColor: "rgba(0,0,0,0.3)",
            textShadowOffset: { width: 0, height: 4 },
            textShadowRadius: 6,
          }}
        >
          {letter}
        </Animated.Text>
      ))}
    </View>
    </>
  );
}
