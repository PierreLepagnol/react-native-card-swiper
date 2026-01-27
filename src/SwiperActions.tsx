import React from "react";
import { View, StyleSheet } from "react-native";

import { ActionButton } from "./ActionButton";
import type { SwiperActionsProps } from "./types";

/**
 * A row of three action buttons wired to a `CardSwiper` ref:
 * undo (swipeBack), reject (swipeLeft), approve (swipeRight).
 *
 * You provide the button contents (icons/text) via render props,
 * so there is no dependency on any icon library.
 *
 * @example
 * ```tsx
 * <SwiperActions
 *   swiperRef={swiperRef}
 *   renderUndo={() => <Text>↩</Text>}
 *   renderReject={() => <Text>✕</Text>}
 *   renderApprove={() => <Text>♥</Text>}
 * />
 * ```
 */
export const SwiperActions = React.memo(function SwiperActions({
  swiperRef,
  renderUndo,
  renderReject,
  renderApprove,
  containerStyle,
  buttonStyle,
}: SwiperActionsProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <ActionButton
        onPress={() => swiperRef.current?.swipeBack()}
        accessibilityLabel="Undo"
        style={buttonStyle}
      >
        {renderUndo()}
      </ActionButton>
      <ActionButton
        onPress={() => swiperRef.current?.swipeLeft()}
        accessibilityLabel="Reject"
        style={buttonStyle}
      >
        {renderReject()}
      </ActionButton>
      <ActionButton
        onPress={() => swiperRef.current?.swipeRight()}
        accessibilityLabel="Approve"
        style={buttonStyle}
      >
        {renderApprove()}
      </ActionButton>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingBottom: 34,
    paddingTop: 12,
  },
});
