import XLSX from 'xlsx-js-style';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

interface BranchData {
  [branchName: string]: {
    [productName: string]: string | number;
  };
}

interface ProductPriceMap {
  get(name: string): number | undefined;
}

/**
 * Generates an Excel file with branch sheets and shares it
 */
export async function exportToExcel(
  ordersData: BranchData,
  productPrices: ProductPriceMap,
  date?: Date
): Promise<void> {
  try {
    const workbook = XLSX.utils.book_new();
    const reportDate = date || new Date();
    const dateStr = formatDateForFileName(reportDate);
    const displayDate = formatDateDisplay(reportDate);
    const branchNames = Object.keys(ordersData);

    // Create a sheet for each branch
    branchNames.forEach(branchName => {
      const branchProducts = ordersData[branchName];
      const tableData: (string | number)[][] = [];

      // 1. Title Row: "AİDAS CORNERS"
      tableData.push(['AİDAS CORNERS', '', '', '', '']);

      // 2. Spacer
      tableData.push(['', '', '', '', '']);

      // 3. Info Row: "Tarix   29.12.2025 / BranchName              Qaimə: 4500"
      const infoText = `${displayDate} / ${branchName}`;
      // Better random invoice number (4 digits)
      const invoiceNum = Math.floor(1000 + Math.random() * 9000);

      tableData.push(['Tarix', infoText, '', '', `Qaimə: ${invoiceNum}`]);

      // 4. Spacer
      tableData.push(['', '', '', '', '']);

      // 5. Header Row
      tableData.push(['N', 'Adı', 'Sayı', 'Qiyməti', 'Cəmi']);

      // 6. Product Rows
      let orderNumber = 1;
      let grandTotal = 0;

      Object.entries(branchProducts).forEach(([productName, quantity]) => {
        const qty = parseFloat(quantity as string);
        const price = productPrices.get(productName.trim().toLowerCase()) || 0;
        const totalPrice = qty * price;

        tableData.push([
          orderNumber,
          productName,
          qty,
          price.toFixed(2).replace('.', ','),
          totalPrice.toFixed(2).replace('.', ',')
        ]);

        grandTotal += totalPrice;
        orderNumber++;
      });

      // Capture where products end, so we can stop grid borders here
      const lastProductRowIndex = tableData.length - 1;

      // 7. Spacer Row (Separation space)
      tableData.push(['', '', '', '', '']);

      // 8. Total Row "CƏMİ"
      tableData.push(['CƏMİ', '', '', '', grandTotal.toFixed(1).replace('.', ',')]);
      const totalRowIndex = tableData.length - 1;

      // 9. Spacer Rows
      tableData.push(['', '', '', '', '']);
      tableData.push(['', '', '', '', '']);

      // 10. Sign-off
      tableData.push(['TƏHVİL VERDİ', '', '', '', '']);
      tableData.push(['TƏHVİL ALDI', '', '', '', '']);


      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(tableData);

      // --- STYLING ---

      // Column Widths
      worksheet['!cols'] = [
        { wch: 5 },  // N
        { wch: 35 }, // Adı (Wider)
        { wch: 15 }, // Sayı
        { wch: 15 }, // Qiyməti
        { wch: 18 }  // Cəmi
      ];

      // Merges
      worksheet['!merges'] = [
        // 'AİDAS CORNERS' Title (A1:E1) -> Row 0
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
        // Date/Branch Info in Info Row (B3:D3 ?) -> Row 2
        // "Tarix" is A3 (index 2). infoText B3 (index 2). Merge B3:D3.
        { s: { r: 2, c: 1 }, e: { r: 2, c: 3 } },
        // "CƏMİ" label (A{Total}:D{Total})
        { s: { r: totalRowIndex, c: 0 }, e: { r: totalRowIndex, c: 3 } }
      ];

      // Styling Definition
      const borderStyle = { style: 'thin', color: { rgb: "000000" } };
      const transparent = { fgColor: { rgb: "FFFFFF" } };

      const styles = {
        title: {
          font: { name: "Arial", sz: 14, bold: true, color: { rgb: "000000" } },
          alignment: { horizontal: "center", vertical: "center" },
          fill: transparent
        },
        infoLabel: {
          font: { name: "Arial", sz: 12, bold: true, color: { rgb: "000000" } }, // 'Tarix'
          alignment: { horizontal: "left", vertical: "center" },
          fill: transparent
        },
        infoValue: {
          font: { name: "Arial", sz: 11, color: { rgb: "000000" } },
          alignment: { horizontal: "left", vertical: "center" },
          fill: transparent
        },
        infoRight: {
          font: { name: "Arial", sz: 12, bold: false, color: { rgb: "000000" } },
          alignment: { horizontal: "right", vertical: "center" },
          fill: transparent
        },
        tableHeader: {
          font: { name: "Arial", sz: 11, bold: true, color: { rgb: "000000" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
          fill: { fgColor: { rgb: "FFFFFF" } } // White background as requested ("Black and White")
        },
        cell: {
          font: { name: "Arial", sz: 11, color: { rgb: "000000" } },
          border: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
          alignment: { vertical: "center", horizontal: "left" }
        },
        cellCenter: {
          font: { name: "Arial", sz: 11, color: { rgb: "000000" } },
          border: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
          alignment: { vertical: "center", horizontal: "center" }
        },
        totalRowLabel: {
          font: { name: "Arial", sz: 12, bold: true, color: { rgb: "000000" } }, // Uppercase CƏMİ
          border: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
          alignment: { horizontal: "left", vertical: "center", indent: 1 }
        },
        totalRowValue: {
          font: { name: "Arial", sz: 12, bold: true, color: { rgb: "000000" } },
          border: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
          alignment: { horizontal: "center", vertical: "center" }
        },
        footerText: {
          font: { name: "Arial", sz: 11, bold: true, color: { rgb: "000000" } },
          fill: transparent
        }
      };

      // Apply Styles Loop
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
          if (!worksheet[cell_ref]) continue;

          // 1. Title Row (Row 0)
          if (R === 0) {
            worksheet[cell_ref].s = styles.title;
          }
          // 2. Info Row (Row 2) - "Tarix", Info, Qaimə
          else if (R === 2) {
            if (C === 0) worksheet[cell_ref].s = styles.infoLabel;
            else if (C === 4) worksheet[cell_ref].s = styles.infoRight;
            else worksheet[cell_ref].s = styles.infoValue;
          }
          // 3. Table Header (Row 4)
          else if (R === 4) {
            worksheet[cell_ref].s = styles.tableHeader;
          }
          // 4. Product Rows (Row 5 to lastProductRowIndex)
          // We strictly want to border only the product rows, NOT the spacer rows.
          else if (R > 4 && R <= lastProductRowIndex) {
            // Cols: 0(N), 1(Adı), 2(Sayı), 3(Qiyməti), 4(Cəmi)
            // Center N, Sayı, Qiyməti, Cəmi. Left Adı.
            if (C === 1) worksheet[cell_ref].s = styles.cell;
            else worksheet[cell_ref].s = styles.cellCenter;
          }
          // 5. Total Row
          else if (R === totalRowIndex) {
            if (C === 0) worksheet[cell_ref].s = styles.totalRowLabel; // CƏMİ (merged A-D)
            else if (C === 4) worksheet[cell_ref].s = styles.totalRowValue; // Value
            else worksheet[cell_ref].s = styles.totalRowLabel;
          }
          // 6. Footer (Rows after total)
          else if (R > totalRowIndex) {
            // TƏHVİL VERDİ / ALDI
            worksheet[cell_ref].s = styles.footerText;
          }
        }
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(branchName));
    });

    // Generate binary as buffer
    const wbout = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const fileName = `AidasCorners_Orders_${dateStr}.xlsx`;

    // Web platform - download directly
    if (Platform.OS === 'web') {
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Native platform - use expo-file-system
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    // Convert buffer to base64
    const base64Data = bufferToBase64(wbout as ArrayBuffer);

    // Write file using FileSystem
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: 'base64',
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Sifarişləri Excel-ə ixrac et',
      });
    } else {
      console.error('Bu cihazda paylaşım mümkün deyil');
    }
  } catch (error) {
    console.error('Excel-ə ixrac edilərkən xəta baş verdi:', error);
    throw error;
  }
}

/**
 * Converts ArrayBuffer to Base64 string
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Formats date for filename (DD-MM-YYYY)
 */
function formatDateForFileName(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Formats date for display (DD.MM.YYYY)
 */
function formatDateDisplay(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Sanitizes sheet name (Excel has 31 char limit)
 */
function sanitizeSheetName(name: string): string {
  let sanitized = name.replace(/[\\/?*[\]]/g, '');
  if (sanitized.length > 31) {
    sanitized = sanitized.substring(0, 31);
  }
  return sanitized || 'Sheet';
}
