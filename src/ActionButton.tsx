import { Pressable, StyleSheet } from "react-native";
import type { ActionButtonProps } from "./types";

/**
 * A circular pressable button — designed as an action control for the card swiper
 * (undo, reject, approve), but usable anywhere.
 */
export function ActionButton({
  onPress,
  children,
  style,
  accessibilityLabel,
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, style]}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 40,
    aspectRatio: 1,
    backgroundColor: "#3A3D45",
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
  },
});
