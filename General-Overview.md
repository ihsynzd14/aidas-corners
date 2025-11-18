# Aidas Corners - General Overview

## 📋 Project Summary

**Aidas Corners** is a comprehensive pastry order management application built with modern React Native and Expo technologies. The application serves as a complete business management solution for pastry shops, focusing on order processing, inventory management, analytics, and AI-powered insights.

### 🎯 Business Purpose
- **Order Management**: Streamline pastry order processing and tracking
- **Inventory Control**: Monitor stock levels and ingredient needs
- **Analytics & Reporting**: Generate sales statistics and business insights
- **AI-Powered Insights**: Leverage artificial intelligence for business recommendations
- **Multi-Location Support**: Manage multiple branches and locations

## 🏗️ Technical Architecture

### Core Technologies
- **Framework**: Expo SDK 54.0.22 with React Native 0.81.5
- **Language**: TypeScript (strict mode enabled)
- **Navigation**: Expo Router with file-based routing system
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Firebase Firestore for real-time database operations
- **AI Integration**: Google Generative AI and Groq SDK for intelligent features

### Development Environment
- **Build System**: Metro bundler with TypeScript compilation
- **Package Manager**: npm with comprehensive dependency management
- **Code Quality**: ESLint with Expo configuration, Jest for testing
- **Platform Support**: iOS, Android, and Web deployment

## 📱 Application Structure

### Navigation Architecture
The app uses a hierarchical navigation structure with:

1. **Stack Navigator** (Root Level)
   - Main tab navigation container
   - Settings screen
   - 404 error handling

2. **Tab Navigator** (6 Main Tabs)
   - **Ana Səhifə** (Home): Dashboard and quick actions
   - **Sifarişlər** (Orders): New order management and requests
   - **Cədvəl** (Table): Orders summary in tabular format
   - **Statistika** (Statistics): Product statistics and sales data
   - **Analizlər** (Analytics): Advanced data visualization
   - **AI Asistan**: AI-powered insights and recommendations

### File-Based Routing System
```
app/
├── _layout.tsx              # Root layout with notifications and updates
├── (tabs)/                  # Tab navigation screens
│   ├── _layout.tsx         # Tab bar configuration
│   ├── index.tsx           # Home screen
│   ├── new_orders.tsx      # Order management
│   ├── orders_summary.tsx  # Table view
│   ├── product_statistics.tsx # Statistics
│   ├── analytics.tsx       # Analytics
│   └── ai_assistant.tsx    # AI assistant
├── settings.tsx            # Settings screen
├── notification_history.tsx # Notification history
└── pages/                  # Additional pages
    ├── branches.tsx        # Branch management
    ├── daily-needs.tsx     # Daily needs tracking
    ├── needs.tsx          # Needs management
    └── products_list.tsx   # Product catalog
```

## 🎨 Design System

### Color Scheme
- **Primary Colors**: Soft pink palette (`#FF9494`, `#FFC3C3`) reflecting pastry theme
- **Background Colors**: Warm cream (`#FFF5E4`) and clean whites
- **Dark Mode**: Deep chocolate (`#151718`) and pure blacks
- **Accent Colors**: Vibrant gradients for interactive elements

### UI Components Architecture
```
components/
├── ui/                     # Base UI components
│   ├── icons/             # Custom icon set
│   ├── navigation/        # Navigation components
│   └── [base components]  # Reusable UI elements
├── ai-assistant/          # AI feature components
├── analytics/             # Analytics and charts
├── branches/              # Branch management
├── needs/                 # Inventory/needs tracking
├── orders/                # Order management
├── settings/              # Settings components
├── statistics/            # Statistics components
└── stocks/                # Stock management
```

## 🔧 Core Features

### 1. Order Management System
- **Real-time Order Processing**: Live order updates and notifications
- **Multi-Branch Support**: Manage orders across multiple locations
- **Order Correction**: Edit and update existing orders
- **Export Functionality**: Generate Excel reports for orders

### 2. Inventory & Needs Management
- **Stock Monitoring**: Track ingredient levels and stock status
- **Daily Needs**: Manage daily ingredient requirements
- **Market Selection**: Choose suppliers and compare prices
- **Automated Alerts**: Notifications for low stock items

### 3. Analytics & Statistics
- **Sales Analytics**: Comprehensive sales data visualization
- **Product Performance**: Track best-selling items
- **Revenue Tracking**: Monitor financial performance
- **Trend Analysis**: Identify business patterns and trends

### 4. AI Assistant Integration
- **Intelligent Insights**: AI-powered business recommendations
- **Predictive Analytics**: Forecast demand and inventory needs
- **Natural Language Processing**: Conversational AI interface
- **Smart Suggestions**: Automated business improvement suggestions

### 5. App Update System
- **Automatic Updates**: OTA (Over-The-Air) update checking
- **Version Management**: Firebase-based version control
- **Changelog Display**: Show update details to users
- **Seamless Updates**: Minimal disruption to user experience

## 🔗 Backend Integration

### Firebase Configuration
- **Project ID**: `aidascorner-71243`
- **Database Collections**:
  - `orders`: Order data with date-based organization
  - `branches`: Branch information and locations
  - `needs`: Inventory and needs tracking
  - `needOrders`: Daily needs orders
  - `app_version`: Update management

### Data Structure
```
orders/
├── DD.MM.YYYY/           # Date-based organization
│   └── branches/
│       ├── branch1/     # Branch-specific orders
│       └── branch2/
needs/                   # Inventory items
needOrders/
├── DD.MM.YYYY/          # Daily needs by date
│   └── needs_list/      # Needs for that day
app_version/            # Update management
```

### Performance Optimizations
- **Memory Caching**: 15-minute cache for frequently accessed data
- **Batch Operations**: Firestore batch writes for efficiency
- **Lazy Loading**: Progressive data loading for large datasets
- **Background Sync**: Automatic data synchronization

## 🛠️ Development Tools & Scripts

### Available Commands
```bash
# Development
npm start              # Start Expo development server
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator
npm run web            # Run on web browser

# Testing & Quality
npm test               # Run Jest tests
npm run lint           # Run ESLint

# Maintenance
npm run reset-project               # Reset to initial state
npm run test-updater               # Test update system
npm run update-product-names       # Update product data
npm run update-dubai-product       # Alternative update script

# Build & Deploy
eas build --platform android --profile preview    # Preview APK
eas build --platform android --profile production # Production APK
```

## 🌐 Platform-Specific Features

### Android Configuration
- **Permissions**: Comprehensive file access and storage permissions
- **Deep Linking**: WhatsApp integration for order sharing
- **Status Bar**: Custom transparent status bar
- **File System**: Full file access for Excel exports

### iOS Configuration
- **File Sharing**: Document storage and sharing capabilities
- **Tablet Support**: Optimized for iPad displays
- **Universal Links**: Native app integration

### Web Support
- **Static Export**: Optimized web build
- **Responsive Design**: Cross-platform compatibility
- **Browser Compatibility**: Modern browser support

## 🔔 Notification System

### Local Notifications
- **Order Alerts**: Real-time order notifications
- **Stock Warnings**: Low inventory alerts
- **System Updates**: App update notifications
- **Scheduled Notifications**: Timed reminders

### Push Notification Support
- **Firebase Integration**: Ready for remote notifications
- **Cross-Platform**: Unified notification handling
- **Interactive Notifications**: Rich notification interactions

## 🔒 Security & Performance

### Security Measures
- **Firebase Rules**: Secure database access patterns
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Robust error management
- **Secure Storage**: Encrypted local storage options

### Performance Features
- **Optimized Rendering**: React.memo and performance optimizations
- **Efficient Lists**: Virtualized FlatList implementations
- **Memory Management**: Proper cleanup and garbage collection
- **Background Processing**: Non-blocking operations

## 🌍 Localization & Language

### Language Support
- **Primary Language**: Azerbaijani for user interface
- **Development Language**: Turkish for code comments and documentation
- **Date Formatting**: Localized date and time formats
- **RTL Support**: Right-to-left text support capabilities

## 📊 Business Intelligence

### Analytics Features
- **Real-time Dashboards**: Live business metrics
- **Custom Reports**: Tailored business reports
- **Data Export**: Excel and CSV export capabilities
- **Trend Visualization**: Interactive charts and graphs

### AI Capabilities
- **Predictive Analytics**: Demand forecasting
- **Smart Recommendations**: Business improvement suggestions
- **Natural Language Queries**: AI-powered data insights
- **Automated Reporting**: AI-generated summaries

## 🔧 Configuration Files

### Key Configuration
- **app.json**: Expo SDK configuration and app settings
- **package.json**: Dependencies and scripts management
- **tsconfig.json**: TypeScript compilation configuration
- **eas.json**: Expo Application Services configuration
- **metro.config.js**: Metro bundler configuration

## 🚀 Deployment & Distribution

### Build Profiles
- **Preview**: Development and testing builds
- **Production**: Production-ready APK builds
- **OTA Updates**: Over-the-air update deployment
- **App Store**: Ready for app store submission

### Update Management
- **Version Control**: Semantic versioning system
- **Update Notifications**: In-app update prompts
- **Rollback Support**: Version rollback capabilities
- **Testing Pipeline**: Comprehensive update testing

## 📈 Future Roadmap

### Planned Enhancements
- **Advanced AI Features**: Enhanced AI capabilities
- **Multi-Language Support**: Expanded language options
- **Offline Mode**: Offline functionality support
- **Advanced Analytics**: More sophisticated business insights
- **Integration APIs**: Third-party service integrations

## 📞 Support & Maintenance

### Documentation
- **Implementation Guide**: Detailed setup instructions
- **API Documentation**: Comprehensive API reference
- **Component Library**: UI component documentation
- **Troubleshooting Guide**: Common issues and solutions

### Code Quality
- **TypeScript**: Full type safety coverage
- **Testing**: Jest unit test framework
- **Linting**: ESLint code quality enforcement
- **Code Review**: Structured code review process

---

**Version**: 1.4.5
**Last Updated**: November 2024
**Framework**: Expo SDK 54.0.22
**Platform**: iOS, Android, Web
**Language**: TypeScript + React Native
**Backend**: Firebase Firestore

This overview represents a comprehensive analysis of the Aidas Corners application as of the current state of the codebase.