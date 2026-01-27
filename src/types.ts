import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import type { WithSpringConfig, WithTimingConfig } from "react-native-reanimated";

// ---- Card item constraint ----

/**
 * Every item in the data array must have a unique `key` used as the
 * React key for the rendered card. Any extra fields are passed through
 * to `renderCard`.
 */
export type CardItem = { key: string | number };

// ---- Imperative ref ----

/** Methods exposed via `ref` for programmatic swipe control. */
export type CardSwiperRef = {
  /** Programmatically swipe the top card to the right. */
  swipeRight: () => void;
  /** Programmatically swipe the top card to the left. */
  swipeLeft: () => void;
  /** Undo the last swipe and restore the previous card. */
  swipeBack: () => void;
};

// ---- CardSwiper props ----

export type CardSwiperProps<T extends CardItem> = {
  /** Array of items to display as swipeable cards. Each item must have a unique `key`. */
  data: T[];

  /**
   * Render function for each card's content.
   * Receives the data item — return any React Native view.
   */
  renderCard: (item: T) => ReactNode;

  /**
   * Custom overlay content shown when swiping right (e.g. "LIKE" label).
   * Opacity is animated automatically by the swiper — just return static content.
   * @default Green semi-transparent overlay with "KEEP" text.
   */
  renderRightOverlay?: () => ReactNode;

  /**
   * Custom overlay content shown when swiping left (e.g. "NOPE" label).
   * Opacity is animated automatically by the swiper — just return static content.
   * @default Red semi-transparent overlay with "PASS" text.
   */
  renderLeftOverlay?: () => ReactNode;

  /**
   * Called when a card is swiped right.
   * @param cardIndex - Index of the swiped card in the `data` array.
   */
  onSwipeRight: (cardIndex: number) => void;

  /**
   * Called when a card is swiped left.
   * @param cardIndex - Index of the swiped card in the `data` array.
   */
  onSwipeLeft: (cardIndex: number) => void;

  /**
   * Called when all cards have been swiped.
   */
  onSwipedAll: () => void;

  /**
   * Called whenever the active card index changes (swipe or undo).
   * @param index - The new active card index.
   */
  onIndexChange: (index: number) => void;

  // ---- Animation tuning (all optional with sensible defaults) ----

  /**
   * Fraction of screen width the user must drag to trigger a swipe.
   * @default 0.3
   */
  swipeThreshold?: number;

  /**
   * Maximum rotation in degrees applied during drag.
   * @default 15
   */
  maxRotation?: number;

  /**
   * Scale applied to the card behind the top card when idle.
   * Scales up to 1.0 as the top card moves away.
   * @default 0.95
   */
  behindCardScale?: number;

  /**
   * Number of cards rendered in the sliding window.
   * Higher values prevent flicker with fast swiping at the cost of memory.
   * @default 5
   */
  windowSize?: number;

  /**
   * Spring configuration for the snap-back animation when a swipe is cancelled.
   * @default { damping: 20, stiffness: 200 }
   */
  springConfig?: WithSpringConfig;

  /**
   * Timing configuration for the fly-out animation when a swipe is committed.
   * @default { duration: 200, easing: Easing.out(Easing.cubic) }
   */
  flyOutConfig?: WithTimingConfig;

  /** Style applied to the outer container. */
  containerStyle?: ViewStyle;

  /** Style applied to each card wrapper. */
  cardStyle?: ViewStyle;
};

// ---- ActionButton props ----

export type ActionButtonProps = {
  /** Callback fired when the button is pressed. */
  onPress: () => void;
  /** Button content (typically an icon). */
  children: ReactNode;
  /** Additional styles merged onto the button container. */
  style?: ViewStyle;
  /** Accessibility label for screen readers. */
  accessibilityLabel?: string;
};

// ---- SwiperActions props ----

export type SwiperActionsProps = {
  /** Ref to the CardSwiper instance for programmatic control. */
  swiperRef: React.RefObject<CardSwiperRef | null>;

  /** Content rendered inside the undo button. */
  renderUndo: () => ReactNode;
  /** Content rendered inside the reject (swipe left) button. */
  renderReject: () => ReactNode;
  /** Content rendered inside the approve (swipe right) button. */
  renderApprove: () => ReactNode;

  /** Style applied to the actions container row. */
  containerStyle?: ViewStyle;
  /** Style applied to each individual action button. */
  buttonStyle?: ViewStyle;
};
