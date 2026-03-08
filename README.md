# WhenBaro Frontend

A React Native (Expo) mobile app for tracking **Baro Ki'Teer** — the Warframe void trader. See what Baro is selling, wishlist items, browse historical offerings, check warframe.market prices, and get push notifications when he arrives with items you want.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Screens](#screens)
- [Services](#services)
- [Caching Strategy](#caching-strategy)
- [State Management](#state-management)
- [Testing](#testing)
- [Building](#building)
- [Configuration](#configuration)

---

## Features

- **Live Baro inventory** — see current offerings with prices, images, and wiki links
- **Countdown timer** — auto-refreshing arrival/departure countdown with backend polling
- **Wishlist** — save items to a local wishlist with optional push notifications
- **All items catalog** — browse every item Baro has ever sold
- **Search & filter** — filter by category, sort by popularity/reviews, full-text search
- **Item details** — offering history, credit/ducat prices, Warframe wiki link
- **Reviews & likes** — community reviews and like counts per item
- **Market data** — live warframe.market price statistics for eligible items
- **Push notifications** — alerts when Baro arrives with wishlisted items
- **Offline support** — SQLite-backed local cache for offline browsing

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 54 |
| Language | JavaScript (React 19.1, React Native 0.81) |
| Navigation | React Navigation 7 (Material Top Tabs + Native Stack) |
| Local DB | expo-sqlite (SQLite) |
| Secure Storage | expo-secure-store |
| Notifications | expo-notifications |
| Charts | react-native-chart-kit |
| Gestures | react-native-gesture-handler |
| SVG | react-native-svg + react-native-svg-transformer |
| Testing | Jest + jest-expo + @testing-library/react-native |

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** (v9+) or **yarn**
- **Expo CLI** — `npx expo` (comes with the Expo SDK)
- **Expo Go** app on your phone, or an Android emulator / iOS simulator

### Installation

```bash
cd whenbaro-frontend
npm install
```

### Environment Variables

Create a `.env` file or set these in your environment:

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL` | Backend API base URL (e.g., `https://your-app.azurewebsites.net/api`) |

### Running

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in browser
```

### Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## Project Structure

```
whenbaro-frontend/
├── App.js                      # Root component — DB init, providers, navigation
├── app.json                    # Expo config (splash, icons, plugins)
├── eas.json                    # EAS Build profiles
├── babel.config.js             # Babel preset (expo)
├── metro.config.js             # Metro bundler config (SVG transformer)
├── google-services.json        # Firebase config (Android push notifications)
│
├── assets/
│   ├── icons/                  # SVG icons (Baro icon, etc.)
│   └── imgs/                   # PNG images (logo, credit/ducat icons, backgrounds)
│
├── components/
│   ├── baro/                   # Baro-specific components
│   │   ├── BaroTimer.js        #   Arrival/departure countdown
│   │   └── InventoryList.js    #   Baro's current item list
│   ├── items/                  # Item display components
│   │   ├── ItemCard.js         #   Item list card
│   │   ├── ItemDetailHeader.js #   Detail screen header (back, wishlist)
│   │   ├── ItemDetailsTab.js   #   Details tab (prices, dates, wiki link)
│   │   ├── ItemDetailTabs.js   #   Tab bar for detail screen
│   │   ├── ItemMarketTab.js    #   Market price chart tab
│   │   ├── ItemReviewsTab.js   #   Reviews & likes tab
│   │   └── ReviewCard.js       #   Individual review display
│   ├── search/                 # Search & filter components
│   │   ├── CollapsibleSearchBar.js  # Animated search input
│   │   └── FilterMenu.js      #   Category/popularity filter modal
│   └── ui/                     # Shared UI primitives
│       ├── EmptyState.js       #   Empty list placeholder
│       └── Header.js           #   Screen header with safe area
│
├── constants/
│   └── items.js                # Cache TTLs, throttle timings, image URLs, excluded items
│
├── contexts/                   # React Context providers
│   ├── AllItemsContext.js      #   All-items state + cache management
│   ├── InventoryContext.js     #   Baro inventory + auto-polling
│   └── WishlistContext.js      #   Wishlist state + throttled backend sync
│
├── hooks/                      # Custom React hooks
│   ├── useItemFieldSync.js     #   Sync likes/reviews/wishlistCount across contexts
│   ├── useLike.js              #   Like/unlike with optimistic UI + throttle
│   └── useReviewManagement.js  #   Review CRUD with cooldown + edit state
│
├── navigation/
│   └── AppNavigator.js         # Tab + stack navigator setup, custom tab bar
│
├── screens/
│   ├── AllItemsScreen.js       # Browse all Baro items
│   ├── BaroScreen.js           # Current Baro inventory / countdown
│   ├── BaroAbsentScreen.js     # Baro-away state
│   ├── FeedbackScreen.js       # Email feedback form
│   ├── ItemDetailScreen.js     # Item detail (swipeable tabs)
│   ├── LoadingScreen.js        # App loading state
│   ├── SettingsScreen.js       # User preferences
│   └── WishlistScreen.js       # Saved wishlist items
│
├── services/                   # API layer
│   ├── api.js                  #   Re-exports all services
│   ├── apiConfig.js            #   Base URL, fetch/post wrappers
│   ├── baroService.js          #   Warframestat.us Baro API + simulation mode
│   ├── itemService.js          #   Items + Baro status endpoints
│   ├── likeService.js          #   Likes API (with in-memory cache)
│   ├── marketService.js        #   warframe.market API (with in-memory cache)
│   ├── pushNotificationService.js  # Expo notification registration
│   ├── reviewService.js        #   Reviews API (with in-memory cache)
│   ├── userService.js          #   Push token registration endpoints
│   └── wishlistService.js      #   Wishlist push token sync
│
├── styles/                     # StyleSheet files (mirrors component structure)
│   ├── App.styles.js
│   ├── components/
│   ├── navigation/
│   └── screens/
│
├── utils/                      # Utility functions
│   ├── dateUtils.js            #   Date formatting + relative time
│   ├── filterUtils.js          #   Search, filter, sort pipelines
│   ├── gestureHelpers.js       #   Gesture utility helpers
│   ├── logger.js               #   Production-safe console logger
│   ├── normalizeItem.js        #   API → app item schema normalization
│   ├── slugify.js              #   Item name → warframe.market slug
│   ├── storage.js              #   SQLite + SecureStore abstraction layer
│   └── userStorage.js          #   User settings read/write helpers
│
└── __tests__/                  # Jest test suites
    ├── components/             #   12 component tests
    ├── contexts/               #   3 context tests
    ├── hooks/                  #   3 hook tests
    ├── services/               #   7 service tests
    └── utils/                  #   6 utility tests
```

---

## Architecture

### App Initialization Flow

```
App.js mount
  → Initialize SQLite database (create tables, run migrations)
  → Generate or load device UID (SecureStore)
  → Register for push notifications
  → Render provider tree:
      WishlistProvider → AllItemsProvider → InventoryProvider → Navigation
```

### Data Flow

```
Backend API (Azure Functions)
  ↓ fetch
Service layer (apiConfig.js wrappers + in-memory caches)
  ↓ normalize
Context providers (React state + SQLite persistence)
  ↓ consume
Screens & Components (via useContext hooks)
```

### Key Patterns

- **Optimistic UI** — likes, wishlist toggles, and review counts update locally before backend confirmation
- **Throttle & debounce** — rapid interactions (likes, wishlist toggles) are collapsed into single backend calls
- **Stale-while-error** — if an API fetch fails, the app falls back to the SQLite cache
- **Auto-polling** — when Baro is about to arrive, the app polls the backend every 20 seconds until confirmed active
- **Write serialization** — all SQLite writes go through a queue (`withDbQueue`) to prevent concurrent access crashes

---

## Screens

| Screen | Description |
|---|---|
| **BaroScreen** | Shows Baro's current inventory when he's present, or a countdown timer with next arrival date. Supports pull-to-refresh, search, and category filtering. Highlights new items with a showcase. |
| **AllItemsScreen** | Browsable catalog of every item Baro has ever sold. Search, filter by category, sort by popularity. Persists filter state across sessions. |
| **WishlistScreen** | User's saved items. Syncs with backend for push notification targeting. Badge on tab shows how many wishlisted items Baro currently has. |
| **ItemDetailScreen** | Swipeable 3-tab view (Details / Reviews / Market). Details show prices, offering dates, and wiki link. Reviews support post/edit/delete with cooldowns. Market shows live price charts from warframe.market. |
| **SettingsScreen** | Display name, notification toggles (Baro alerts, wishlist alerts), auto-refresh toggle. |
| **FeedbackScreen** | Simple email feedback form. |

---

## Services

| Service | Endpoint / Source | Caching |
|---|---|---|
| `itemService` | Backend `/getAllItems`, `/getCurrent` | SQLite (1hr TTL) |
| `baroService` | warframestat.us `/pc/voidTrader/` | SecureStore (until next event date) |
| `reviewService` | Backend `/getReviews`, `/postReview`, etc. | In-memory (2min TTL, invalidated on mutations) |
| `likeService` | Backend `/getLikes`, `/likeItem`, `/unlikeItem` | In-memory (2min TTL, invalidated on mutations) |
| `marketService` | warframe.market `/v1/items/{slug}/statistics` | In-memory (5min TTL) |
| `wishlistService` | Backend `/wishlistPushTokens` | Local SQLite only |
| `pushNotificationService` | Expo + backend `/registerPushToken` | SecureStore (token) |

---

## Caching Strategy

The app uses a **multi-tier caching architecture**:

### Tier 1: In-Memory (Service Layer)
Short-lived `Map` caches in service files prevent redundant network calls when navigating back/forth:
- **Market data** — 5-minute TTL per item slug
- **Reviews** — 2-minute TTL per item ID (auto-invalidated on post/edit/delete)
- **Likes** — 2-minute TTL per item ID (auto-invalidated on like/unlike)

### Tier 2: SQLite (Persistent Cache)
Items are cached in a local SQLite database for offline access:
- **All items** — 1-hour TTL, uses `INSERT OR REPLACE` (no destructive clear-then-rewrite)
- **Wishlist items** — persisted indefinitely, flagged with `inWishlist = 1`
- **Schema migrations** — run on startup to add new columns (`offeringDates`, `uniqueName`, `link`)

### Tier 3: SecureStore (Lightweight State)
Small key-value data stored via Expo SecureStore:
- Device UID, username, theme, language
- Baro API response cache (until next arrival/departure)
- Last data refresh timestamp
- Push notification token
- Filter preferences

### Cache Invalidation
- **Time-based** — each tier has its own TTL
- **Event-based** — mutations (post review, like, wishlist toggle) immediately invalidate relevant caches
- **Pull-to-refresh** — force-refreshes bypass all caches
- **Auto-expiry** — Baro cache auto-invalidates when the arrival/departure date passes

---

## State Management

Three React Context providers manage global state:

| Context | Responsibility |
|---|---|
| `AllItemsProvider` | Fetches and caches all items; provides `updateItemLikes`, `updateItemReviewCount`, `updateItemWishlistCount` for cross-screen sync |
| `InventoryProvider` | Manages Baro's current inventory; handles auto-polling on arrival; matches inventory against all-items cache; re-matches when new items are added |
| `WishlistProvider` | Local wishlist state (SQLite-backed); throttled backend sync for push tokens; optimistic add/remove |

State updates (likes, reviews, wishlist counts) are **synced across all three contexts** simultaneously via the `useItemFieldSync` hook, ensuring consistency no matter which screen triggered the change.

---

## Testing

The test suite covers all layers:

```bash
npm test                 # Run all 31 test files
npm run test:coverage    # Generate coverage report
```

| Layer | Tests | Coverage |
|---|---|---|
| Components | 12 files | BaroTimer, SearchBar, FilterMenu, ItemCard variants, ReviewCard, etc. |
| Contexts | 3 files | AllItems cache flow, inventory matching, wishlist state |
| Hooks | 3 files | Like throttling, review management, field sync |
| Services | 7 files | API config, all service endpoints |
| Utils | 6 files | Date formatting, filters, normalization, slugify, logger |

---

## Building

The project uses [EAS Build](https://docs.expo.dev/build/introduction/) for production builds.

### Build Profiles (eas.json)

| Profile | Target | Output |
|---|---|---|
| `development` | Internal distribution | Debug APK (dev client) |
| `preview` | Internal distribution | Release APK |
| `production` | App stores | Release APK |

### Commands

```bash
npx eas build --profile development --platform android
npx eas build --profile preview --platform android
npx eas build --profile production --platform android
```

---

## Configuration

### app.json
- **Package name**: `com.whenbaro.app`
- **Orientation**: Portrait only
- **Background color**: `#0A0E1A`
- **Plugins**: expo-sqlite, expo-secure-store, expo-notifications

### metro.config.js
- SVG transformer enabled (`.svg` files import as React components)

### constants/items.js
- `CACHE_DURATION_MS` — All-items cache TTL (default: 1 hour)
- `LIKE_THROTTLE_MS` — Like action throttle (default: 3s)
- `REVIEW_COOLDOWN_MS` — Review submission cooldown (default: 3s)
- `WISHLIST_THROTTLE_MS` — Wishlist toggle throttle (default: 2s)
