# Bottom Sheet Visual Conflict Solution

**Date:** 2025-11-20
**Component:** `DateRangePickerModal.tsx` (and generic Bottom Sheet usage)

## The Problem
When opening the "Tarix Aralığı Seçin" (Date Range) bottom sheet, the underlying screen content—specifically the "Umumi Baxış" / "Tək Filial Baxış" tab bar—remained too visually prominent.

Even with a dark overlay (`opacity={0.5}` or `0.7`), the high contrast of the active tab borders created "visual noise," causing the user's focus to split between the modal and the background. The user was not clearly guided to the modal interaction.

## The Solution
We replaced the standard semi-transparent solid color backdrop with a **Blurred Backdrop** using `expo-blur`.

### Implementation Details
Instead of just darkening the background, we now apply a `BlurView` with a dark tint. This "frosted glass" effect effectively diffuses the sharp lines of the underlying UI (like the tab borders), forcing the eye to focus on the sharpest element on screen: the Modal.

### Code Pattern
In `components/statistics/DateRangePickerModal.tsx`:

```tsx
import { BlurView } from 'expo-blur';
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

// ... inside the BottomSheetModal component

backdropComponent={(props) => (
  <BottomSheetBackdrop 
    {...props} 
    disappearsOnIndex={-1} 
    appearsOnIndex={0}
    opacity={1} // Set opacity to 1 so the BlurView is fully visible
    pressBehavior="close"
    // Combine a semi-transparent black layer with the blur
    style={[{ backgroundColor: 'rgba(0,0,0,0.4)' }, StyleSheet.absoluteFill]}
  >
     {/* Conditionally render BlurView for mobile platforms */}
     {Platform.OS === 'ios' || Platform.OS === 'android' ? (
       <BlurView 
         style={StyleSheet.absoluteFill} 
         intensity={15} // Intensity of the blur (15-20 is usually sufficient)
         tint="dark"    // 'dark', 'light', or 'default'
       />
     ) : null}
  </BottomSheetBackdrop>
)}
```

## Key Takeaways (UX Rules)
1.  **Visual Hierarchy:** If a modal is critical, the background must be suppressed.
2.  **Contrast vs. Opacity:** Simply darkening a high-contrast background (like white tabs on a dark overlay) is often insufficient.
3.  **Blur Strategy:** Use `BlurView` when you need to completely remove the "sharpness" of background elements to fix focus competition.
