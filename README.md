# Wherebaro Frontend

A React Native application built with Expo.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo Go app on your mobile device (iOS or Android)

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Running the App

Start the development server:

```bash
npm start
```

This will open Expo Dev Tools in your browser. From there you can:

- Press `a` to run on Android emulator
- Press `i` to run on iOS simulator
- Scan the QR code with Expo Go app on your phone

#### Platform-specific commands

```bash
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run on web
```

## Project Structure

```
wherebaro-frontend/
├── assets/          # Images, fonts, and other static assets
├── App.js           # Main application component
├── app.json         # Expo configuration
├── package.json     # Dependencies and scripts
└── babel.config.js  # Babel configuration
```

## Development

The app entry point is `App.js`. Start editing this file to begin developing your application.

## Notes

- Asset placeholders (icon.png, splash.png, etc.) referenced in app.json should be added to the `assets/` folder
- The app uses Expo SDK ~52.0.0 and React Native 0.76.5
