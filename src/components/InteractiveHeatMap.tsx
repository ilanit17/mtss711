import React, { useState, useMemo, useRef } from 'react';
import type { SchoolForAnalysis } from '../types';
import { HIERARCHICAL_CATEGORIES } from '../constants';

declare const html2canvas: any;

interface InteractiveHeatMapProps {
    schools: SchoolForAnalysis[];
    focusOnTier?: number;
}

const InteractiveHeatMap: React.FC<InteractiveHeatMapProps> = ({ schools, focusOnTier }) => {
    const [activeTier, setActiveTier] = useState<number>(focusOnTier || 0); // 0 for all
    const heatMapRef = useRef<HTMLDivElement>(null);

    const filteredSchools = useMemo(() => {
        if (activeTier === 0) return schools;
        return schools.filter(s => s.tier === activeTier);
    }, [schools, activeTier]);

    const calculateSubCategoryAverage = (subCategoryKey: string, metrics: { key: string; name: string }[]) => {
        const relevantScores = filteredSchools.flatMap(school =>
            metrics.map(m => parseInt(school[m.key] as string, 10))
        ).filter(score => !isNaN(score) && score > 0);

        const average = relevantScores.length > 0 ? relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length : 0;
        
        const affectedSchoolsCount = filteredSchools.filter(school => 
            metrics.some(m => {
                const score = parseInt(school[m.key] as string, 10);
                return !isNaN(score) && score <= 3;
            })
        ).length;

        return { average, affectedSchoolsCount, total: filteredSchools.length };
    };

    const subCategoryAverages = useMemo(() => {
        const data: { [key: string]: { average: number; affectedSchoolsCount: number; total: number } } = {};
        HIERARCHICAL_CATEGORIES.forEach(category => {
            category.subCategories.forEach(subCat => {
                data[subCat.key] = calculateSubCategoryAverage(subCat.key, subCat.metrics);
            });
        });
        return data;
    }, [filteredSchools]);

    const getColor = (score: number) => {
        if (score >= 3.5) return 'bg-green-800'; // Excellent
        if (score >= 3.0) return 'bg-green-600'; // Good
        if (score >= 2.5) return 'bg-yellow-400'; // Medium
        if (score >= 2.0) return 'bg-orange-500'; // High Challenge
        return 'bg-red-600'; // Critical Challenge
    };

    const exportToPng = async () => {
        const element = heatMapRef.current;
        if (!element) return;
        const canvas = await html2canvas(element, { scale: 2 });
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `heatmap_tier_${activeTier}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToCsv = () => {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for UTF-8 Excel compatibility
        csvContent += "תחום ראשי,תת-תחום,ממוצע ציונים,מספר בתי ספר מושפעים,סך הכל בתי ספר\n";

        HIERARCHICAL_CATEGORIES.forEach(category => {
            category.subCategories.forEach(subCat => {
                const data = subCategoryAverages[subCat.key];
                if (data) {
                    const row = [category.name, subCat.name, data.average.toFixed(2), data.affectedSchoolsCount, data.total].join(',');
                    csvContent += row + "\n";
                }
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `heatmap_data_tier_${activeTier}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const tierLabels: {[key: number]: string} = {
        0: 'כלל בתי הספר',
        1: 'תפקוד מצוין',
        2: 'תפקוד בינוני',
        3: 'תפקוד נמוך'
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">מפת חום אינטראקטיבית</h2>
                    <p className="text-gray-500">ניתוח תחומי האתגר והחוזק לפי רמות תפקוד</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {[0, 1, 2, 3].map(tier => (
                        <button
                            key={tier}
                            onClick={() => setActiveTier(tier)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                                activeTier === tier
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-200 border'
                            }`}
                        >
                            {tierLabels[tier]}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportToPng} className="text-sm bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700">ייצוא תמונה (PNG)</button>
                    <button onClick={exportToCsv} className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700">ייצוא נתונים (CSV)</button>
                </div>
            </div>

            <div ref={heatMapRef} className="bg-white p-4 rounded-md">
                {HIERARCHICAL_CATEGORIES.map(category => (
                    <div key={category.name} className="mb-6 last:mb-0">
                        <h3 className="text-lg font-extrabold text-gray-700 mb-3 border-r-4 border-blue-500 pr-3">{category.name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {category.subCategories.map(subCat => {
                                const data = subCategoryAverages[subCat.key];
                                if (!data) return null;
                                return (
                                    <div key={subCat.key} className={`p-3 rounded-lg text-white shadow-sm relative group cursor-pointer ${getColor(data.average)}`}>
                                        <div className="font-bold truncate">{subCat.name}</div>
                                        <div className="text-2xl font-black">{data.average.toFixed(2)}</div>
                                        <div className="text-xs opacity-80">{data.affectedSchoolsCount} מתוך {data.total} בתי"ס עם אתגר</div>
                                        
                                        <div className="absolute bottom-full mb-2 right-1/2 transform translate-x-1/2 w-48 bg-gray-800 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            <p><span className="font-bold">תחום:</span> {subCat.name}</p>
                                            <p><span className="font-bold">ממוצע:</span> {data.average.toFixed(3)}</p>
                                            <p><span className="font-bold">בתי"ס עם אתגר:</span> {data.affectedSchoolsCount}</p>
                                            <p><span className="font-bold">סה"כ בתי"ס:</span> {data.total}</p>
                                            <div className="absolute top-full right-1/2 transform -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InteractiveHeatMap;