import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Linking, Platform, Dimensions, ScrollView } from 'react-native';
import { checkAppVersion } from '@/utils/firebase';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * AppUpdater component that checks for app updates and shows a modal when an update is available
 * It compares the current app version with the version stored in Firebase
 */
export default function AppUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [apkUrl, setApkUrl] = useState<string | undefined>(undefined);
  const [latestVersion, setLatestVersion] = useState<string | undefined>(undefined);
  const [changelog, setChangelog] = useState<string[]>([]);
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Check for updates when component mounts
    checkForUpdates();
  }, []);

  // Manage StatusBar visibility based on modal state
  useEffect(() => {
    // This effect will run whenever updateAvailable changes
    // When modal is closed, we don't need to do anything as the main layout's StatusBar will take over
    return () => {
      // This cleanup function will run when the component unmounts or before the effect runs again
      // We don't need to do anything here as the main layout's StatusBar will take over
    };
  }, [updateAvailable]);

  /**
   * Checks if an update is available by comparing app versions
   */
  const checkForUpdates = async () => {
    try {
      const { needsUpdate, apkUrl: url, latestVersion: version, changelog: changes } = await checkAppVersion();
      
      if (needsUpdate && url) {
        setUpdateAvailable(true);
        setApkUrl(url);
        setLatestVersion(version);
        if (changes && Array.isArray(changes)) {
          setChangelog(changes);
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  /**
   * Handles the update button press
   * Opens the APK download URL in the browser
   */
  const handleUpdate = async () => {
    if (apkUrl) {
      try {
        // Check if the URL can be opened
        const canOpen = await Linking.canOpenURL(apkUrl);
        
        if (canOpen) {
          await Linking.openURL(apkUrl);
        } else {
          console.error('Cannot open URL:', apkUrl);
        }
      } catch (error) {
        console.error('Error opening URL:', error);
      }
    }
    
    // Close the modal after attempting to open the URL
    setUpdateAvailable(false);
  };

  /**
   * Dismisses the update modal
   */
  const dismissUpdate = () => {
    setUpdateAvailable(false);
  };

  // Don't render anything if no update is available
  if (!updateAvailable) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Show StatusBar only when modal is visible */}
      <StatusBar hidden={false} style={colorScheme === 'dark' ? 'light' : 'dark'} translucent backgroundColor="transparent" />
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={updateAvailable}
        onRequestClose={dismissUpdate}
        statusBarTranslucent={true}
        presentationStyle="overFullScreen"
      >
        <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Ionicons name="cloud-download-outline" size={50} color="#007AFF" style={styles.icon} />
                
                <Text style={styles.title}>Tətbiq Yeniləməsi</Text>
                
                {latestVersion && (
                  <Text style={styles.versionText}>Yeni sürüm: {latestVersion}</Text>
                )}
                
                <Text style={styles.message}>
                  Tətbiqin yeni bir sürümü mövcuddur. {'\n'} Xaiş edirik tətbiqinizi yeniləyin.
                </Text>
                
                {changelog.length > 0 && (
                  <View style={styles.changelogContainer}>
                    <Text style={styles.changelogTitle}>Dəyişikliklər:</Text>
                    <ScrollView style={styles.changelogScroll} contentContainerStyle={styles.changelogContent}>
                      {changelog.map((change, index) => (
                        <View key={index} style={styles.changelogItem}>
                          <Text style={styles.bulletPoint}>•</Text>
                          <Text style={styles.changelogText}>{change}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
                
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={handleUpdate}
                >
                  <Text style={styles.updateButtonText}>Yüklə</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.laterButton}
                  onPress={dismissUpdate}
                >
                  <Text style={styles.laterButtonText}>Daha Sonra</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </BlurView>
      </Modal>
    </View>
  );
}

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
  },
  safeArea: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Removed the background color as we're using BlurView instead
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    maxWidth: 350,
    minWidth: 280,
    margin: 0,
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
    textAlign: 'center',
  },
  versionText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
    textAlign: 'center',
  },
  message: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  changelogContainer: {
    width: '100%',
    marginBottom: 15,
    maxHeight: 150,
  },
  changelogTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  changelogScroll: {
    maxHeight: 120,
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  changelogContent: {
    padding: 10,
  },
  changelogItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingRight: 5,
  },
  bulletPoint: {
    fontSize: 14,
    marginRight: 6,
    color: '#555',
  },
  changelogText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
    lineHeight: 20,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  laterButton: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  laterButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
}); 