# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-29

### Added
- Initial release of react-native-card-swiper
- `CardSwiper` component with Tinder-like swipe mechanics
- UI-thread animations via react-native-reanimated
- Imperative API (`swipeLeft()`, `swipeRight()`, `swipeBack()`)
- Undo support with internal undo stack
- Windowed rendering for handling large datasets
- Customizable overlays via render props
- `SwiperActions` component with undo/reject/approve buttons
- `ActionButton` standalone component
- Full TypeScript support with generic types
- Configurable swipe threshold, rotation, and animations
- Zero runtime dependencies (peer dependencies only)

### Features
- **UI-thread animations**: All animations run on the UI thread for 60 fps performance
- **Instant deck advancement**: Next card becomes interactive immediately
- **Undo support**: Restore previously swiped cards
- **Windowed rendering**: Only 5 cards mounted at once (configurable)
- **Fully typed**: Generic `CardSwiper<T>` infers item types

### Fixed
- Overlay border radius and overflow handling
- Prevented overlay from overflowing card boundaries
- Restructured overlay to apply borderRadius to background layer

## [Unreleased]

### Planned
- Vertical swipe support
- Custom swipe directions
- Haptic feedback integration
- Swipe velocity configuration
- Card stack animations

---

## Version History

- **0.1.0** - Initial release (2026-01-29)

[0.1.0]: https://github.com/yourusername/react-native-card-swiper/releases/tag/v0.1.0
