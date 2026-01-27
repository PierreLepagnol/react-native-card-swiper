import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  interpolate,
  runOnJS,
  Extrapolation,
  cancelAnimation,
  type SharedValue,
  type WithSpringConfig,
  type WithTimingConfig,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import type { CardItem, CardSwiperProps, CardSwiperRef } from "./types";

// ---- Defaults ----

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DEFAULT_SWIPE_THRESHOLD = 0.3;
const DEFAULT_MAX_ROTATION = 15;
const DEFAULT_BEHIND_SCALE = 0.95;
const DEFAULT_WINDOW_SIZE = 5;

const DEFAULT_SPRING: WithSpringConfig = { damping: 20, stiffness: 200 };
const DEFAULT_FLY_OUT: WithTimingConfig = {
  duration: 200,
  easing: Easing.out(Easing.cubic),
};

// ---- Default overlays ----

function DefaultRightOverlay() {
  return <Text style={defaultStyles.keepText}>KEEP</Text>;
}

function DefaultLeftOverlay() {
  return <Text style={defaultStyles.passText}>PASS</Text>;
}

// ---- Individual SwipeCard ----
// Each card determines its own animated style from the shared activeIndex.
// The most recently swiped card (rel === -1) animates out via outgoingX/Y.
// No React re-render is needed when the deck advances.

type SwipeCardInternalProps<T extends CardItem> = {
  item: T;
  index: number;
  activeIndex: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  outgoingX: SharedValue<number>;
  outgoingY: SharedValue<number>;
  renderCard: (item: T) => ReactNode;
  renderRightOverlay?: () => ReactNode;
  renderLeftOverlay?: () => ReactNode;
  maxRotation: number;
  behindCardScale: number;
  swipeThresholdPx: number;
};

function SwipeCardInner<T extends CardItem>({
  item,
  index,
  activeIndex,
  translateX,
  translateY,
  outgoingX,
  outgoingY,
  renderCard,
  renderRightOverlay,
  renderLeftOverlay,
  maxRotation,
  behindCardScale,
  swipeThresholdPx,
}: SwipeCardInternalProps<T>) {
  const cardStyle = useAnimatedStyle(() => {
    const rel = index - activeIndex.value;

    // Most recently swiped card — fly-out animation
    if (rel === -1) {
      const rotate = interpolate(
        outgoingX.value,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-maxRotation, 0, maxRotation],
        Extrapolation.CLAMP,
      );
      return {
        opacity: 1,
        zIndex: 99,
        transform: [
          { translateX: outgoingX.value },
          { translateY: outgoingY.value },
          { rotate: `${rotate}deg` },
        ],
      };
    }

    // Older swiped cards — hidden
    if (rel < -1) {
      return { opacity: 0, zIndex: 0, transform: [{ scale: 0.9 }] };
    }

    // Top card — follows the gesture
    if (rel === 0) {
      const rotate = interpolate(
        translateX.value,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-maxRotation, 0, maxRotation],
        Extrapolation.CLAMP,
      );
      return {
        opacity: 1,
        zIndex: 100,
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { rotate: `${rotate}deg` },
        ],
      };
    }

    // Behind cards — scale up when the top card moves away
    const scale =
      rel === 1
        ? interpolate(
            Math.abs(translateX.value),
            [0, swipeThresholdPx],
            [behindCardScale, 1],
            Extrapolation.CLAMP,
          )
        : behindCardScale;

    return {
      opacity: 1,
      zIndex: 100 - rel,
      transform: [{ scale }],
    };
  });

  // Right overlay opacity
  const rightOverlayStyle = useAnimatedStyle(() => {
    const isTop = index - activeIndex.value === 0;
    return {
      opacity: isTop
        ? interpolate(
            translateX.value,
            [0, swipeThresholdPx],
            [0, 1],
            Extrapolation.CLAMP,
          )
        : 0,
    };
  });

  // Left overlay opacity
  const leftOverlayStyle = useAnimatedStyle(() => {
    const isTop = index - activeIndex.value === 0;
    return {
      opacity: isTop
        ? interpolate(
            translateX.value,
            [0, -swipeThresholdPx],
            [0, 1],
            Extrapolation.CLAMP,
          )
        : 0,
    };
  });

  const rightOverlayContent = renderRightOverlay ? (
    renderRightOverlay()
  ) : (
    <DefaultRightOverlay />
  );

  const leftOverlayContent = renderLeftOverlay ? (
    renderLeftOverlay()
  ) : (
    <DefaultLeftOverlay />
  );

  return (
    <Animated.View style={[defaultStyles.cardWrapper, cardStyle]}>
      <View style={defaultStyles.renderCardContainer}>{renderCard(item)}</View>

      <Animated.View
        style={[
          defaultStyles.overlayLabelContainer,
          defaultStyles.overlayKeep,
          rightOverlayStyle,
        ]}
        pointerEvents="none"
      >
        {rightOverlayContent}
      </Animated.View>

      <Animated.View
        style={[
          defaultStyles.overlayLabelContainer,
          defaultStyles.overlayOut,
          leftOverlayStyle,
        ]}
        pointerEvents="none"
      >
        {leftOverlayContent}
      </Animated.View>
    </Animated.View>
  );
}

const SwipeCard = React.memo(SwipeCardInner) as typeof SwipeCardInner;

// ---- Main CardSwiper ----

function CardSwiperInner<T extends CardItem>(
  {
    data,
    renderCard,
    renderRightOverlay,
    renderLeftOverlay,
    onSwipeRight,
    onSwipeLeft,
    onSwipedAll,
    onIndexChange,
    swipeThreshold = DEFAULT_SWIPE_THRESHOLD,
    maxRotation = DEFAULT_MAX_ROTATION,
    behindCardScale = DEFAULT_BEHIND_SCALE,
    windowSize = DEFAULT_WINDOW_SIZE,
    springConfig = DEFAULT_SPRING,
    flyOutConfig = DEFAULT_FLY_OUT,
    containerStyle,
    cardStyle: _cardStyle,
  }: CardSwiperProps<T>,
  ref: React.ForwardedRef<CardSwiperRef>,
) {
  const swipeThresholdPx = SCREEN_WIDTH * swipeThreshold;
  const swipeOutX = SCREEN_WIDTH * 1.5;

  // ---- Stable callback refs ----
  const cbRef = useRef({ onSwipeRight, onSwipeLeft, onSwipedAll, onIndexChange });
  cbRef.current = { onSwipeRight, onSwipeLeft, onSwipedAll, onIndexChange };

  const dataRef = useRef(data);
  dataRef.current = data;

  // Undo history (JS-side only)
  const undoStack = useRef<number[]>([]);

  // ---- Shared values (live on the UI thread) ----
  const activeIndex = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const outgoingX = useSharedValue(0);
  const outgoingY = useSharedValue(0);

  // ---- Render window ----
  const [windowStart, setWindowStart] = useState(0);

  // ---- JS-side bookkeeping (called via runOnJS) ----
  const onSwipeCompleteJS = useCallback(
    (direction: "left" | "right", swipedIndex: number) => {
      undoStack.current.push(swipedIndex);

      if (direction === "right") {
        cbRef.current.onSwipeRight(swipedIndex);
      } else {
        cbRef.current.onSwipeLeft(swipedIndex);
      }

      const nextIndex = swipedIndex + 1;
      cbRef.current.onIndexChange(nextIndex);

      if (nextIndex >= dataRef.current.length) {
        cbRef.current.onSwipedAll();
      }

      // Shift the render window forward when half is consumed
      setWindowStart((prev) => {
        if (nextIndex - prev >= Math.floor(windowSize / 2)) {
          return nextIndex;
        }
        return prev;
      });
    },
    [windowSize],
  );

  // ---- Swipe commit worklet ----
  // Runs entirely on the UI thread. Advances the deck INSTANTLY
  // and fires the fly-out animation in the background.
  const commitSwipe = useCallback(
    (direction: "left" | "right") => {
      "worklet";
      const swipedIdx = activeIndex.value;
      const targetX = direction === "right" ? swipeOutX : -swipeOutX;

      // 1. Capture current gesture position for the outgoing card
      outgoingX.value = translateX.value;
      outgoingY.value = translateY.value;

      // 2. Advance the deck — next card is immediately interactive
      activeIndex.value = swipedIdx + 1;

      // 3. Reset gesture for the new top card
      translateX.value = 0;
      translateY.value = 0;

      // 4. Fire-and-forget fly-out on the outgoing card
      outgoingX.value = withTiming(targetX, flyOutConfig);

      // 5. Bridge to JS for bookkeeping (async, non-blocking)
      runOnJS(onSwipeCompleteJS)(direction, swipedIdx);
    },
    [
      activeIndex,
      translateX,
      translateY,
      outgoingX,
      outgoingY,
      onSwipeCompleteJS,
      swipeOutX,
      flyOutConfig,
    ],
  );

  // ---- Pan Gesture ----
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          translateX.value = e.translationX;
          translateY.value = e.translationY;
        })
        .onEnd(() => {
          if (translateX.value > swipeThresholdPx) {
            commitSwipe("right");
          } else if (translateX.value < -swipeThresholdPx) {
            commitSwipe("left");
          } else {
            translateX.value = withSpring(0, springConfig);
            translateY.value = withSpring(0, springConfig);
          }
        }),
    [translateX, translateY, commitSwipe, swipeThresholdPx, springConfig],
  );

  // ---- Imperative API ----
  useImperativeHandle(
    ref,
    () => ({
      swipeRight() {
        outgoingX.value = 0;
        outgoingY.value = 0;
        commitSwipe("right");
      },
      swipeLeft() {
        outgoingX.value = 0;
        outgoingY.value = 0;
        commitSwipe("left");
      },
      swipeBack() {
        const prevIndex = undoStack.current.pop();
        if (prevIndex == null) return;

        cancelAnimation(outgoingX);
        cancelAnimation(outgoingY);
        outgoingX.value = 0;
        outgoingY.value = 0;

        activeIndex.value = prevIndex;
        translateX.value = 0;
        translateY.value = 0;

        cbRef.current.onIndexChange(prevIndex);
        setWindowStart((prev) => Math.min(prev, prevIndex));
      },
    }),
    [translateX, translateY, activeIndex, outgoingX, outgoingY, commitSwipe],
  );

  // ---- Render ----
  const windowEnd = Math.min(windowStart + windowSize, data.length);
  const windowCards = data.slice(windowStart, windowEnd);

  if (windowCards.length === 0) {
    return <View style={[defaultStyles.container, containerStyle]} />;
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[defaultStyles.container, containerStyle]}>
        {[...windowCards].reverse().map((item, reversedI) => {
          const i = windowCards.length - 1 - reversedI;
          const absoluteIndex = windowStart + i;
          return (
            <SwipeCard
              key={item.key}
              item={item}
              index={absoluteIndex}
              activeIndex={activeIndex}
              translateX={translateX}
              translateY={translateY}
              outgoingX={outgoingX}
              outgoingY={outgoingY}
              renderCard={renderCard}
              renderRightOverlay={renderRightOverlay}
              renderLeftOverlay={renderLeftOverlay}
              maxRotation={maxRotation}
              behindCardScale={behindCardScale}
              swipeThresholdPx={swipeThresholdPx}
            />
          );
        })}
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * A Tinder-like card swiper with UI-thread animations, undo support,
 * and an imperative API for programmatic swipes.
 *
 * @example
 * ```tsx
 * const swiperRef = useRef<CardSwiperRef>(null);
 *
 * <CardSwiper
 *   ref={swiperRef}
 *   data={items}
 *   renderCard={(item) => <MyCard item={item} />}
 *   onSwipeRight={(i) => console.log("liked", i)}
 *   onSwipeLeft={(i) => console.log("passed", i)}
 *   onSwipedAll={() => console.log("done")}
 *   onIndexChange={(i) => console.log("now at", i)}
 * />
 * ```
 */
export const CardSwiper = React.memo(
  forwardRef(CardSwiperInner),
) as <T extends CardItem>(
  props: CardSwiperProps<T> & { ref?: React.Ref<CardSwiperRef> },
) => React.ReactElement | null;

// ---- Styles ----

const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    width: "95%",
    height: "90%",
    borderRadius: 16,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  renderCardContainer: {
    borderRadius: 16,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  overlayLabelContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayKeep: {
    backgroundColor: "rgba(67, 160, 71, 0.15)",
  },
  keepText: { color: "#43a047", fontSize: 28, fontWeight: "bold" },
  overlayOut: {
    backgroundColor: "rgba(229, 57, 53, 0.15)",
  },
  passText: { color: "#e53935", fontSize: 28, fontWeight: "bold" },
});
