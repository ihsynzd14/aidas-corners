import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import { TopBar } from '@/components/TopBar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import NeedsStockContent from '../components/needs/NeedsStockContent';

const DailyNeedsScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const router = useRouter();

  return (
    <><TopBar
      title="Günlük Ərzaq Təqibi"
      style={styles.topBar}
      leftComponent={{ icon: 'back', onPress: () => router.back() }} /><SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <View style={styles.contentContainer}>
            <NeedsStockContent />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView></>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    padding: 0,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
});

export default DailyNeedsScreen; 