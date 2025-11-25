import { collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, doc } from 'firebase/firestore';
import { db } from '@/utils/firebase';

export interface CustomShareTemplate {
  id: string;
  name: string;
  products: string[];
  template: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Get all active templates
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

// Get all templates (including inactive) for admin
export const getAllTemplates = async (): Promise<CustomShareTemplate[]> => {
  const querySnapshot = await getDocs(collection(db, 'customShareTemplates'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as CustomShareTemplate));
};

// Create new template
export const createTemplate = async (template: Omit<CustomShareTemplate, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'customShareTemplates'), {
    ...template,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

// Update existing template
export const updateTemplate = async (id: string, updates: Partial<CustomShareTemplate>): Promise<void> => {
  const docRef = doc(db, 'customShareTemplates', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date()
  });
};

// Delete template (soft delete by setting isActive to false)
export const deleteTemplate = async (id: string): Promise<void> => {
  const docRef = doc(db, 'customShareTemplates', id);
  await updateDoc(docRef, {
    isActive: false,
    updatedAt: new Date()
  });
};

// Format message with template variables
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