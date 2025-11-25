# Custom Share Feature Implementation Guide

## Overview
This feature will add a third share option alongside the existing copy-to-clipboard and WhatsApp share functionality in `OrdersTotalSummary.tsx`. Users will be able to create custom sections with selected products and share formatted messages based on Firebase configuration.

## Firebase Collection Structure

### Collection: `customShareTemplates`
```typescript
interface CustomShareTemplate {
  id: string;
  name: string; // e.g., "Cheesecake Staff", "Biscuits Staff"
  products: string[]; // Array of product names to include
  template: string; // Message template with placeholders
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Example Documents
```javascript
// Document 1: Cheesecake Staff
{
  id: "cheesecake-staff",
  name: "Cheesecake Staff",
  products: ["Cheesecake", "Chocolate Cheesecake", "Strawberry Cheesecake"],
  template: "Cheesecake Staff Report:\n$choosen_cheesecake_products\nTotal: $total_quantity",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

// Document 2: Biscuits Staff
{
  id: "biscuits-staff", 
  name: "Biscuits Staff",
  products: ["Chocolate Cookie", "Vanilla Biscuit", "Almond Cookie"],
  template: "Biscuits Staff Report:\n$choosen_biscuit_products\nTotal: $total_quantity",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Implementation Steps

### 1. Create Firebase Service
Create `services/customShareService.ts`:
```typescript
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/utils/firebase';

export interface CustomShareTemplate {
  id: string;
  name: string;
  products: string[];
  template: string;
  isActive: boolean;
}

export const getActiveTemplates = async (): Promise<CustomShareTemplate[]> => {
  const q = query(
    collection(db, 'customShareTemplates'),
    where('isActive', '==', true)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as CustomShareTemplate));
};

export const formatCustomMessage = (
  template: string,
  products: { [key: string]: number },
  templateProducts: string[]
): string => {
  const selectedProducts = templateProducts.filter(product => 
    products.hasOwnProperty(product)
  );
  
  let productText = selectedProducts.map(product => 
    `${product}: ${products[product]}`
  ).join('\n');
  
  const totalQuantity = selectedProducts.reduce((sum, product) => 
    sum + products[product], 0
  );
  
  return template
    .replace('$choosen_cheesecake_products', productText)
    .replace('$choosen_biscuit_products', productText)
    .replace('$total_quantity', totalQuantity.toString());
};
```

### 2. Add Custom Share Button
In `OrdersTotalSummary.tsx`, add the custom share button next to existing share buttons:

```typescript
// Add to imports
import { getActiveTemplates, formatCustomMessage } from '@/services/customShareService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Add state for templates
const [customTemplates, setCustomTemplates] = useState<CustomShareTemplate[]>([]);
const [showTemplateModal, setShowTemplateModal] = useState(false);

// Load templates on component mount
useEffect(() => {
  const loadTemplates = async () => {
    try {
      const templates = await getActiveTemplates();
      setCustomTemplates(templates);
    } catch (error) {
      console.error('Error loading custom templates:', error);
    }
  };
  loadTemplates();
}, []);

// Add custom share button in header (after WhatsApp button)
{customTemplates.length > 0 && (
  <TouchableOpacity
    onPress={() => setShowTemplateModal(true)}
    style={{
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.07)',
      padding: 8,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    }}
  >
    <MaterialCommunityIcons
      name="format-list-bulleted"
      size={20}
      color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
    />
  </TouchableOpacity>
)}
```

### 3. Create Template Selection Modal
Create a new component `components/stocks/CustomShareModal.tsx`:

```typescript
import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PastryColors } from '@/constants/Colors';
import { CustomShareTemplate, formatCustomMessage } from '@/services/customShareService';
import * as Clipboard from 'expo-clipboard';
import { shareViaWhatsApp } from './WPShareText';

interface CustomShareModalProps {
  visible: boolean;
  onClose: () => void;
  templates: CustomShareTemplate[];
  productsData: { [key: string]: number };
  totalProducts: number;
  totalQuantity: number;
  totalBranches: number;
  isDark: boolean;
}

export const CustomShareModal: React.FC<CustomShareModalProps> = ({
  visible,
  onClose,
  templates,
  productsData,
  totalProducts,
  totalQuantity,
  totalBranches,
  isDark
}) => {
  const handleTemplateSelect = async (template: CustomShareTemplate, shareType: 'copy' | 'whatsapp') => {
    try {
      const message = formatCustomMessage(template.template, productsData, template.products);
      
      if (shareType === 'copy') {
        await Clipboard.setString(message);
        Alert.alert('Uğurlu', 'Məlumatlar kopyalandı');
      } else {
        shareViaWhatsApp(encodeURIComponent(message));
      }
      onClose();
    } catch (error) {
      Alert.alert('Xəta', 'Məlumatları paylaşarkən xəta baş verdi');
    }
  };

  const renderTemplateItem = ({ item }: { item: CustomShareTemplate }) => (
    <ThemedView style={{
      marginVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.1)',
      padding: 16,
    }}>
      <ThemedText style={{
        fontSize: 16,
        fontWeight: '600',
        color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
        marginBottom: 8,
      }}>
        {item.name}
      </ThemedText>
      
      <ThemedText style={{
        fontSize: 12,
        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74,53,49,0.6)',
        marginBottom: 12,
      }}>
        Məhsullar: {item.products.join(', ')}
      </ThemedText>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={() => handleTemplateSelect(item, 'copy')}
          style={{
            flex: 1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(74,53,49,0.07)',
            padding: 10,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <MaterialCommunityIcons
            name="content-copy"
            size={16}
            color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
          />
          <ThemedText style={{
            fontSize: 12,
            fontWeight: '500',
            color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
          }}>
            Kopyala
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTemplateSelect(item, 'whatsapp')}
          style={{
            flex: 1,
            backgroundColor: '#25D366',
            padding: 10,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <MaterialCommunityIcons
            name="whatsapp"
            size={16}
            color="#FFFFFF"
          />
          <ThemedText style={{
            fontSize: 12,
            fontWeight: '500',
            color: '#FFFFFF',
          }}>
            WhatsApp
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={{ flex: 1 }}>
        {/* Header */}
        <ThemedView style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
        }}>
          <ThemedText style={{
            fontSize: 18,
            fontWeight: '600',
            color: isDark ? PastryColors.vanilla : PastryColors.chocolate,
          }}>
            Custom Şablonlar
          </ThemedText>
          
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={isDark ? PastryColors.vanilla : PastryColors.chocolate}
            />
          </TouchableOpacity>
        </ThemedView>

        {/* Template List */}
        <FlatList
          data={templates}
          keyExtractor={item => item.id}
          renderItem={renderTemplateItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
    </Modal>
  );
};
```

### 4. Integrate Modal into Main Component
Add the modal to `OrdersTotalSummary.tsx`:

```typescript
// Add import
import { CustomShareModal } from './CustomShareModal';

// Add modal at the end of component return
<CustomShareModal
  visible={showTemplateModal}
  onClose={() => setShowTemplateModal(false)}
  templates={customTemplates}
  productsData={totals}
  totalProducts={totalProducts}
  totalQuantity={totalQuantity}
  totalBranches={totalBranches}
  isDark={isDark}
/>
```

## Template Variables
The following variables can be used in Firebase templates:

- `$choosen_cheesecake_products` - Replaced with selected cheesecake products list
- `$choosen_biscuit_products` - Replaced with selected biscuit products list  
- `$total_quantity` - Total quantity of selected products
- Custom variables can be added as needed

## Firebase Security Rules
Add to your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /customShareTemplates/{templateId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

## Testing Checklist
- [ ] Firebase collection created with sample data
- [ ] Custom share button appears when templates exist
- [ ] Modal opens and displays templates correctly
- [ ] Copy to clipboard functionality works
- [ ] WhatsApp sharing functionality works
- [ ] Template variables are replaced correctly
- [ ] Error handling works for network issues
- [ ] UI matches existing design patterns

## Future Enhancements
- Add template creation/editing UI
- Support for more complex template variables
- Template usage analytics
- Offline template caching