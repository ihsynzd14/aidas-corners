# Aidas Corners Agent Guidelines

## Commands
- **Test**: `npm test` (runs all), `npx jest path/to/file.test.tsx` (single file)
- **Lint**: `npm run lint`
- **Dev**: `npm start`, `npm run android`, `npm run ios`
- **Build**: `eas build --platform android --profile preview`

## Code Style & Conventions
- **Language**: TypeScript (Strict). Use `interface` for props. Avoid `any`.
- **Framework**: Expo, React Native, Expo Router (file-based routing).
- **Styling**: NativeWind (Tailwind) & `StyleSheet.create`.
- **Localization**: UI text in **Azerbaijani**. Comments/Analysis in **Turkish**.
- **Components**: Functional components + Hooks. Use `React.memo` for static props.
- **Naming**: `PascalCase` for components, `camelCase` for vars/funcs, `kebab-case` for directories.
- **State**: Minimize `useEffect`/`useState` in render.
- **Performance**: Optimize `FlatList` (`removeClippedSubviews`, `maxToRenderPerBatch`).
- **Imports**: Group by feature.
- **Path**: `app/` for routes, `components/` for UI.

## Rules
- Follow `.cursorrules` strictly.
- Ensure responsive design.
