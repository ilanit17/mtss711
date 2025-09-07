import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { School, AnalysisData, Insight, SchoolForAnalysis, Score } from '../types';
import { ALL_SCORE_FIELDS, HIERARCHICAL_CATEGORIES, NEW_CHALLENGE_CATEGORIES_FOR_REPORT, METRIC_TO_CHALLENGE_MAP } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LabelList } from 'recharts';
import SchoolDataTable from './SchoolDataTable';
import DetailedSchoolReport from './SchoolReportCard';
import { SchoolAssessmentData, SchoolReportCard as SchoolReportCardType } from '../types/schoolAssessmentTypes';
import ExportControls from './ExportControls';
import InteractiveHeatMap from './InteractiveHeatMap';
import { Award } from 'lucide-react';


interface Step2Props {
  schoolsData: School[];
  onAnalysisComplete: (data: AnalysisData) => void;
}

const COLORS = ['#e74c3c', '#f39c12', '#27ae60'];
const PIE_COLORS = ['#667eea', '#764ba2', '#8e44ad', '#9b59b6'];


const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
    </div>
);

const MTSS_TIERS_INFO = {
    tier1: { title: "תפקוד מצוין", description: "בתי ספר המציגים תפקוד גבוה ברוב המדדים.", style: "bg-green-50 border-green-500", titleStyle: "text-green-700", countStyle: "bg-green-600" },
    tier2: { title: "תפקוד בינוני", description: "בתי ספר המציגים תפקוד הטרוגני ודורשים תמיכה ממוקדת.", style: "bg-yellow-50 border-yellow-500", titleStyle: "text-yellow-700", countStyle: "bg-yellow-500" },
    tier3: { title: "תפקוד נמוך", description: "בתי ספר המציגים אתגרים מערכתיים ודורשים תמיכה אינטנסיבית.", style: "bg-red-50 border-red-500", titleStyle: "text-red-700", countStyle: "bg-red-600" }
};

const TierDisplay: React.FC<{ tier: 'tier1' | 'tier2' | 'tier3', schools: SchoolForAnalysis[] }> = ({ tier, schools }) => {
    const [isOpen, setIsOpen] = useState(false);
    const info = MTSS_TIERS_INFO[tier];

    return (
         <div className={`${info.style} p-4 rounded-lg border-r-4 shadow-sm`}>
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div>
                    <h3 className={`text-lg font-bold ${info.titleStyle}`}>{info.title}</h3>
                    <p className="text-sm text-gray-600">{info.description}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`${info.countStyle} text-white w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg`}>{schools.length}</span>
                    <span className={`text-xl text-gray-500 transform transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}>▼</span>
                </div>
            </div>
            {isOpen && (
                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {schools.length > 0 ? schools.map(school => (
                        <div key={school.id} className="bg-white p-3 rounded-md shadow border text-sm">
                            <p className="font-bold text-gray-800 truncate">{school.name}</p>
                            <p className="text-xs text-gray-500">מנהל/ת: {school.principal || '-'}</p>
                        </div>
                    )) : <p className="text-gray-500 col-span-full text-center py-4">אין בתי ספר ברמת תפקוד זו.</p>}
                </div>
            )}
        </div>
    );
};

const AggregateDashboard: React.FC<{ analysisData: AnalysisData; onExportHTML: () => void; }> = ({ analysisData, onExportHTML }) => {
    const { summary, performanceClassification } = analysisData;
    const aggregateDashboardRef = useRef<HTMLDivElement>(null);
    
    const mainDomainAverages = HIERARCHICAL_CATEGORIES.map(mainCat => {
        const allMetrics = mainCat.subCategories.flatMap(sc => sc.metrics);
        const allScores = analysisData.schools.flatMap(school => allMetrics.map(m => parseInt(school[m.key] as string, 10)).filter(s => !isNaN(s) && s > 0));
        const average = allScores.length > 0 ? allScores.reduce((a,b) => a + b, 0) / allScores.length : 0;
        return { name: mainCat.name, value: parseFloat(average.toFixed(2)) };
    });

    const systemicStrengths = useMemo(() => {
        const subCategoryAverages: { name: string; average: number }[] = [];
        HIERARCHICAL_CATEGORIES.forEach(category => {
            category.subCategories.forEach(subCat => {
                const subCatScores = analysisData.schools
                    .flatMap(school => subCat.metrics.map(m => parseInt(school[m.key] as string, 10)))
                    .filter(score => !isNaN(score) && score > 0);
                
                if (subCatScores.length > 0) {
                    const average = subCatScores.reduce((a, b) => a + b, 0) / subCatScores.length;
                    subCategoryAverages.push({ name: subCat.name, average });
                }
            });
        });

        return subCategoryAverages
            .sort((a, b) => b.average - a.average)
            .slice(0, 5);
    }, [analysisData.schools]);

    const getScoreColor = (score: number) => {
        if (score >= 3.2) return '#27ae60'; // green
        if (score >= 2.5) return '#f39c12'; // yellow
        if (score >= 1.8) return '#e67e22'; // orange
        return '#e74c3c'; // red
    };


    return (
        <div ref={aggregateDashboardRef} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">סיכום אזור פיקוח</h2>
                <ExportControls 
                    targetRef={aggregateDashboardRef} 
                    reportName="סיכום-אזור-פיקוח"
                    onExportHTML={onExportHTML} 
                />
            </div>
             <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-100 p-6 rounded-xl shadow-md text-center"><h3 className="text-blue-800 text-lg font-semibold">📚 סך בתי ספר</h3><div className="text-blue-900 text-4xl font-bold mt-2">{summary.totalSchools}</div></div>
                    <div className="bg-green-100 p-6 rounded-xl shadow-md text-center"><h3 className="text-green-800 text-lg font-semibold">👨‍🎓 סך תלמידים</h3><div className="text-green-900 text-4xl font-bold mt-2">{summary.totalStudents.toLocaleString()}</div></div>
                    <div className="bg-red-100 p-6 rounded-xl shadow-md text-center"><h3 className="text-red-800 text-lg font-semibold">📉 תפקוד נמוך</h3><div className="text-red-900 text-4xl font-bold mt-2">{summary.lowPerformanceSchools}</div></div>
                    <div className="bg-yellow-100 p-6 rounded-xl shadow-md text-center"><h3 className="text-yellow-800 text-lg font-semibold">⭐ תפקוד מצוין</h3><div className="text-yellow-900 text-4xl font-bold mt-2">{summary.excellentSchools}</div></div>
                </div>

                {systemicStrengths.length > 0 && (
                     <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2"><Award size={24} /> חוזקות מערכתיות</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {systemicStrengths.map((strength, index) => (
                                <div key={index} className="bg-white p-3 rounded-md border border-green-200">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-700 text-sm">{strength.name}</span>
                                        <span className="text-lg font-bold text-green-600">{strength.average.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🎯 סיווג תפקוד בתי הספר</h2>
                     <div className="space-y-6">
                        <TierDisplay tier="tier1" schools={performanceClassification.tier1} />
                        <TierDisplay tier="tier2" schools={performanceClassification.tier2} />
                        <TierDisplay tier="tier3" schools={performanceClassification.tier3} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                     <div className="bg-gray-50 p-6 rounded-lg shadow-md lg:col-span-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">🌡️ ממוצע ציונים בתחומי העל</h3>
                        <div className="space-y-5">
                            {mainDomainAverages.map(item => (
                                <div key={item.name}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-gray-700 text-base">{item.name}</span>
                                        <span className="font-bold text-lg" style={{ color: getScoreColor(item.value) }}>{item.value.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden border border-gray-300">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ 
                                                width: `${(item.value / 4) * 100}%`, 
                                                backgroundColor: getScoreColor(item.value) 
                                            }}
                                        ></div>
                                        {/* Scale markers */}
                                        <div className="absolute top-0 left-0 w-full h-full flex items-center">
                                           <span className="w-px h-3 bg-gray-400 absolute left-1/4 top-1/2 -translate-y-1/2"></span>
                                           <span className="w-px h-4 bg-gray-500 absolute left-1/2 top-1/2 -translate-y-1/2"></span>
                                           <span className="w-px h-3 bg-gray-400 absolute left-3/4 top-1/2 -translate-y-1/2"></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>
                
                 <div className="mt-8">
                     <InteractiveHeatMap schools={analysisData.schools} />
                </div>
            </div>
        </div>
    );
};


const DynamicDataAnalyzer: React.FC<Step2Props> = ({ schoolsData, onAnalysisComplete }) => {
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'schools' | 'aggregate'>('schools');
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);

    const schoolTableContainerRef = useRef<HTMLDivElement>(null);
    const schoolReportContainerRef = useRef<HTMLDivElement>(null);

    const performAnalysis = useCallback((data: School[]): AnalysisData => {
        const getTier = (school: School): 1 | 2 | 3 => {
            const allScores = ALL_SCORE_FIELDS
                .map(field => parseFloat(school[field] as string) || 0)
                .filter(score => score > 0);

            if (allScores.length < 5) {
                return 2;
            }

            const overallAverage = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
            const criticalScoresCount = allScores.filter(score => score <= 1.5).length;
            const excellentScoresCount = allScores.filter(score => score >= 3.5).length;

            if (overallAverage < 2.2) {
                return 3; 
            }
            if (overallAverage > 3.2 && criticalScoresCount < 2) {
                return 1;
            }
            return 2;
        };

        const schoolsForAnalysis: SchoolForAnalysis[] = data.map(school => ({
            ...school,
            characterization: 'N/A',
            specificChallenges: [],
            tier: getTier(school)
        }));
        
        const tier1 = schoolsForAnalysis.filter(s => s.tier === 1);
        const tier2 = schoolsForAnalysis.filter(s => s.tier === 2);
        const tier3 = schoolsForAnalysis.filter(s => s.tier === 3);

        const summary = {
            totalSchools: data.length,
            totalStudents: data.reduce((sum, s) => sum + (parseInt(s.students) || 0), 0),
            lowPerformanceSchools: tier3.length,
            excellentSchools: tier1.length,
        };

        return {
            schools: schoolsForAnalysis,
            summary,
            performanceClassification: { tier1, tier2, tier3 },
            subjectDistribution: {},
            challengesAnalysis: {}, 
            heatmapData: [],
            organizationalData: [],
            coreSubjectsData: [],
        };
    }, []);

    useEffect(() => {
        setLoading(true);
        const data = performAnalysis(schoolsData);
        setAnalysisData(data);
        if (schoolsData.length > 0) {
            setSelectedSchoolId(schoolsData[0].id);
        }
        setLoading(false);
    }, [schoolsData, performAnalysis]);

    const createReportCardData = useCallback((schoolId: number): SchoolReportCardType | null => {
        if (!analysisData) return null;
        
        const school = analysisData.schools.find(s => s.id === schoolId);
        if (!school) return null;

        const scores = ALL_SCORE_FIELDS.map(field => ({ field, score: parseInt(school[field] as string) || 0 })).filter(item => item.score > 0);
        const overallAverage = scores.length > 0 ? scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length : 0;
        
        const domainAverages: { [key: string]: number } = {};
        HIERARCHICAL_CATEGORIES.forEach(cat => {
            const catFields = cat.subCategories.flatMap(sc => sc.metrics.map(m => m.key));
            const catScores = scores.filter(s => catFields.includes(s.field as any)).map(s => s.score);
            if (catScores.length > 0) {
                domainAverages[cat.name] = catScores.reduce((a, b) => a + b, 0) / catScores.length;
            } else {
                domainAverages[cat.name] = 0;
            }
        });

        const allMetricsWithInfo: { key: string, subCategory: string; name: string; score: number }[] = [];
        HIERARCHICAL_CATEGORIES.forEach(category => {
            category.subCategories.forEach(subCat => {
                subCat.metrics.forEach(metric => {
                    const score = parseInt(school[metric.key] as string, 10);
                    if (!isNaN(score) && score > 0) {
                        allMetricsWithInfo.push({ key: metric.key, subCategory: subCat.name, name: metric.name, score });
                    }
                });
            });
        });
        
        const strengths: string[] = allMetricsWithInfo
            .filter(item => item.score >= 3.2)
            .sort((a, b) => b.score - a.score)
            .slice(0, 6)
            .map(item => `${item.subCategory}: ${item.name}`);

        const challenges: { subCategory: string; text: string }[] = [];
        HIERARCHICAL_CATEGORIES.forEach(category => {
            category.subCategories.forEach(subCat => {
                const subCatMetricsWithScores = subCat.metrics
                    .map(m => ({ metric: m, score: parseInt(school[m.key] as string, 10) }))
                    .filter(({ score }) => !isNaN(score) && score > 0);

                if (subCatMetricsWithScores.length === 0) return;

                const subCatAvg = subCatMetricsWithScores.reduce((acc, curr) => acc + curr.score, 0) / subCatMetricsWithScores.length;

                if (subCatAvg < 3.5) {
                    subCatMetricsWithScores.forEach(({ metric, score }) => {
                        if (score <= 3) {
                            const challengeText = METRIC_TO_CHALLENGE_MAP[metric.key];
                            // If a specific negative phrasing exists, use it. Otherwise, create a generic one.
                            // This ensures ALL low-scoring metrics are listed as challenges.
                            challenges.push({
                                subCategory: subCat.name,
                                text: challengeText || `תפקוד נמוך במדד: "${metric.name}"`
                            });
                        }
                    });
                }
            });
        });


        return {
            school: school,
            schoolName: school.name,
            principalName: school.principal,
            studentCount: parseInt(school.students) || 0,
            supportLevel: school.supportLevel || "לא צוין",
            overallAverage: overallAverage,
            performanceTier: school.tier,
            domainAverages,
            strengths,
            challenges,
            recommendations: [] // Placeholder
        };
    }, [analysisData]);

    const selectedSchoolReport = useMemo(() => {
        if (selectedSchoolId === null || !analysisData) return null;
        return createReportCardData(selectedSchoolId);
    }, [selectedSchoolId, analysisData, createReportCardData]);

    const schoolTableData = useMemo((): SchoolAssessmentData[] => {
        if (!analysisData) return [];
        return analysisData.schools.map(school => {
            const scores = ALL_SCORE_FIELDS.map(field => parseInt(school[field] as string) || 0).filter(s => s > 0);
            const overallAverage = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

            return {
                id: school.id,
                schoolName: school.name,
                principalName: school.principal,
                overallAverage: overallAverage,
                performanceTier: school.tier,
            };
        });
    }, [analysisData]);

    const getPerformanceLevelText = (tier: number) => {
        switch (tier) {
            case 1: return 'מצוין';
            case 2: return 'בינוני';
            case 3: return 'נמוך';
            default: return 'לא נקבע';
        }
    };
    
    const getTierInfoText = (tier: number) => {
        switch (tier) {
            case 1: return 'תפקוד מצוין';
            case 2: return 'תפקוד בינוני';
            case 3: return 'תפקוד נמוך';
            default: return 'לא נקבע';
        }
    };

    const handleExportSchoolTableCSV = useCallback(() => {
        if (!schoolTableData) return;

        const headers = ['שם בית הספר', 'מנהל/ת', 'ממוצע כללי', 'רמת תפקוד'];
        const csvRows = schoolTableData.map(school => {
            const row = [
                school.schoolName,
                school.principalName,
                school.overallAverage.toFixed(2),
                getPerformanceLevelText(school.performanceTier)
            ];
            return row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'רשימת-בתי-ספר.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [schoolTableData]);
    
    const handleExportSchoolReportCSV = useCallback(() => {
        if (!selectedSchoolReport) return;

        const { school, domainAverages, strengths, challenges } = selectedSchoolReport;
        
        let csvContent = `\uFEFF`; // BOM for Excel
        const rows: (string|number)[][] = [];

        // Section 1: General Info
        rows.push(['קטגוריה', 'פרט', 'ערך']);
        rows.push(['מידע כללי', 'שם בית הספר', school.name]);
        rows.push(['מידע כללי', 'מנהל/ת', school.principal]);
        rows.push(['מידע כללי', 'מספר תלמידים', school.students]);
        rows.push(['מידע כללי', 'רמת ליווי', school.supportLevel]);
        rows.push(['מידע כללי', 'רמת תפקוד', getTierInfoText(school.tier)]);
        rows.push([]); // Spacer

        // Section 2: Domain Averages
        rows.push(['ממוצעי תחומי על', 'תחום', 'ציון ממוצע']);
        Object.entries(domainAverages).forEach(([domain, avg]) => {
            rows.push(['ממוצעי תחומי על', domain, avg.toFixed(2)]);
        });
        rows.push([]); // Spacer

        // Section 3: Strengths
        rows.push(['נקודות חוזק', 'תת-תחום', 'חוזקה']);
        if (strengths.length > 0) {
            strengths.forEach(strength => {
                const parts = strength.split(':');
                const subCategory = parts[0];
                const statement = parts.slice(1).join(':').trim();
                rows.push(['נקודות חוזק', subCategory, statement]);
            });
        } else {
            rows.push(['נקודות חוזק', 'לא זוהו חוזקות מרכזיות', '']);
        }
        rows.push([]); // Spacer

        // Section 4: Challenges
        rows.push(['אתגרים שזוהו', 'תת-תחום', 'אתגר']);
        if (challenges.length > 0) {
            challenges.forEach(challenge => {
                rows.push(['אתגרים שזוהו', challenge.subCategory, challenge.text]);
            });
        } else {
            rows.push(['אתגרים שזוהו', 'לא זוהו אתגרים מרכזיים', '']);
        }
        rows.push([]); // Spacer
        
        // Section 5: All scores
        rows.push(['ציונים מפורטים', 'תחום ראשי', 'תת-תחום', 'מדד', 'ציון']);
        HIERARCHICAL_CATEGORIES.forEach(category => {
            category.subCategories.forEach(subCat => {
                subCat.metrics.forEach(metric => {
                    const score = school[metric.key] as string || 'לא הוזן';
                    rows.push(['ציונים מפורטים', category.name, subCat.name, metric.name, score]);
                });
            });
        });

        csvContent += rows.map(row => row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `דוח-${selectedSchoolReport.schoolName}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [selectedSchoolReport]);

    const handleExportHeatmapHTML = () => {
        if (!analysisData) return;

        const getColor = (score: number) => {
            if (score >= 3.5) return '#14532d'; // Excellent
            if (score >= 3.0) return '#16a34a'; // Good
            if (score >= 2.5) return '#facc15'; // Medium
            if (score >= 2.0) return '#fb923c'; // High Challenge
            return '#ef4444'; // Critical Challenge
        };

        const heatmapData = HIERARCHICAL_CATEGORIES.map(category => {
            const subCategoryData = category.subCategories.map(subCat => {
                const subCatScores = analysisData.schools
                    .flatMap(school => subCat.metrics.map(m => parseInt(school[m.key] as string, 10)))
                    .filter(score => !isNaN(score) && score > 0);
                const average = subCatScores.length > 0 ? subCatScores.reduce((a, b) => a + b, 0) / subCatScores.length : 0;
                return `
                    <div class="p-3 rounded-lg" style="background-color: ${getColor(average)}; color: white;">
                        <div class="font-bold">${subCat.name}</div>
                        <div class="text-2xl font-black">${average.toFixed(2)}</div>
                    </div>
                `;
            }).join('');

            return `
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-3">${category.name}</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        ${subCategoryData}
                    </div>
                </div>
            `;
        }).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="he" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>דוח מפת חום</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style> body { font-family: 'Heebo', sans-serif; } </style>
            </head>
            <body class="bg-gray-100 p-8">
                <div class="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                    <h1 class="text-4xl font-bold text-center text-gray-800 mb-2">מפת חום רשותית</h1>
                    <p class="text-center text-gray-500 mb-8">ניתוח ממוצע ציונים בכל תחומי ההערכה</p>
                    ${heatmapData}
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'דוח_מפת_חום.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!analysisData) {
        return <div className="text-center p-8 text-red-500">לא הצלחנו לנתח את הנתונים.</div>;
    }
    
    return (
        <div className="space-y-6">
            <div className="flex justify-center border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
                <button 
                    onClick={() => setView('schools')} 
                    className={`px-6 py-3 font-semibold transition-colors focus:outline-none ${view === 'schools' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                >
                    ניתוח ברמת בית ספר
                </button>
                <button 
                    onClick={() => setView('aggregate')} 
                    className={`px-6 py-3 font-semibold transition-colors focus:outline-none ${view === 'aggregate' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                >
                    ניתוח אזור פיקוח
                </button>
            </div>

            {view === 'aggregate' && (
                 <AggregateDashboard 
                    analysisData={analysisData} 
                    onExportHTML={handleExportHeatmapHTML} 
                />
            )}

            {view === 'schools' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div ref={schoolTableContainerRef} className="bg-white p-6 rounded-lg shadow-md xl:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">רשימת בתי ספר</h2>
                             <ExportControls 
                                 targetRef={schoolTableContainerRef} 
                                 reportName="רשימת-בתי-ספר"
                                 onExportCSV={handleExportSchoolTableCSV} 
                             />
                        </div>
                        <SchoolDataTable 
                            schools={schoolTableData}
                            onSchoolSelect={(id) => setSelectedSchoolId(id)}
                            selectedSchoolId={selectedSchoolId}
                        />
                    </div>
                    <div ref={schoolReportContainerRef} className="bg-white p-6 rounded-lg shadow-md xl:col-span-2">
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">דוח בית ספרי</h2>
                             {selectedSchoolReport && <ExportControls 
                                targetRef={schoolReportContainerRef} 
                                reportName={`דוח-${selectedSchoolReport.schoolName}`} 
                                onExportCSV={handleExportSchoolReportCSV}
                             />}
                         </div>
                        {selectedSchoolReport ? (
                            <DetailedSchoolReport report={selectedSchoolReport} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-gray-500 rounded-lg bg-gray-50 min-h-[400px]">
                                <p>בחר/י בית ספר מהרשימה כדי להציג את הדוח המפורט.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-8 text-center">
                <button onClick={() => {
                    // Fix: Added a null check for analysisData before calling onAnalysisComplete, as a defensive measure against potential errors.
                    if (analysisData) {
                        onAnalysisComplete(analysisData);
                    }
                }} className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white text-lg font-bold rounded-lg shadow-xl hover:from-green-600 hover:to-teal-700 transition transform hover:scale-105">
                   המשך לבחירת אתגרים מרכזיים ←
                </button>
            </div>
        </div>
    );
};

export default DynamicDataAnalyzer;