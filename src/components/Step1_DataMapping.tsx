import React, { useCallback, useState, useRef } from 'react';
import type { School, Score, SupportLevel } from '../types';
import { ALL_SCORE_FIELDS, HIERARCHICAL_CATEGORIES } from '../constants';
import ExportControls from './ExportControls';

const SUPPORT_LEVELS: SupportLevel[] = ['מלא', 'חלקי', 'מצומצם', 'מנהלים חדשים'];

// Props for SchoolRow
interface SchoolRowProps {
  school: School;
  onUpdate: (id: number, field: keyof School, value: any) => void;
  onRemove: (id: number) => void;
}

const SchoolRow: React.FC<SchoolRowProps> = React.memo(({ school, onUpdate, onRemove }) => {
    return (
        <tr className="bg-white hover:bg-gray-50">
            <td className="p-1 border-b border-gray-200 align-top sticky right-0 bg-white z-10">
                <input
                    type="text"
                    value={school.name}
                    onChange={(e) => onUpdate(school.id, 'name', e.target.value)}
                    placeholder="שם ביה'ס"
                    className="w-32 p-2 border border-gray-300 rounded-md text-sm"
                />
            </td>
             <td className="p-1 border-b border-gray-200 align-top">
                <input
                    type="text"
                    value={school.principal}
                    onChange={(e) => onUpdate(school.id, 'principal', e.target.value)}
                    placeholder="מנהל/ת"
                    className="w-28 p-2 border border-gray-300 rounded-md text-sm"
                />
            </td>
            <td className="p-1 border-b border-gray-200 align-top">
                <input
                    type="number"
                    value={school.students}
                    onChange={(e) => onUpdate(school.id, 'students', e.target.value)}
                    placeholder="מס'"
                    className="w-20 p-2 border border-gray-300 rounded-md text-sm"
                />
            </td>
            <td className="p-1 border-b border-gray-200 align-top">
                 <select
                    value={school.supportLevel}
                    onChange={(e) => onUpdate(school.id, 'supportLevel', e.target.value as SupportLevel)}
                    className="w-28 p-2 border border-gray-300 rounded-md text-sm bg-white"
                >
                    <option value="">בחר</option>
                    {SUPPORT_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                    ))}
                </select>
            </td>
            {ALL_SCORE_FIELDS.map(field => (
                <td key={field} className="p-1 border-b border-gray-200 align-top">
                    <input
                        type="number"
                        min="1"
                        max="4"
                        value={(school[field] as Score) || ''}
                        onChange={(e) => onUpdate(school.id, field, e.target.value as Score)}
                        className="w-16 p-2 border border-gray-300 rounded-md text-sm"
                    />
                </td>
            ))}
            <td className="p-1 border-b border-gray-200 align-top">
                <textarea
                    rows={1}
                    value={school.notes}
                    onChange={(e) => onUpdate(school.id, 'notes', e.target.value)}
                    placeholder="הערות"
                    className="w-48 p-2 border border-gray-300 rounded-md text-sm"
                ></textarea>
            </td>
            <td className="p-1 border-b border-gray-200 align-top text-center sticky left-0 bg-white z-10">
                <button onClick={() => onRemove(school.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full">
                    🗑️
                </button>
            </td>
        </tr>
    );
});

// Main Component for Step 1
interface Step1Props {
  schools: School[];
  setSchools: React.Dispatch<React.SetStateAction<School[]>>;
  onComplete: () => void;
  onReset: () => void;
}

const Step1_DataMapping: React.FC<Step1Props> = ({ schools, setSchools, onComplete, onReset }) => {
    const [nextId, setNextId] = useState(schools.length > 0 ? Math.max(...schools.map(s => s.id)) + 1 : 1);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const addSchool = useCallback(() => {
        const createEmptySchool = (id: number): School => {
            const school: any = { id, name: '', principal: '', students: '', supportLevel: '', notes: '' };
            ALL_SCORE_FIELDS.forEach(field => {
                school[field] = '';
            });
            return school as School;
        };
        const newSchool = createEmptySchool(nextId);
        setSchools(prev => [...prev, newSchool]);
        setNextId(prev => prev + 1);
    }, [nextId, setSchools]);

    const removeSchool = useCallback((id: number) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את בית הספר?')) {
            setSchools(prev => prev.filter(school => school.id !== id));
        }
    }, [setSchools]);

    const updateSchool = useCallback((id: number, field: keyof School, value: any) => {
        setSchools(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    }, [setSchools]);

    const handleExportCSV = useCallback(() => {
        const baseHeaders = ['שם בית הספר', 'מנהל/ת', 'מספר תלמידים', 'רמת ליווי'];
        const scoreHeaders = ALL_SCORE_FIELDS.map(field => {
            for (const cat of HIERARCHICAL_CATEGORIES) {
                for (const subCat of cat.subCategories) {
                    const metric = subCat.metrics.find(m => m.key === field);
                    if (metric) {
                        return `${cat.name} - ${subCat.name} - ${metric.name}`;
                    }
                }
            }
            return field;
        });
        const finalHeaders = [...baseHeaders, ...scoreHeaders, 'הערות'];

        const csvRows = schools.map(school => {
            const row = [
                school.name,
                school.principal,
                school.students,
                school.supportLevel,
                ...ALL_SCORE_FIELDS.map(field => school[field]),
                school.notes
            ];
            return row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = [finalHeaders.join(','), ...csvRows].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'טבלת_נתונים_גולמית.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [schools]);

    return (
        <div className="p-4 md:p-8">
            <header className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">שלב 1: מיפוי ואימות נתונים</h1>
                <p className="text-gray-500 mt-2 text-lg">
                    טבלה זו מציגה את כל הנתונים שחולצו מהקובץ. ניתן לערוך, להוסיף או למחוק שורות לפני המעבר לניתוח.
                </p>
            </header>

            <div ref={tableContainerRef} className="data-mapping-table-container overflow-x-auto border border-gray-200 rounded-lg shadow-md bg-white">
                <table className="min-w-full bg-white text-sm" style={{ tableLayout: 'fixed' }}>
                     <thead className="bg-gray-100 sticky top-0 z-20 text-xs">
                        {/* Main Category Row */}
                        <tr>
                            <th colSpan={4} rowSpan={3} className="p-2 text-center border-b-2 border-gray-300 font-bold sticky right-0 bg-gray-100 z-30">פרטי בית הספר</th>
                            {HIERARCHICAL_CATEGORIES.map(cat => (
                                <th key={cat.name} colSpan={cat.subCategories.flatMap(sc => sc.metrics).length} className="p-2 text-center border-b-2 border-l border-gray-300 font-bold">
                                    {cat.name}
                                </th>
                            ))}
                             <th colSpan={2} rowSpan={3} className="p-2 text-center border-b-2 border-l border-gray-300 font-bold sticky left-0 bg-gray-100 z-30">סיכום ופעולות</th>
                        </tr>
                        {/* Sub Category Row */}
                        <tr>
                            {HIERARCHICAL_CATEGORIES.flatMap(cat => cat.subCategories).map(subCat => (
                                <th key={subCat.key} colSpan={subCat.metrics.length} className="p-2 text-center border-b-2 border-l border-gray-300 font-bold bg-gray-200">
                                    {subCat.name}
                                </th>
                            ))}
                        </tr>
                        {/* Metric Row */}
                        <tr>
                            {HIERARCHICAL_CATEGORIES.flatMap(cat => cat.subCategories.flatMap(sc => sc.metrics)).map(metric => (
                                <th key={metric.key} className="p-2 text-center border-l border-gray-200 font-medium h-48" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>
                                    <span className="max-w-[150px] inline-block">{metric.name}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {schools.length > 0 ? (
                            schools.map(school => (
                                <SchoolRow key={school.id} school={school} onUpdate={updateSchool} onRemove={removeSchool} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6 + ALL_SCORE_FIELDS.length} className="text-center p-12 text-gray-500">
                                    <h3 className="text-xl font-semibold">לא נטענו נתונים</h3>
                                    <p>חזור אחורה כדי לטעון קובץ או לחץ על "הוסף בית ספר" כדי להתחיל ידנית.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

             <div className="mt-6 flex flex-wrap gap-4 justify-center items-center">
                <button onClick={addSchool} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">➕ הוסף בית ספר</button>
                 <ExportControls 
                    targetRef={tableContainerRef} 
                    reportName="טבלת-נתונים-גולמית"
                    onExportCSV={handleExportCSV}
                 />
                <div className="flex-grow text-center">
                    <p className="text-lg font-semibold text-gray-700">
                        סה"כ: <strong>{schools.length}</strong> בתי ספר במיפוי
                    </p>
                </div>
                 <button onClick={onReset} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition">🔄 התחל מחדש</button>
            </div>

            <div className="mt-8 text-center">
                <button onClick={onComplete} disabled={schools.length === 0} className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white text-lg font-bold rounded-lg shadow-xl hover:from-green-600 hover:to-teal-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    המשך לניתוח נתונים ←
                </button>
            </div>
        </div>
    );
};

export default Step1_DataMapping;