// BranchesScreen.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { TopBar } from '@/components/TopBar';
import { BranchCard } from '@/components/branches/BranchCard';
import { getBranches } from '@/utils/firebase';
import { Branch } from '@/types/branch';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function BranchesScreen() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchesData = await getBranches();
        setBranches(branchesData);
      } catch (error) {
        console.error('Error loading branches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBranches();
  }, []);

  const handleEdit = (branchId: string) => {
    console.log('Edit branch:', branchId);
  };

  const handleDelete = (branchId: string) => {
    console.log('Delete branch:', branchId);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <TopBar 
              title="Filiallar" 
              style={styles.topBar}
        />
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint} 
          />
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
     <TopBar 
              title="Filiallar" 
              style={styles.topBar}
      />
      <FlatList
        data={branches}
        renderItem={({ item }) => (
          <BranchCard 
            branch={item}
            onEdit={() => handleEdit(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32 + 85,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
});