# Aidas Corners - Project Context

## Project Overview

**Aidas Corners** is a comprehensive pastry order management application built with Expo and React Native, targeting iOS, Android, and web platforms. The app serves as a complete business management solution for pastry shops, focusing on order processing, inventory management, analytics, and AI-powered insights.

### Key Features
- Cross-platform compatibility (iOS, Android, Web)
- Modern and intuitive user interface with card-based design
- Real-time order management system
- Inventory and needs tracking
- Advanced analytics and statistics
- AI assistant for business insights
- Automatic app update checking with changelog
- Secure Firebase integration for real-time data
- Haptic feedback and smooth animations
- Multi-branch support with data organization by date

### Technology Stack
- **Framework**: Expo SDK 54.0.22 with React Native 0.81.5
- **Language**: TypeScript (strict mode enabled)
- **Navigation**: Expo Router with file-based routing
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Firebase Firestore
- **AI Integration**: Google Generative AI and Groq SDK
- **State Management**: React Hooks and Context API
- **Animations**: React Native Reanimated and Gesture Handler

## File Structure

```
aidas-corners/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Main tab navigation
│   ├── _layout.tsx        # Root layout with notifications
│   └── ...
├── components/            # Reusable UI components
│   ├── ai-assistant/      # AI feature components
│   ├── analytics/         # Analytics and charts
│   ├── orders/            # Order management components
│   ├── stocks/            # Stock management components
│   └── ...
├── utils/                 # Utility functions
├── services/              # Service classes
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── constants/             # Constants and configuration
├── assets/                # Images, fonts, and other assets
├── .expo/                 # Expo development files
└── ...
```

## Building and Running

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI

### Installation
```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Alternative run commands
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run on web browser
```

### Development Commands
- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run on web browser
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint
- `npm run reset-project` - Reset to initial state
- `npm run test-updater` - Test update system
- `npm run update-product-names` - Update product data

### Production Build
- Use EAS (Expo Application Services) for production builds:
```bash
eas build --platform android --profile production
```

## Development Conventions

### Naming Conventions
- PascalCase for React components
- camelCase for functions and variables
- kebab-case for file names
- TypeScript files use `.tsx` for components, `.ts` for utilities

### Code Organization
- Components are organized by feature in the `components` directory
- Pages follow Expo Router's file-based routing convention
- Hooks are stored in the `hooks` directory
- Types are defined in the `types` directory
- Constants are stored in the `constants` directory

### Styling
- NativeWind for styling (similar to Tailwind CSS)
- Theme-aware color system with light/dark mode support
- Consistent spacing using 8dp grid system
- Card-based design with proper elevation and visual hierarchy

### State Management
- React's built-in hooks (useState, useEffect, etc.) for component state
- Context API for global state when needed
- Firebase Firestore for persistent data storage

## Key Components

### AppUpdater Component
- Automatically checks for app updates on startup
- Compares local app version with Firebase-stored version
- Shows modal with changelog when updates are available
- Handles APK download links for Android updates

### Firebase Integration
- Comprehensive Firebase Firestore integration for data persistence
- Caching layer to reduce API calls and improve performance
- Batch operations for efficient data writes
- Date-based organization for orders (DD.MM.YYYY structure)

### Navigation Structure
- Stack navigator at root level with 6 main tabs
- Tab navigator with 6 primary screens:
  1. Ana Səhifə (Home) - Dashboard and quick actions
  2. Sifarişlər (Orders) - New order management and requests
  3. Cədvəl (Table) - Orders summary in tabular format
  4. Statistika (Statistics) - Product statistics and sales data
  5. Analizlər (Analytics) - Advanced data visualization
  6. AI Asistan - AI-powered insights and recommendations

### Performance Optimizations
- Memory caching layer with 15-minute expiry
- Batch Firestore operations for efficiency
- Lazy loading for large datasets
- Animated components running on UI thread
- Optimized rendering with proper state management

### Accessibility Features
- Minimum 44x44 touch targets
- WCAG AA compliant contrast ratios
- Semantic component structure
- Haptic feedback for interactions
- Support for reduced motion preferences

## Firebase Configuration

The app uses Firebase for real-time data storage with the following structure:
- `orders/` - Organized by date (DD.MM.YYYY) with branches as subcollections
- `needs/` - Inventory items tracking
- `needOrders/` - Daily needs organized by date
- `app_version/` - Update management
- `productCorrections/` - Product name variations and corrections
- `branches/` - Branch information

### Data Caching
The application implements a 15-minute memory cache to reduce Firebase API calls and improve performance for frequently accessed data like branches and product corrections.

### Security
- Firebase security rules (not visible in current files)
- Input validation for all user inputs
- Proper error handling and sanitization

## UI/UX Features

### Modern Design Elements
- Skeleteon loading states instead of full-screen spinners
- Smooth animations using React Native Reanimated
- Pull-to-refresh with haptic feedback
- Card-based layout with proper elevation
- Support for both light and dark modes
- Responsive design across all screen sizes

### User Experience Improvements
- Immediate visual feedback on all interactions
- Contextual error messages with recovery options
- Intuitive gesture controls (swipe, drag, tap)
- Clear visual hierarchy and information organization
- Progress indicators for long operations

## Testing and Quality Assurance

### Code Quality Tools
- ESLint with Expo configuration
- TypeScript strict mode
- Jest for unit testing
- Comprehensive linting setup

### Performance Monitoring
- Efficient animations running on UI thread
- Minimal re-renders through proper state management
- Optimized data fetching with caching
- Proper cleanup and memory management

## Internationalization

### Language Support
- Primary UI language: Azerbaijani
- Development comments: Turkish
- Date formatting: Localized DD.MM.YYYY format
- Supports right-to-left text layout capabilities

## Deployment and Distribution

### Build Profiles
- Development: Internal testing builds
- Preview: Pre-release builds for testing
- Production: App store ready builds

### Update Management
- Over-the-air (OTA) update support
- Version comparison with Firebase
- Changelog display for users
- Automatic update checking on app startup

## Architecture Notes

### Data Flow
- Components request data through utility functions
- Firebase utilities handle caching and network operations
- Components update state based on Firebase responses
- Changes are synced back to Firebase with proper error handling

### Error Handling
- Network error detection and contextual messages
- Server error handling with recovery options
- Graceful degradation for offline scenarios
- Comprehensive error logging for debugging

### Component Structure
- Reusable components in the `components` directory
- Feature-specific component grouping
- Clear separation between UI and business logic
- Proper prop drilling and context usage patterns

## Key Configuration Files

- `app.json` - Expo configuration and app metadata
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript compilation options
- `eas.json` - Expo Application Services build configuration
- `metro.config.js` - Metro bundler configuration
- `babel.config.js` - Babel transpilation configuration

## Special Features

### App Update System
The app checks Firebase for new versions on startup and shows a modal with changelog if updates are available. It includes APK download links and handles the entire update process seamlessly.

### AI Integration
The application includes AI-powered insights using both Google Generative AI and Groq SDK for intelligent business recommendations and analytics.

### Advanced Analytics
Comprehensive analytics with data visualization, sales tracking, and predictive insights to help pastry shop owners make better business decisions.

### Order Correction System
A sophisticated product correction system that handles variations and standardizations, allowing for consistent data management across different naming conventions.