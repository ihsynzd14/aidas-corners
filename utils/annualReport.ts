import XLSX from 'xlsx-js-style';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { getBranches, fetchOrdersForDateRange, formatDate, getProductCorrections } from './firebase';
import { Branch } from '@/types/branch';

const MONTHS_AZ = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
    'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
];

// Map month index: Jan(0) to Dec(11)
const REPORT_MONTHS_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const generateAnnualReport = async (startYear: number, endYear: number) => {
    try {
        // 1. Fetch Basic Data
        const [branches, productsMap] = await Promise.all([
            getBranches(),
            getProductPriceMap()
        ]);

        // 2. Define Date Range (Jan 1st startYear to Dec 31st endYear)
        const startDate = new Date(startYear, 0, 1);
        const endDate = new Date(endYear, 11, 31);

        console.log(`Generating report for: ${formatDate(startDate)} - ${formatDate(endDate)}`);

        // 3. Fetch Orders
        const ordersMap = await fetchOrdersForDateRange(startDate, endDate);

        // 4. Aggregate Data
        // Structure: BranchID -> MonthIndex (0-11 relative to report) -> TotalEarnings
        const earningsMatrix: Record<string, number[]> = {};

        // Initialize matrix
        branches.forEach(branch => {
            earningsMatrix[branch.id] = new Array(12).fill(0);
        });

        // Explicit Mappings (Source Order Name -> Target Branch Name)
        const BRANCH_ALIASES: Record<string, string> = {
            'Coffemania Azadlıq': 'Azadlıq',
            'Coffemania Dəniz mall': 'Dəniz mall',
            'Coffemania Əhmədli': 'Əhmədli',
            'Coffemania Gəncə': 'Gəncə',
            'Next Mərkəz': 'Mərkəz',
            'Coffemania Nərimanov': 'Nərimanov',
            'Next Sea breeze': 'Sea breeze',
            // Handling variations user mentioned:
            'Dəniz Mall': 'Dəniz mall',
            'Next Sea Breeze': 'Sea breeze',
            'Coffemania Azadlıq': 'Azadlıq' // Ensuring duplicates don't hurt
        };

        // Helper: Normalize string for matching
        const normalizeBranchName = (name: string) => {
            return name.toLowerCase().trim()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                .replace(/ə/g, 'e').replace(/ı/g, 'i')
                .replace(/[^a-z0-9]/g, '');
        };

        // Process each day's orders
        ordersMap.forEach((dailySnapshot, dateStr) => {
            const [day, month, year] = dateStr.split('.').map(Number);
            const date = new Date(year, month - 1, day);
            const monthIndex = date.getMonth();

            // Simple Calendar View: Month Index is the column (0-11)
            const reportMonthIndex = monthIndex;

            dailySnapshot.docs.forEach((branchDoc: any) => {
                const branchNameFromOrder = branchDoc.id;

                // --- MATCHING LOGIC ---
                // 1. Check Exact Match
                let branch = branches.find(b => b.id === branchNameFromOrder || b.name === branchNameFromOrder);

                // 2. Check Specific Aliases
                if (!branch) {
                    const mappedName = BRANCH_ALIASES[branchNameFromOrder];
                    if (mappedName) {
                        branch = branches.find(b => b.name === mappedName || b.id === mappedName);
                    }
                }

                // 3. Try "Contains" Match (e.g. "Coffemania Azadlıq" contains "Azadlıq")
                if (!branch) {
                    branch = branches.find(b => {
                        // Check if Order Name contains Branch Name (e.g. Coffemania Azadliq contains Azadliq)
                        // OR Branch Name contains Order Name (less likely here but good for safety)
                        return branchNameFromOrder.includes(b.name) || b.name.includes(branchNameFromOrder);
                    });
                }

                // 4. Try Normalized Match
                if (!branch) {
                    const targetNorm = normalizeBranchName(branchNameFromOrder);
                    branch = branches.find(b => normalizeBranchName(b.name) === targetNorm || normalizeBranchName(b.id) === targetNorm);
                }

                if (!branch) {
                    console.warn(`[AnnualReport] Skipping unknown branch: '${branchNameFromOrder}'`);
                    return;
                }

                const data = branchDoc.data();
                let dailyTotal = 0;

                Object.entries(data).forEach(([productName, quantityStr]) => {
                    const price = productsMap.get(productName);
                    const quantity = parseFloat(quantityStr as string);

                    if (price && !isNaN(quantity)) {
                        dailyTotal += price * quantity;
                    }
                });

                if (earningsMatrix[branch.id]) {
                    earningsMatrix[branch.id][reportMonthIndex] += dailyTotal;
                }
            });
        });

        // 5. Generate Excel
        const wb = XLSX.utils.book_new();
        const wsData: any[][] = [];

        // Row 1: Empty
        wsData.push([""]);

        // Row 2: Header
        const headerRow = [
            `${startYear}-${endYear}`,
            ...REPORT_MONTHS_ORDER.map(m => MONTHS_AZ[m])
            // Removed Total Column
        ];
        wsData.push(headerRow);

        // Branch Rows
        const totalsByMonth = new Array(12).fill(0);
        // Removed allBranchesTotal

        // Sort branches alphabetically
        const sortedBranches = [...branches].sort((a, b) => a.name.localeCompare(b.name));

        sortedBranches.forEach(branch => {
            const branchEarnings = earningsMatrix[branch.id];
            // Removed branchTotal calculation

            branchEarnings.forEach((val, idx) => {
                totalsByMonth[idx] += val;
            });

            const row = [
                branch.name,
                ...branchEarnings.map(val => val === 0 ? "" : val)
                // Removed branchTotal from row
            ];
            wsData.push(row);
        });

        // Totals Row
        const totalRow = [
            "",
            ...totalsByMonth
            // Removed allBranchesTotal from row
        ];
        wsData.push(totalRow);

        // Shift data for Col B start
        const finalData = wsData.map(row => ["", ...row]);
        const ws = XLSX.utils.aoa_to_sheet(finalData);

        // Col Widths
        ws['!cols'] = [
            { wch: 5 }, // A
            { wch: 20 }, // B (Branch)
            ...Array(12).fill({ wch: 12 })
            // Removed Total col width
        ];

        // Styles
        const range = XLSX.utils.decode_range(ws['!ref']!);
        const borderStyle = { style: 'thin', color: { rgb: "000000" } };

        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const addr = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[addr]) continue;

                // Base style
                const style: any = {
                    font: { name: "Calibri", sz: 11 },
                    alignment: { vertical: "center", horizontal: "center" },
                    border: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle }
                };

                // Logic driven styling
                if (R === 1) { // Header Row
                    style.font = { bold: true };
                    style.fill = { fgColor: { rgb: "FFFFFF" } };
                } else if (R === range.e.r) { // Total Row
                    style.font = { bold: true };
                    style.border.top = { style: "medium" };
                } else if (C === 1) { // Branch Name Col
                    style.alignment.horizontal = "left";
                } else {
                    // Data Cells - Format money string
                    if (typeof ws[addr].v === 'number') {
                        ws[addr].v = ws[addr].v.toFixed(2).replace('.', ',');
                    }
                }
                ws[addr].s = style;
            }
        }

        // Append Sheet
        XLSX.utils.book_append_sheet(wb, ws, "Illik Hesabat");

        // 6. Export Logic (BUFFER METHOD)
        const wbout = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        const fileName = `Illik_Hesabat_${startYear}_${endYear}.xlsx`;

        // Web Fallback
        if (Platform.OS === 'web') {
            const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            return;
        }

        // Native
        const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
        const base64Data = bufferToBase64(wbout);

        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: 'base64'
        });

        await Sharing.shareAsync(fileUri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Illik Hesabatı Paylaş'
        });

    } catch (error) {
        console.error("Error generating annual report:", error);
        throw error;
    }
};

function bufferToBase64(buffer: any): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function getProductPriceMap(): Promise<Map<string, number>> {
    const products = await getProductCorrections();
    const map = new Map<string, number>();
    products.forEach(p => {
        if (p.price) {
            map.set(p.correct, p.price);
        }
    });
    return map;
}
