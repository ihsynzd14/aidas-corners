# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aidas Corners is a modern Pastry Order Management application built with Expo and React Native. The app is designed for managing pastry orders, inventory, and analytics with an Azerbaijani language interface and Turkish development environment.

## Available Commands

### Development
```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run on web
```

### Testing & Quality
```bash
npm test           # Run Jest tests
npm run lint       # Run ESLint
```

### Maintenance Scripts
```bash
npm run reset-project              # Reset project to initial state
npm run test-updater               # Test the app update system
npm run update-product-names       # Update product names in Firebase
npm run update-dubai-product       # Alternative product update script
```

### Build & Deploy
```bash
eas build --platform android --profile preview    # Build preview APK
eas build --platform android --profile production # Build production APK
```

## Architecture

### Tech Stack
- **Framework**: Expo (54.0.22) with React Native (0.81.5)
- **Language**: TypeScript (strict mode enabled)
- **Navigation**: Expo Router with file-based routing and tabs layout
- **Styling**: NativeWind (Tailwind CSS)
- **Backend**: Firebase (Firestore) for real-time data
- **AI Integration**: Google Generative AI and Groq SDK

### Directory Structure
```
app/                    # Expo Router file-based routing
├── (tabs)/            # Tab navigation screens (6 main tabs)
├── components/        # App-specific components
├── pages/            # Additional pages
└── _layout.tsx       # Root layout

components/            # Shared UI components
├── ui/               # Base UI components
├── ai-assistant/     # AI assistant features
├── analytics/        # Analytics components
├── needs/            # Inventory/needs management
├── orders/           # Order management
├── settings/         # Settings components
└── stocks/           # Stock management

utils/                # Utility functions
├── firebase.ts       # Firebase configuration
├── needs-api.ts      # Needs API operations
└── orderCorrection.ts
```

### Key Features by Tab
1. **Ana Səhifə** (Home): Main navigation hub
2. **Sifarişlər** (Orders): New order management and requests
3. **Cədvəl** (Table): Orders summary with tabular view
4. **Statistika** (Statistics): Product statistics and sales analytics
5. **Analizlər** (Analytics): Advanced data visualization
6. **AI Asistan**: AI-powered insights and recommendations

## Development Guidelines

### Language & Localization
- **Development Communication**: Turkish (as per .cursorrules)
- **UI Language**: Azerbaijani for all user-facing text
- **Code Comments**: Turkish preferred

### Code Style
- Use functional components and hooks over class components
- Write type-safe TypeScript code with strict mode
- Use camelCase for variables/functions, PascalCase for components
- Organize files by feature, grouping related components
- Avoid using `any` type - strive for precise types

### Performance Optimization
- Use `React.memo()` for components with static props
- Optimize FlatLists with `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize`
- Minimize `useEffect`, `useState`, and heavy computations in render methods
- Avoid anonymous functions in `renderItem` or event handlers

### Firebase Integration
- **Project ID**: aidascorner-71243
- **Collections**: `orders`, `branches`, `app_version`
- **Features**: Real-time data, automatic updates, version management

## App Update System

The app includes an automatic update checker:
1. Compares current app version (app.json) with Firebase `app_version` collection
2. Shows update modal when newer version is available
3. Directs users to APK download URL

**Test with**: `npm run test-updater`

## Build Configuration

### Expo Configuration
- **Version**: 1.4.1
- **Orientation**: Portrait only
- **New Architecture**: Enabled
- **Platforms**: iOS, Android, Web
- **Update Channel**: Production with OTA updates

### Android Permissions
The app uses comprehensive permissions for file access and external storage operations.

## Design System

### Color Scheme
- **Primary**: Soft pink (#FF9494) - pastry theme
- **Secondary**: Light pink (#FFC3C3)
- **Background**: Warm cream (#FFF5E4) light mode
- **Dark Mode**: Dark chocolate (#151718)
- **UI Components**: Custom themed components with gradients

### Navigation
- Custom tab bar with haptic feedback
- File-based routing with Expo Router
- 6 main tabs with Azerbaijani labels

## Testing

Run tests with `npm test`. The project uses Jest for unit testing.

## Important Notes

- The app is proprietary to Aidas Corners - permission required for external contributions
- UI text must be in Azerbaijani, development communication in Turkish
- Firebase is critical for core functionality - ensure proper configuration
- The app supports OTA updates through EAS
- All new features should follow the existing pastry-themed design system