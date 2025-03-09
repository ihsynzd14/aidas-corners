import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Pressable 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface MarketSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMarket: (market: string) => void;
  markets: string[];
}

export default function MarketSelector({
  isOpen,
  onClose,
  onSelectMarket,
  markets
}: MarketSelectorProps) {
  // Market ikonlarını belirle
  const getMarketIcon = (market: string) => {
    switch (market) {
      case 'Altınoğulları':
        return 'shopping-bag';
      case 'Araz Market':
        return 'shopping-cart';
      default:
        return 'store';
    }
  };

  // Market renklerini belirle
  const getMarketColor = (market: string) => {
    switch (market) {
      case 'Altınoğulları':
        return '#FEF3C7'; // amber-100
      case 'Araz Market':
        return '#DBEAFE'; // blue-100
      default:
        return '#F3F4F6'; // gray-100
    }
  };

  const getMarketTextColor = (market: string) => {
    switch (market) {
      case 'Altınoğulları':
        return '#92400E'; // amber-800
      case 'Araz Market':
        return '#1E40AF'; // blue-800
      default:
        return '#1F2937'; // gray-800
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalOverlay} 
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>Hansı marketdən alış etdiniz?</Text>
              <Text style={styles.description}>
                Ərzaqların hansı marketdən alındığını seçin
              </Text>
            </View>
            
            <View style={styles.marketList}>
              {markets.map((market) => {
                const bgColor = getMarketColor(market);
                const textColor = getMarketTextColor(market);
                
                return (
                  <TouchableOpacity
                    key={market}
                    style={[styles.marketButton, { backgroundColor: bgColor }]}
                    onPress={() => onSelectMarket(market)}
                  >
                    <View style={styles.iconContainer}>
                      <MaterialIcons 
                        name={getMarketIcon(market)} 
                        size={24} 
                        color={textColor} 
                      />
                    </View>
                    <Text style={[styles.marketName, { color: textColor }]}>
                      {market}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280', // text-muted-foreground
  },
  marketList: {
    gap: 12,
  },
  marketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  marketName: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 