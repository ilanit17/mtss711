// Fix: Use the global XLSX object provided by the CDN script instead of module import.
declare const XLSX: any;

import type { ParsedData, School } from '../types';
import { ALL_SCORE_FIELDS, FIELD_HEBREW_MAP } from '../constants';

/**
 * Calculates the similarity between two strings based on Dice's Coefficient.
 * This is useful for matching column headers that may have typos or variations.
 * @param str1 The first string.
 * @param str2 The second string.
 * @returns A number between 0 and 1, where 1 is a perfect match.
 */
function stringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim().replace(/\s+/g, ' ');
    const s2 = str2.toLowerCase().trim().replace(/\s+/g, ' ');

    if (s1 === s2) return 1;
    // Short strings are not good candidates for bigram analysis
    if (s1.length < 2 || s2.length < 2) return 0;

    const getBigrams = (s: string): Map<string, number> => {
        const bigrams = new Map<string, number>();
        for (let i = 0; i < s.length - 1; i++) {
            const bigram = s.substring(i, i + 2);
            bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
        }
        return bigrams;
    };

    const bigrams1 = getBigrams(s1);
    const bigrams2 = getBigrams(s2);
    
    let intersectionSize = 0;
    const totalBigrams = (s1.length - 1) + (s2.length - 1);
    
    if (totalBigrams === 0) return 0;

    for (const [bigram, count1] of bigrams1.entries()) {
        if (bigrams2.has(bigram)) {
            intersectionSize += Math.min(count1, bigrams2.get(bigram)!);
        }
    }

    return (2 * intersectionSize) / totalBigrams;
}


const createEmptySchool = (id: number): School => {
    const school: any = {
        id, name: '', principal: '', students: '', supportLevel: '', notes: ''
    };
    ALL_SCORE_FIELDS.forEach(field => {
        school[field] = '';
    });
    return school as School;
};

const parseRow = (row: any[], columnIndexMap: (keyof School | string)[]): School => {
    const school = createEmptySchool(0); // ID will be assigned later
    row.forEach((value, i) => {
        const field = columnIndexMap[i] as keyof School;
        // Check if the field is a recognized key of the School object
        if (field && typeof field === 'string' && Object.keys(school).includes(field)) {
            (school as any)[field] = String(value || '').trim();
        }
    });
    return school;
}

const getColumnIndexMap = (headers: string[]): (keyof School | string)[] => {
    // 1. Create a definitive map of target fields and their known variations.
    const targetFields: { field: keyof School; variations: string[] }[] = [];
    
    // Add base fields with more variations for better matching
    targetFields.push(
        { field: 'name', variations: ['שם בית הספר', 'בית ספר', 'school name', 'school', 'שם ביה"ס', 'שם ביהס'] },
        { field: 'principal', variations: ['שם המנהל/ת', 'מנהל/ת', 'מנהל', 'principal', 'שם המנהל'] },
        { field: 'students', variations: ["מספר תלמידים", "מס' תלמידים", 'תלמידים', 'students', 'סהכ תלמידים'] },
        { field: 'supportLevel', variations: ['רמת ליווי', 'ליווי', 'support level', 'סוג ליווי'] },
        { field: 'notes', variations: ['הערות', 'notes', 'הערה'] }
    );
    
    // Add all score fields from the map, creating variations for better matching
    for (const [key, hebrewName] of Object.entries(FIELD_HEBREW_MAP)) {
        const hebrewVariations = [hebrewName];
        const parts = hebrewName.split(' - ');
        if (parts.length > 1) {
            hebrewVariations.push(parts[1]); // e.g., "החזון ברור ומוסכם"
        }
        targetFields.push({ field: key as keyof School, variations: [...hebrewVariations, key] });
    }

    const SIMILARITY_THRESHOLD = 0.7;
    const mappedFields = new Set<keyof School>();

    return headers.map(header => {
        if (!header || typeof header !== 'string') return header; // Handle empty/invalid header cells
        
        let bestMatch: { field: keyof School | null; score: number } = { field: null, score: 0.0 };

        for (const target of targetFields) {
            // Skip if this field has already been confidently mapped to another column
            if (mappedFields.has(target.field)) continue;

            for (const variation of target.variations) {
                const score = stringSimilarity(header, variation);
                if (score > bestMatch.score) {
                    bestMatch = { field: target.field, score: score };
                }
            }
        }
        
        if (bestMatch.field && bestMatch.score >= SIMILARITY_THRESHOLD) {
            // Add to mapped fields to prevent mapping another column to the same target field
            mappedFields.add(bestMatch.field);
            return bestMatch.field;
        } else {
            return header; // Keep original if no confident match
        }
    });
};

const parseSchoolsFromCSV = (csvText: string): School[] => {
    let text = csvText;
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); // Remove BOM

    const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
    if (rows.length < 2) throw new Error("CSV חייב להכיל שורת כותרת ולפחות שורת נתונים אחת.");

    const headerRow = rows[0];
    const dataRows = rows.slice(1);
    const delimiter = [',', ';', '\t'].sort((a, b) => headerRow.split(b).length - headerRow.split(a).length)[0];
    const headers = headerRow.split(delimiter).map(h => h.trim().replace(/"/g, ''));
    
    const columnIndexMap = getColumnIndexMap(headers);

    return dataRows.map((rowStr, index) => {
        const values = rowStr.split(delimiter).map(v => v.trim().replace(/"/g, ''));
        const school = parseRow(values, columnIndexMap);
        school.id = index + 1;
        if (!school.name) school.name = `בית ספר ${index + 1}`;
        return school;
    });
};

const parseSchoolsFromXLSX = (data: ArrayBuffer): School[] => {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'dd/mm/yyyy' });

    if (json.length < 2) throw new Error("קובץ Excel חייב להכיל שורת כותרת ולפחות שורת נתונים אחת.");

    const headers = (json[0] as any[]).map(h => String(h || '').trim());
    const dataRows = json.slice(1);
    
    const columnIndexMap = getColumnIndexMap(headers);
    
    return dataRows.map((row: any[], index) => {
        const school = parseRow(row, columnIndexMap);
        school.id = index + 1;
        if (!school.name) school.name = `בית ספר ${index + 1}`;
        return school;
    }).filter(s => s.name); // Filter out potentially empty rows
};

export const parseFile = async (file: File): Promise<ParsedData> => {
    try {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        let schools: School[];

        if (fileExtension === 'csv' || fileExtension === 'txt') {
            const text = await file.text();
            schools = parseSchoolsFromCSV(text);
        } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            const buffer = await file.arrayBuffer();
            schools = parseSchoolsFromXLSX(buffer);
        } else {
            throw new Error("סוג קובץ לא נתמך. יש להעלות קבצי CSV או Excel.");
        }
        
        if (schools.length === 0) {
            throw new Error("לא נמצאו נתונים בקובץ.");
        }

        return {
            schools,
            metadata: {
                fileName: file.name,
                fileType: file.type || 'N/A',
                columns: schools.length > 0 ? Object.keys(schools[0]) : [],
            },
        };
    } catch (error) {
        console.error("Internal parsing error:", error);
        if (error instanceof Error) {
            throw new Error(`אירעה שגיאה בניתוח הקובץ: ${error.message}`);
        }
        throw new Error("אירעה שגיאה פנימית בלתי צפויה בניתוח הקובץ.");
    }
};