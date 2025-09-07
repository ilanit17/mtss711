import React, { useMemo } from 'react';
import { School } from '../types';
import { SchoolReportCard as SchoolReportCardType } from '../types/schoolAssessmentTypes';
import { HIERARCHICAL_CATEGORIES } from '../constants';

interface DetailedSchoolReportProps {
    report: SchoolReportCardType;
}

const DetailedSchoolReport: React.FC<DetailedSchoolReportProps> = ({ report }) => {
    const { school } = report;

    const getScoreColor = (score: number) => {
        if (score >= 3.2) return '#27ae60'; // green
        if (score >= 2.5) return '#f39c12'; // yellow
        if (score >= 1.8) return '#e67e22'; // orange
        return '#e74c3c'; // red
    };

    const getTierInfo = (tier: number) => {
        switch (tier) {
            case 1: return { text: 'תפקוד מצוין', color: '#27ae60' };
            case 2: return { text: 'תפקוד בינוני', color: '#f39c12' };
            case 3: return { text: 'תפקוד נמוך', color: '#e74c3c' };
            default: return { text: 'לא נקבע', color: '#7f8c8d' };
        }
    };
    
    const tierInfo = getTierInfo(report.performanceTier);

    const challengesBySubCategory = useMemo(() => {
        return report.challenges.reduce((acc, challenge) => {
            (acc[challenge.subCategory] = acc[challenge.subCategory] || []).push(challenge.text);
            return acc;
        }, {} as Record<string, string[]>);
    }, [report.challenges]);


    return (
        <div className="bg-white p-6 rounded-lg shadow-md font-sans">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{school.name}</h2>
            <p className="text-center text-gray-600 mb-6">דוח אבחון בית ספרי</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-sm">
                <div className="bg-gray-100 p-3 rounded-md"><strong>מנהל/ת:</strong> {school.principal}</div>
                <div className="bg-gray-100 p-3 rounded-md"><strong>תלמידים:</strong> {school.students}</div>
                <div className="bg-gray-100 p-3 rounded-md"><strong>רמת ליווי:</strong> {school.supportLevel}</div>
                <div className="bg-gray-100 p-3 rounded-md"><strong>רמת תפקוד:</strong> 
                    <span className="font-bold px-2 py-1 rounded-full text-white text-xs ml-2" style={{ backgroundColor: tierInfo.color }}>
                        {tierInfo.text}
                    </span>
                </div>
            </div>

            {report.strengths.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">נקודות חוזק מרכזיות</h3>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg" role="alert">
                        <ul className="list-disc list-inside space-y-2 text-green-800">
                            {report.strengths.map((strength, index) => {
                                const parts = strength.split(':');
                                const subCategory = parts[0];
                                const statement = parts.slice(1).join(':');
                                return (
                                    <li key={index}>
                                        <span className="font-bold">{subCategory}:</span>
                                        <span className="font-medium ml-1">{statement}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}

            <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">ציונים לפי תחומי הערכה (ממוצע)</h3>
            <div className="space-y-2 mb-8">
                {Object.entries(report.domainAverages).map(([domain, avg]) => (
                    <div key={domain} className="grid grid-cols-[220px,1fr,40px] gap-2 items-center text-sm">
                        <span className="font-semibold text-gray-600">{domain}</span>
                        <div className="w-full bg-gray-200 rounded-full h-5">
                            <div className="h-5 rounded-full text-white text-xs flex items-center pl-2" style={{ width: `${(avg / 4) * 100}%`, backgroundColor: getScoreColor(avg) }}>
                            </div>
                        </div>
                        <span className="font-bold text-gray-800 text-left">{avg.toFixed(2)}</span>
                    </div>
                ))}
            </div>
            
            <h3 className="text-xl font-bold text-gray-700 mb-4 mt-8 border-b pb-2">פירוט מלא לפי תחומי הערכה</h3>
            <div className="space-y-8">
                {HIERARCHICAL_CATEGORIES.map(category => (
                    <div key={category.name}>
                        <h4 className="text-lg font-bold text-gray-800 mb-4">{category.name}</h4>
                        <div className="space-y-4">
                            {category.subCategories.map(subCat => {
                                // Calculate average for the sub-category
                                const subCatScores = subCat.metrics.map(m => parseInt(school[m.key] as string, 10)).filter(s => !isNaN(s) && s > 0);
                                const subCatAvg = subCatScores.length > 0 ? subCatScores.reduce((a,b) => a+b, 0) / subCatScores.length : 0;
                                
                                const challenges = challengesBySubCategory[subCat.name] || [];

                                return (
                                    <div key={subCat.key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-gray-700 text-md">{subCat.name}</span>
                                             <span className="text-2xl font-bold" style={{ color: getScoreColor(subCatAvg) }}>{subCatAvg.toFixed(1)}</span>
                                        </div>
                                        <div className="mt-2 pl-4">
                                            {challenges.length > 0 ? (
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-600 mb-1">אתגרים שזוהו:</p>
                                                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-red-800">
                                                        {challenges.map((challenge, index) => (
                                                            <li key={index}>{challenge}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : <p className="text-sm text-gray-500 italic mt-1">לא זוהו אתגרים בתחום זה</p>}
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

export default DetailedSchoolReport;