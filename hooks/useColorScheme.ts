import { useColorScheme as useNativeColorScheme } from 'react-native';

export const useColorScheme = () => {
  // Force light mode globally
  return 'light';
};
