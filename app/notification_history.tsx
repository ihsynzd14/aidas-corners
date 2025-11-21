import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert, Pressable } from 'react-native';
import { NotificationHistoryItem } from '@/components/ai-assistant/core/types';
import { NotificationService } from '@/services/NotificationService';
import { useRouter } from 'expo-router';
import { TopBar } from '@/components/TopBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, PastryColors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { colorScheme } from '@/constants/colorScheme';

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} gün əvvəl`;
  } else if (hours > 0) {
    return `${hours} saat əvvəl`;
  } else if (minutes > 0) {
    return `${minutes} dəqiqə əvvəl`;
  } else {
    return 'İndicə';
  }
};

export default function NotificationHistoryScreen() {
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const loadNotifications = async () => {
    const notificationService = NotificationService.getInstance();
    const history = await notificationService.getNotificationHistory();
    setNotifications(history);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Bildirişi Sil',
      'Bu bildirişi silmək istədiyinizə əminsiniz?',
      [
        {
          text: 'Ləğv et',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const notificationService = NotificationService.getInstance();
              await notificationService.deleteNotification(id);
              await loadNotifications();
            } catch (error) {
              console.error('Bildiriş silinərkən xəta:', error);
            }
          },
        },
      ],
    );
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;

    Alert.alert(
      'Bütün Bildirişləri Sil',
      'Bütün bildirişləri silmək istədiyinizə əminsiniz?',
      [
        {
          text: 'Ləğv et',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const notificationService = NotificationService.getInstance();
              await notificationService.clearAllNotifications();
              await loadNotifications();
            } catch (error) {
              console.error('Bildirişlər silinərkən xəta:', error);
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'comparison':
        return '📊';
      case 'topSelling':
        return '🏆';
      case 'insight':
        return '📈';
      default:
        return '📝';
    }
  };

  const renderItem = ({ item }: { item: NotificationHistoryItem }) => (
    <ThemedView style={[styles.notificationItem, { 
      backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background 
    }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{getTypeIcon(item.type)}</Text>
        <Text style={[styles.title, { 
          color: colorScheme === 'dark' ? Colors.dark.text : Colors.light.text 
        }]}>{item.title}</Text>
        <Text style={[styles.time, { 
          color: colorScheme === 'dark' ? Colors.dark.textSecondary : Colors.light.textSecondary 
        }]}>
          {formatTimeAgo(item.timestamp)}
        </Text>
        <Pressable
          onPress={() => handleDelete(item.id)}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed
          ]}
          hitSlop={8}
        >
          <IconSymbol
            name="trash.fill"
            size={16}
            color={colorScheme === 'dark' ? PastryColors.accent : PastryColors.chocolate}
          />
        </Pressable>
      </View>
      <Text style={[styles.body, { 
        color: colorScheme === 'dark' ? Colors.dark.text : Colors.light.text 
      }]}>{item.body}</Text>
    </ThemedView>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { 
        color: colorScheme === 'dark' ? Colors.dark.textSecondary : Colors.light.textSecondary 
      }]}>
        Bildiriş yoxdur
      </Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <TopBar 
        title="Bildirişlər" 
        style={styles.topBar}
        rightComponent={
          notifications.length > 0 ? (
            <Pressable
              onPress={handleClearAll}
              style={({ pressed }) => [
                styles.clearAllButton,
                pressed && styles.pressed
              ]}
              hitSlop={8}
            >
              <Text style={[styles.clearAllText, { 
                color: colorScheme === 'dark' ? PastryColors.accent : PastryColors.chocolate 
              }]}>
                Hamısını sil
              </Text>
            </Pressable>
          ) : undefined
        }
      />
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colorScheme === 'dark' ? Colors.dark.text : Colors.light.text}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyComponent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 32,
    backgroundColor: colorScheme.backgroundLight,
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  notificationItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    marginRight: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
    borderRadius: 8,
  },
  clearAllButton: {
    padding: 8,
    borderRadius: 8,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 