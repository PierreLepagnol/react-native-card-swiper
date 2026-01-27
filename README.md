# react-native-card-swiper

A performant, Tinder-like card swiper for React Native. Built entirely on `react-native-reanimated` and `react-native-gesture-handler` — all animations run on the UI thread for 60 fps swiping.

## Features

- **UI-thread animations** — drag, rotation, fly-out, and scale all run via Reanimated worklets. Zero JS-thread blocking.
- **Instant deck advancement** — the next card becomes interactive immediately while the swiped card animates out in the background (200 ms fly-out).
- **Undo support** — `swipeBack()` restores the previously swiped card from an internal undo stack.
- **Imperative API** — programmatic `swipeLeft()`, `swipeRight()`, and `swipeBack()` via ref.
- **Windowed rendering** — only 5 cards are mounted at once (configurable), with the window shifting forward automatically. Handles large datasets without memory issues.
- **Customizable overlays** — provide your own right/left overlay content via render props, or use the built-in defaults.
- **Fully typed** — generic `CardSwiper<T>` infers your item type throughout.
- **Zero runtime dependencies** — only peer dependencies on React Native core and animation libraries.

## Installation

```bash
bun add react-native-card-swiper
```

### Peer dependencies

Make sure these are installed in your project:

```bash
bun add react-native-reanimated react-native-gesture-handler
```

| Peer dependency | Minimum version |
|---|---|
| `react` | >= 18.0.0 |
| `react-native` | >= 0.70.0 |
| `react-native-reanimated` | >= 3.0.0 |
| `react-native-gesture-handler` | >= 2.0.0 |

> Your app must be wrapped in a `<GestureHandlerRootView>` from `react-native-gesture-handler` at the root level.

## Quick start

```tsx
import { useRef } from "react";
import { Text, View } from "react-native";
import { CardSwiper, SwiperActions } from "react-native-card-swiper";
import type { CardSwiperRef } from "react-native-card-swiper";

type MyItem = {
  key: string;
  title: string;
  color: string;
};

const DATA: MyItem[] = [
  { key: "1", title: "Card One", color: "#FF6B6B" },
  { key: "2", title: "Card Two", color: "#4ECDC4" },
  { key: "3", title: "Card Three", color: "#45B7D1" },
];

export default function App() {
  const swiperRef = useRef<CardSwiperRef>(null);

  return (
    <View style={{ flex: 1 }}>
      <CardSwiper
        ref={swiperRef}
        data={DATA}
        renderCard={(item) => (
          <View style={{ flex: 1, backgroundColor: item.color, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 24, color: "white" }}>{item.title}</Text>
          </View>
        )}
        onSwipeRight={(i) => console.log("Liked card", i)}
        onSwipeLeft={(i) => console.log("Passed card", i)}
        onSwipedAll={() => console.log("All cards swiped!")}
        onIndexChange={(i) => console.log("Active index:", i)}
      />

      <SwiperActions
        swiperRef={swiperRef}
        renderUndo={() => <Text style={{ color: "white", fontSize: 18 }}>↩</Text>}
        renderReject={() => <Text style={{ color: "#e53935", fontSize: 22 }}>✕</Text>}
        renderApprove={() => <Text style={{ color: "#43a047", fontSize: 20 }}>♥</Text>}
      />
    </View>
  );
}
```

## API Reference

### `<CardSwiper<T>>`

The main swipeable card deck component. Generic over your item type `T`, which must extend `CardItem` (i.e. have a `key: string | number` field).

#### Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `data` | `T[]` | Yes | — | Array of items. Each must have a unique `key`. |
| `renderCard` | `(item: T) => ReactNode` | Yes | — | Render function for each card's content. |
| `onSwipeRight` | `(cardIndex: number) => void` | Yes | — | Called when a card is swiped right. |
| `onSwipeLeft` | `(cardIndex: number) => void` | Yes | — | Called when a card is swiped left. |
| `onSwipedAll` | `() => void` | Yes | — | Called when all cards have been swiped. |
| `onIndexChange` | `(index: number) => void` | Yes | — | Called whenever the active card index changes (swipe or undo). |
| `renderRightOverlay` | `() => ReactNode` | No | Green "KEEP" label | Custom content for the right-swipe overlay. Opacity is animated automatically. |
| `renderLeftOverlay` | `() => ReactNode` | No | Red "PASS" label | Custom content for the left-swipe overlay. Opacity is animated automatically. |
| `swipeThreshold` | `number` | No | `0.3` | Fraction of screen width to trigger a swipe (0–1). |
| `maxRotation` | `number` | No | `15` | Maximum card rotation in degrees during drag. |
| `behindCardScale` | `number` | No | `0.95` | Scale of the card behind the top card when idle. Animates to 1.0 as the top card moves. |
| `windowSize` | `number` | No | `5` | Number of cards rendered in the sliding window. |
| `springConfig` | `WithSpringConfig` | No | `{ damping: 20, stiffness: 200 }` | Reanimated spring config for the snap-back animation. |
| `flyOutConfig` | `WithTimingConfig` | No | `{ duration: 200, easing: Easing.out(Easing.cubic) }` | Reanimated timing config for the fly-out animation. |
| `containerStyle` | `ViewStyle` | No | — | Style applied to the outer container. |
| `cardStyle` | `ViewStyle` | No | — | Style applied to each card wrapper. |

#### Ref methods (`CardSwiperRef`)

Access these via a React ref:

```tsx
const swiperRef = useRef<CardSwiperRef>(null);
```

| Method | Description |
|---|---|
| `swipeRight()` | Programmatically swipe the top card to the right. |
| `swipeLeft()` | Programmatically swipe the top card to the left. |
| `swipeBack()` | Undo the last swipe and restore the previous card. No-op if the undo stack is empty. |

### `<SwiperActions>`

A row of three action buttons (undo, reject, approve) wired to a `CardSwiper` ref. You provide your own button content via render props — no icon library dependency.

#### Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `swiperRef` | `RefObject<CardSwiperRef \| null>` | Yes | — | Ref to the `CardSwiper` instance. |
| `renderUndo` | `() => ReactNode` | Yes | — | Content for the undo button (e.g. an icon). |
| `renderReject` | `() => ReactNode` | Yes | — | Content for the reject button. |
| `renderApprove` | `() => ReactNode` | Yes | — | Content for the approve button. |
| `containerStyle` | `ViewStyle` | No | — | Style for the actions row container. |
| `buttonStyle` | `ViewStyle` | No | — | Style applied to each action button. |

### `<ActionButton>`

A standalone circular pressable button. Used internally by `SwiperActions`, but exported for custom layouts.

#### Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `onPress` | `() => void` | Yes | — | Callback on press. |
| `children` | `ReactNode` | Yes | — | Button content (icon, text, etc.). |
| `style` | `ViewStyle` | No | — | Additional styles merged onto the button. |
| `accessibilityLabel` | `string` | No | — | Accessibility label for screen readers. |

Default button style: 50px round, dark gray (`#3A3D45`), with elevation shadow.

### `CardItem`

The constraint for items in the `data` array:

```ts
type CardItem = { key: string | number };
```

Add any additional fields your cards need — they'll be passed to `renderCard`.

## Custom overlays

Override the default "KEEP" / "PASS" overlays with your own content. The swiper handles opacity animation automatically.

```tsx
<CardSwiper
  data={data}
  renderCard={renderCard}
  renderRightOverlay={() => (
    <View style={{ padding: 16, backgroundColor: "rgba(0,255,0,0.2)", borderRadius: 12 }}>
      <Text style={{ color: "green", fontSize: 32, fontWeight: "bold" }}>LIKE</Text>
    </View>
  )}
  renderLeftOverlay={() => (
    <View style={{ padding: 16, backgroundColor: "rgba(255,0,0,0.2)", borderRadius: 12 }}>
      <Text style={{ color: "red", fontSize: 32, fontWeight: "bold" }}>NOPE</Text>
    </View>
  )}
  // ...callbacks
/>
```

## Animation tuning

Fine-tune the swipe feel by adjusting these props:

```tsx
<CardSwiper
  swipeThreshold={0.25}         // More sensitive — 25% of screen width
  maxRotation={20}              // More dramatic rotation
  behindCardScale={0.9}         // More visible scale difference
  springConfig={{ damping: 15, stiffness: 300 }}  // Snappier bounce-back
  flyOutConfig={{ duration: 300 }}                 // Slower fly-out
  // ...
/>
```

## Architecture notes

- **Windowed rendering**: Only `windowSize` cards are mounted at once. The window shifts forward as cards are consumed, preventing memory buildup with large datasets.
- **Zero-delay advancement**: When a swipe commits, the deck index advances immediately on the UI thread. The fly-out animation runs in the background via `withTiming`. The next card is interactive with zero wait.
- **Worklet-driven**: The `commitSwipe` function runs as a Reanimated worklet. The JS thread is only notified after the fact via `runOnJS` for bookkeeping (undo stack, callbacks).
- **Stable gesture**: The `Gesture.Pan()` is memoized and the `GestureDetector` never remounts, avoiding gesture handler re-registration.

## License

MIT
