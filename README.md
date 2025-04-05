# Aidas Corners 🛍️

A modern Pastry Order Managaement application built with Expo and React Native, offering a seamless shopping experience across mobile platforms.

## 🌟 Features

- Cross-platform compatibility (iOS & Android)
- Modern and intuitive user interface
- Responsive design
- Secure authentication
- Product catalog management
- Shopping cart functionality
- Order management
- User profile management

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository
```bash
git clone https://github.com/ihsynzd14/aidas-corners.git
cd aidas-corners
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npx expo start
```

## 🛠️ Built With

- [Expo](https://expo.dev/) - The framework for universal React applications
- [React Native](https://reactnative.dev/) - Create native apps for Android and iOS using React
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types

## 📱 Running the App

After starting the development server, you can run the app in various ways:

- Press 'a' for Android emulator
- Press 'i' for iOS simulator
- Scan the QR code with Expo Go app on your physical device

## 🤝 Contributing

This project is proprietary and belongs to Aidas Corners. Please contact the owners for permission before using or contributing to this project.

## 📄 License

MIT License

Copyright (c) 2024 Aidas Corners

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

**Note:** While this project uses the MIT License, it is proprietary to Aidas Corners. Permission must be obtained from the owners before using or modifying this software.

## 📞 Contact

For any inquiries about using or contributing to this project, please contact the Aidas Corners team.

## ✨ Acknowledgments

- Thanks to all contributors who have helped shape Aidas Corners
- Special thanks to the Expo and React Native communities for their excellent documentation and tools

## App Update Feature

The app includes an automatic update checker that compares the current app version with the latest version stored in Firebase. If a newer version is available, the app will show a modal prompting the user to update.

### How it works

1. When the app starts, it checks the `app_version` collection in Firebase
2. It compares the current app version (from app.json) with the version in Firebase
3. If a newer version is available, it shows an update modal in the center of the screen
4. The modal displays the new version number and a changelog of what's new
5. When the user clicks "Güncelle" (Update), they are directed to the APK download URL
6. If the user clicks "Daha Sonra" (Later), the modal is dismissed

### What to expect

When an update is available, you'll see a modal dialog in the center of the screen with:
- A cloud download icon
- The title "Uygulama Güncellemesi" (App Update)
- The new version number
- A brief message about the update
- A changelog section showing what's new in this version
- Two buttons: "Güncelle" (Update) and "Daha Sonra" (Later)

### Firebase Collection Structure

The `app_version` collection should contain a document with ID `current` and the following fields:

```
{
  "apk_version": "1.3.5",
  "apk_url": "https://example.com/your-app.apk",
  "changelog": [
    "New feature added",
    "Bug fixes",
    "Performance improvements"
  ]
}
```

The `changelog` field should be an array of strings, each representing a change in the new version.

### Testing the Update Feature

To test the update feature, you can use the provided test script:

```
npm run test-updater
```

This script will:
1. Read your current app version from app.json
2. Check if there's already a version document in Firebase
3. Create or update the document with a version number higher than your current app version
4. Add a random set of changelog entries
5. Set a test APK URL

After running the script, restart your app to see the update modal with the changelog.

### Troubleshooting

If the update modal doesn't appear:
1. Make sure your app version in app.json is different from the version in Firebase
2. Check the Firebase console to verify the document exists in the app_version collection
3. Restart the app completely (not just a hot reload)
4. Check the console logs for any errors

### Customizing the Update Modal

The update modal is implemented in `components/AppUpdater.tsx`. You can customize the appearance and text by modifying this file.
