#!/usr/bin/env node

/**
 * Migration Script: Product Corrections to Firebase
 * 
 * This script migrates the static PRODUCT_CORRECTIONS array from orderCorrection.ts
 * to the Firebase productCorrections collection.
 * 
 * Usage: node scripts/migrateProductCorrections.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc,
  getDocs,
  query,
  where,
  writeBatch,
  deleteDoc
} = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQ6wElMS4yPTNli18cWaPLPFwqo9gfLbU",
  authDomain: "aidascorner-71243.firebaseapp.com",
  projectId: "aidascorner-71243",
  storageBucket: "aidascorner-71243.firebasestorage.app",
  messagingSenderId: "827451742805",
  appId: "1:827451742805:web:1cf778cbc185a5f47a12dc"
};

// Static product corrections from orderCorrection.ts
const PRODUCT_CORRECTIONS = [
  {
    correct: "Şokolad",
    variations: [
      "sokolad",
      "şokolad",
      "shokolad",
      "turk sokoladi",
      "turk sokolad",
      "türk şokolad",
      "turk kofe sokolad"
    ],
    units: {
      type: 'weight',
      variations: ['kq', 'kg', 'kilo', 'kiloqram']
    }
  },
  {
    correct: "Şokolad Lokumlu",
    variations: [
      "lokumlu sokolad",
      "lokum sokolad",
      "lokumlu şokolad",
      "sokolad lokum",
      "şokolad lokum"
    ],
    units: {
      type: 'weight',
      variations: ['kq', 'kg', 'kilo', 'kiloqram']
    }
  },
  {
    correct: "San sebastian",
    variations: [
      "san seba",
      "sab sebastian",
      "san sebastyan",
      "san sebastiyan",
      "san sebas",
      "san sabastian"
    ],
    units: {
      type: 'box',
      variations: ['box', 'qutu', 'ədəd']
    }
  },
  {
    correct: "Esterhazy",
    variations: [
      "esterxazy",
      "esterxayzer",
      "esterhazy",
      "esterharzi",
      "esterhazi",
      "esterharzı",
      "asterharzy",
      "esterxazi"
    ]
  },
  {
    correct: "Magnolia çiyələkli",
    variations: [
      "maqnolia çiyələk",
      "magnolya ciyelek",
      "çiyələk magnolia",
      "maqnoliya ciyelek",
      "magnolia",
      "maqnoliya",
      "magnoliya ciyelek",
      "maqnolia"
    ]
  },
  {
    correct: "Dubai brownie",
    variations: [
      "dubai browni",
      "dubay browni",
      "dubay brovni",
      "dubai brownies",
      "dubay brownie",
      "dubai braunı",
      "dubay browny",
      "dubay brovny",
      "dubay brovni",
      "dubai brauni"
    ]
  },
  {
    correct: "Brownie",
    variations: [
      "browni",
      "brovni",
      "brovniy",
      "brovny",
      "browny",
      "browniy",
      "brownies",
      "brauni",
      "braunı",
      "browny"
    ]
  },
  {
    correct: "Profiterol",
    variations: [
      "profitirol",
      "prafitirol",
      "profitrol",
      "prafitrol"
    ]
  },
  {
    correct: "Parfait orman meyvəli",
    variations: [
      "orman meyvəli parfeit",
      "orman meyve parifet",
      "orman meyvəli",
      "orman meyveli parfait",
      "parfait orman meyvəli",
      "parfait orman",
      "orman parfait"
    ]
  },
  {
    correct: "Parfait fıstıq əzməli ",
    variations: [
      "fıstıq əzməli parfeit",
      "yer fistiq parifet",
      "fıstıq əzməli",
      "parfait fıstıq əzməli",
      "parfait fistiq",
      "fistiqli parfait",
      "fistiq parfait"
    ]
  },
  {
    correct: "Paxlava Cheesecake",
    variations: [
      "paxlavalı chees",
      "paxlavalı chescake",
      "çizkek paxlavalı",
      "çizkek paxlava",
      "çizkeyk paxlava",
      "paxlavalı cheesecake",
      "paxlava çizkek",
      "paxlava çizkeyk",
      "paxlavalı çizkek",
      "paxlava çizkek",
      "paxlavalı çizkeyk",
      "paxlava cheese",
      "paxlavali cheescake"
    ]
  },
  {
    correct: "Cheesecake Fıstıqlı",
    variations: [
      "fistiqli cheesecake",
      "fıstıqlı çizkek",
      "fıstıqlı cizkek",
      "çizkek fıstıqlı",
      "cizkek fıstıqlı",
      "fıstıqlı cheesecake",
      "fıstıq çizkek",
      "fistiq cheese",
      "fıstıqlı cheese"
    ]
  },
  {
    correct: "Cheesecake Caramel",
    variations: [
      "caramel çizkek",
      "karamel çizkek",
      "karamel cizkek",
      "caramel cizkek",
      "karamel cheesecake",
      "çizkek karamelli",
      "cizkek karamelli",
      "cheesecake karamelli",
      "karamelli cheesecake",
      "karamel chescake",
      "caramel chescake",
      "karamel cheese",
      "karamelli cheese"
    ]
  },
  {
    correct: "Tiramisu",
    variations: [
      "tiramisu",
      "tiramizu",
      "tiramisu classic",
      "classic tiramisu",
      "tiramusi",
      "tiramisu klassik",
      "tiramiso"
    ]
  },
  {
    correct: "Red velvet",
    variations: [
      "red velvet",
      "red velved",
      "red velvett",
      "red walvet",
      "red valvet",
      "redvelvet",
      "red velvut"
    ]
  },
  {
    correct: "Balli tort",
    variations: [
      "balii tort",
      "bali tort",
      "balı tort",
      "balli tort",
      "ballı tort",
      "balii",
      "bali",
      "balı"
    ],
  },
  {
    correct: "Napaleon",
    variations: [
      "napoleon",
      "napalion",
      "napolyon",
      "napolion",
      "napalyon"
    ],
  },
  {
    correct: "Cheesecake blueberry",
    variations: [
      "blueberry cheesecake",
      "blue berry cheesecake",
      "cheesecake blue berry",
      "blueberry cheezcake",
      "blue berry cheezcake",
      "blueberry cheese cake",
      "blue berry cheese cake"
    ],
  },
  {
    correct: "Cheesecake raspberry",
    variations: [
      "raspberry cheesecake",
      "cheesecake raspberry",
      "raspberry cheezcake",
      "raspberry cheese cake",
      "malina cheesecake",
      "cheesecake malina"
    ],
  },
  {
    correct: "Kurabiye ağ",
    variations: [
      "ag kurabiye",
      "ağ kurabiye",
      "kurabiye ag",
      "kurabiye ağ",
      "ag kurabiyə",
      "ağ kurabiyə",
      "kurabiyə ag",
      "kurabiyə ağ"
    ],
  },
  {
    correct: "Kurabiye qara",
    variations: [
      "qara kurabiye",
      "kara kurabiye",
      "kurabiye qara",
      "kurabiye kara",
      "qara kurabiyə",
      "kara kurabiyə",
      "kurabiyə qara",
      "kurabiyə kara"
    ],
  },
  {
    correct: "Tart",
    variations: [
      "tart",
      "tartlar",
      "tartlər",
      "tarts"
    ],
  },
  {
    correct: "Crescent brownies",
    variations: [
      "crescent browni",
      "crescent brownie",
      "crescent brauni",
      "crescent brovni",
      "crescent brovny",
      "crescent browny",
      "kresent browni",
      "kresent brownie"
    ],
  },
  {
    correct: "Crescent crem",
    variations: [
      "crescent krem",
      "crescent cream",
      "kresent krem",
      "kresent cream",
      "crescent kremli",
      "kresent kremli"
    ],
  },
  {
    correct: "Dubai supangele ",
    variations: [
      "dubai bardak",
      "dubay bardaq",
      "dubay bardak",
      "dubay stəkan",
      "dubay stəkan",
      "dubay stekan",
      "dubay stekan",
      "dubai supangele",
      "dubay supangele",
      "dubay supanqele",
      "dubay supanqele"
    ],
  },
  {
    correct: "Cheesecake dubai",
    variations: [
      "dubai cheesecake",
      "dubay cheesecake",
      "dubai cheezcake",
      "dubay cheezcake",
      "dubai cheese cake",
      "dubay cheese cake"
    ],
  },
  {
    correct: "Kinder delice",
    variations: [
      "kinder delis",
      "kinder delise",
      "kinder deliçe",
      "kinder delice",
      "kinder delish"
    ],
  },
  {
    correct: "American Kurabiye",
    variations: [
      "amerikan kurabiye",
      "amerikan cookie",
      "american cookie",
      "american kurabiye",
      "amerikan"
    ]
  },
  {
    correct: "Çatlaq Kurabiye",
    variations: [
      "çatlaq kurabiye",
      "çatlaq cookie",
      "crack cookie",
      "crack kurabiye",
      "çatlaq"
    ]
  },
  {
    correct: "Susamlı Kurabiye",
    variations: [
      "susamlı kurabiye",
      "sesame cookie",
      "sesame kurabiye",
      "susamlı"
    ]
  },
  {
    correct: "Yulaflı Kurabiye",
    variations: [
      "yulaflı kurabiye",
      "yulaflı cookie",
      "oatmeal cookie",
      "oat kurabiye",
      "yulaflı"
    ]
  },
  {
    correct: "Krokant",
    variations: [
      "krokant",
      "krokant cookie",
      "krokant kurabiye",
      "krokont",
      "crocant"
    ]
  },
  {
    correct: "Coconut kurabiye",
    variations: [
      "coconut kurabiye",
      "coconut cookie",
      "coconut kurabiyə",
      "coconut cookie",
      "kokoslu kurabiye",
      "kokoslu cookie",
      "kokoslu kurabiyə",
    ]
  },
  {
    correct: "Acıbadem kurabiye",
    variations: [
      "acıbadem kurabiye",
      "acıbadem cookie",
      "acıbadem kurabiyə",
      "acıbadem"
    ]
  },
  {
    correct: "Pavlova",
    variations: [
      "pavlova",
      "pavlovo",
      "pavlava"
    ]
  },
  {
    correct: "Bananamania",
    variations: [
      "bananamania",
      "bananmania",
      "bananmaniya",
      "bananamaniya",
      "bananamanya",
    ]
  },
  {
    correct: "Pasta de nata",
    variations: [
      "pasta de nata",
      "pasta de nata",
      "pasta nata",
      "pastanata",
      "pasta denata",
      "pasta da nata",
      "pastel de nata",
      "pastel nata"
    ]
  },
  {
    correct: "Mango chia",
    variations: [
      "mango chia",
      "mango çia",
      "mango chia pudding",
      "mango çia pudding",
      "chia mango",
      "çia mango",
      "mango chia seed",
      "mango çia seed"
    ]
  },
  {
    correct: "Mango Panna",
    variations: [
      "mango panna",
      "mango panna cotta",
      "panna mango",
      "panna cotta mango",
      "mango pana",
      "mango pana cotta",
      "pana mango",
      "pana cotta mango"
    ]
  },
  {
    correct: "Raspberry Panna",
    variations: [
      "rasberry panna",
      "rasberry pana",
      "rasbery panna",
      "rasbery pana",
      "raspberry panna",
      "raspberry panna cotta",
      "panna raspberry",
      "panna cotta raspberry",
      "raspberry pana",
      "raspberry pana cotta",
      "pana raspberry",
      "pana cotta raspberry",
      "malina panna",
      "malina panna cotta",
      "panna malina",
      "pana cotta malina"
    ]
  },
  {
    correct: "Magnolia matcha",
    variations: [
      "magnolia matcha",
      "maqnolia matcha",
      "magnolya matcha",
      "maqnoliya matcha",
      "maqnolya maca",
      "maqnolya maça",
      "maqnoliya matcha",
      "matcha magnolia",
      "matcha maqnolia"
    ]
  },
  {
    correct: "Tiramisu matcha",
    variations: [
      "tiramisu matcha",
      "tiramisu matca",
      "tiramisu maca",
      "tiramisu maça",
      "tiramisu maccha",
      "matcha tiramisu",
      "tiramizo matcha"
    ]
  },
  {
    correct: "Crepes matcha",
    variations: [
      "crepes matcha",
      "crepe matcha",
      "krep matcha",
      "kreps matcha",
      "kreps maca",
      "kreps maça",
      "matcha crepe",
      "matcha krep"
    ]
  },
  {
    correct: "Velvet matcha",
    variations: [
      "velvet matcha",
      "velvet maca",
      "velvet maça",
      "velvet maca",
      "red velvet matcha",
      "matcha velvet"
    ]
  },
  {
    correct: "Cookies matcha",
    variations: [
      "cookies matcha",
      "cookie matcha",
      "cookie maca",
      "cookie maça",
      "kurabiye matcha",
      "matcha cookie",
      "matcha cookies"
    ]
  },
  {
    correct: "Cookies choco",
    variations: [
      "cookies koko",
      "cookies choco",
      "cookie choco",
      "choco cookie",
      "chocolate cookie",
      "şokoladlı cookie",
      "sokoladli cookie",
      "şokoladlı kurabiye"
    ]
  },
  {
    correct: "Cookies vanil",
    variations: [
      "cookies vanil",
      "cookie vanil",
      "vanil cookie",
      "vanilli cookie",
      "vanilli kurabiye"
    ]
  },
  {
    correct: "Cookies red",
    variations: [
      "cookies red",
      "cookie red",
      "red cookie",
      "red velvet cookie"
    ]
  },
  {
    correct: "Muffin matcha",
    variations: [
      "muffin matcha",
      "maffin matcha",
      "maffin maca",
      "maffin maça",
      "matcha muffin"
    ]
  },
  {
    correct: "Muffin choco",
    variations: [
      "muffin koko",
      "maffin kakao",
      "muffin kakao",
      "maffin koko",
      "maffin coco",
      "muffin cocoa",
      "muffin koko",
      "muffin coco",
      "muffin cocoa"
    ]
  },
  {
    correct: "Muffin orange",
    variations: [
      "muffin orang",
      "maffin portagal",
      "maffin oranj",
      "maffin oranga",
      "maffin orang",
      "muffin portagal",
      "muffin oranj",
      "muffin oranga"
    ]
  },
  {
    correct: "Chia matcha cup",
    variations: [
      "chia matcha cup",
      "çia maça cup",
      "çia maca cup",
      "chia matcha",
      "matcha chia",
      "cia matcha",
      "cia maca",
      "cia maça",
      "cia matcha",
      "çia matcha",
      "çia matcha",
      "chia cup matcha"
    ]
  },
];

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearExistingCorrections() {
  console.log('🗑️  Clearing existing product corrections...');
  
  try {
    const correctionsRef = collection(db, 'productCorrections');
    const querySnapshot = await getDocs(correctionsRef);
    
    if (querySnapshot.empty) {
      console.log('✅ No existing corrections to clear');
      return;
    }
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ Cleared ${querySnapshot.size} existing corrections`);
  } catch (error) {
    console.error('❌ Error clearing existing corrections:', error);
    throw error;
  }
}

async function migrateProductCorrections() {
  console.log('🚀 Starting product corrections migration...');
  console.log(`📦 Found ${PRODUCT_CORRECTIONS.length} products to migrate`);
  
  try {
    // Clear existing data first
    await clearExistingCorrections();
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Migrate each product correction
    for (const [index, product] of PRODUCT_CORRECTIONS.entries()) {
      try {
        const correctionsRef = collection(db, 'productCorrections');
        await addDoc(correctionsRef, {
          correct: product.correct,
          variations: product.variations,
          units: product.units || null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          migrationSource: 'orderCorrection.ts',
          migrationIndex: index
        });
        
        successCount++;
        console.log(`✅ [${index + 1}/${PRODUCT_CORRECTIONS.length}] Migrated: ${product.correct}`);
      } catch (error) {
        errorCount++;
        errors.push({ product: product.correct, error: error.message });
        console.error(`❌ [${index + 1}/${PRODUCT_CORRECTIONS.length}] Failed to migrate ${product.correct}:`, error.message);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${successCount} products`);
    console.log(`❌ Failed to migrate: ${errorCount} products`);
    
    if (errors.length > 0) {
      console.log('\n❌ Migration Errors:');
      errors.forEach(({ product, error }) => {
        console.log(`  - ${product}: ${error}`);
      });
    }
    
    if (successCount === PRODUCT_CORRECTIONS.length) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('🔗 You can now use the Firebase-based product correction system.');
    } else {
      console.log('\n⚠️  Migration completed with errors. Please check the failed items above.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  
  try {
    const correctionsRef = collection(db, 'productCorrections');
    const querySnapshot = await getDocs(correctionsRef);
    
    console.log(`✅ Found ${querySnapshot.size} products in Firebase`);
    
    // Check a few sample products
    const sampleProducts = ['Şokolad', 'Tiramisu', 'Brownie'];
    for (const sample of sampleProducts) {
      const q = query(correctionsRef, where('correct', '==', sample));
      const sampleQuery = await getDocs(q);
      
      if (sampleQuery.empty) {
        console.log(`❌ Sample product not found: ${sample}`);
      } else {
        console.log(`✅ Found sample product: ${sample} (${sampleQuery.docs[0].data().variations.length} variations)`);
      }
    }
    
    console.log('✅ Verification completed');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Main execution
async function main() {
  console.log('🔥 Product Corrections Migration Tool');
  console.log('=====================================\n');
  
  try {
    await migrateProductCorrections();
    await verifyMigration();
    
    console.log('\n🏁 Migration process completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Migration process failed:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the migration
if (require.main === module) {
  main();
}

module.exports = {
  migrateProductCorrections,
  clearExistingCorrections,
  verifyMigration
};