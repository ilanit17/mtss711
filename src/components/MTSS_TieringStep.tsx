import React, { useMemo, useState } from 'react';
import { AnalysisData, Issue, SchoolForAnalysis } from '../types';
import { ArrowLeft, ArrowRight, Layers3, Target, ShieldAlert, ChevronDown } from 'lucide-react';

interface TierCardProps {
    tier: number;
    title: string;
    schools: SchoolForAnalysis[];
    totalSchools: number;
    characteristics: string;
    interventionLevel: string;
    icon: React.ReactNode;
    colorClasses: string;
}

const TierCard: React.FC<TierCardProps> = ({ title, schools, totalSchools, characteristics, interventionLevel, icon, colorClasses }) => {
    const [isOpen, setIsOpen] = useState(false);
    const percentage = totalSchools > 0 ? ((schools.length / totalSchools) * 100).toFixed(1) : 0;

    return (
        <div className={`rounded-xl border-t-4 shadow-lg ${colorClasses}`}>
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {icon}
                        <div>
                            <h3 className="text-2xl font-bold">{title}</h3>
                            <p className="text-gray-500 font-semibold">{schools.length} בתי ספר ({percentage}%)</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 space-y-3 text-gray-700">
                    <div>
                        <h4 className="font-semibold">מאפיינים עיקריים:</h4>
                        <p className="text-sm">{characteristics}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">רמת הצורך בהתערבות:</h4>
                        <p className="text-sm font-bold">{interventionLevel}</p>
                    </div>
                </div>
            </div>
            {schools.length > 0 && (
                <div className="border-t border-gray-200 px-6 py-3">
                    <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between text-sm font-semibold text-blue-600 hover:text-blue-800">
                        <span>{isOpen ? 'הסתר רשימת בתי ספר' : 'הצג רשימת בתי ספר'}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {schools.map(school => (
                                <div key={school.id} className="bg-gray-100 p-2 rounded-md text-center text-xs">
                                    <p className="font-semibold truncate">{school.name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


interface MTSS_TieringStepProps {
    analysisData: AnalysisData;
    selectedIssues: Issue[];
    onComplete: () => void;
    onBack: () => void;
}

const MTSS_TieringStep: React.FC<MTSS_TieringStepProps> = ({ analysisData, selectedIssues, onComplete, onBack }) => {
    const { schools } = analysisData;

    const tiers = useMemo(() => {
        const affectedSchoolIds = new Set<number>();
        selectedIssues.forEach(issue => {
            issue.schoolDetails.forEach(detail => {
                affectedSchoolIds.add(detail.schoolId);
            });
        });

        const tier3 = schools.filter(s => s.tier === 3 && affectedSchoolIds.has(s.id));
        const tier2 = schools.filter(s => s.tier === 2 && affectedSchoolIds.has(s.id));
        const tier1 = schools; // Universal tier includes all schools

        return { tier1, tier2, tier3 };
    }, [schools, selectedIssues]);

    const totalSchools = schools.length;
    const selectedIssueNames = selectedIssues.map(issue => `'${issue.name}'`).join(', ');

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <header className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                    סיווג בתי ספר לפי מודל MTSS
                </h1>
                <p className="text-gray-500 mt-2 text-lg max-w-3xl mx-auto">
                    בהתבסס על ניתוח הנתונים והסוגיות המרכזיות שנבחרו, בתי הספר מסווגים לשכבות התערבות שונות.
                </p>
            </header>

            {selectedIssueNames && (
                <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                    <h2 className="text-lg font-bold text-blue-800">התמקדות בסוגיות שנבחרו:</h2>
                    <p className="text-blue-700 font-medium">{selectedIssueNames}</p>
                </div>
            )}

            <div className="space-y-8">
                <TierCard
                    tier={3}
                    title="שכבה 3: התערבות אינטנסיבית"
                    schools={tiers.tier3}
                    totalSchools={totalSchools}
                    characteristics={`בתי ספר המציגים תפקוד נמוך ומתמודדים באופן מובהק עם האתגרים בתחומים: ${selectedIssueNames}.`}
                    interventionLevel="התערבות דחופה ואינטנסיבית"
                    icon={<ShieldAlert className="w-12 h-12 text-red-500" />}
                    colorClasses="border-red-500 bg-red-50"
                />

                <TierCard
                    tier={2}
                    title="שכבה 2: תמיכה ממוקדת"
                    schools={tiers.tier2}
                    totalSchools={totalSchools}
                    characteristics={`בתי ספר המציגים תפקוד בינוני וזקוקים לחיזוק ותמיכה ממוקדת בתחומים הקשורים לסוגיות: ${selectedIssueNames}.`}
                    interventionLevel="חיזוק ותמיכה ממוקדת"
                    icon={<Target className="w-12 h-12 text-yellow-500" />}
                    colorClasses="border-yellow-500 bg-yellow-50"
                />
                
                <TierCard
                    tier={1}
                    title="שכבה 1: אוניברסלית"
                    schools={tiers.tier1}
                    totalSchools={totalSchools}
                    characteristics="כלל בתי הספר במערכת. שכבה זו מהווה בסיס למניעה, שימור חוזקות והטמעת פרקטיקות מיטביות עבור כולם."
                    interventionLevel="למידה, מניעה ושימור"
                    icon={<Layers3 className="w-12 h-12 text-blue-500" />}
                    colorClasses="border-blue-500 bg-blue-50"
                />
            </div>

            <div className="flex justify-between items-center mt-12 border-t pt-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors"
                >
                    <ArrowRight size={18} />
                    חזרה לבחירת סוגיות
                </button>
                <button
                    onClick={onComplete}
                    className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105"
                >
                    המשך להגדרת מטרות ויעדים
                    <ArrowLeft size={20} />
                </button>
            </div>
        </div>
    );
};

export default MTSS_TieringStep;