import React, { useState, useMemo } from 'react';
import { AnalysisData, SchoolForAnalysis } from '../types';
import { FOCUS_AREA_DEFINITIONS, BOOKLET_TO_PLAN_ISSUES_MAP, BOOKLET_ISSUE_TO_METRICS_MAP } from '../constants';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface FocusAreaSelectionStepProps {
  analysisData: AnalysisData;
  onComplete: (selectedAreas: string[]) => void;
  onBack: () => void;
}

const FocusAreaSelectionStep: React.FC<FocusAreaSelectionStepProps> = ({ analysisData, onComplete, onBack }) => {
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

    const focusAreaScores = useMemo(() => {
        const scores: { [key: string]: { average: number; count: number } } = {};
        
        Object.keys(FOCUS_AREA_DEFINITIONS).forEach(areaKey => {
            const issueKeys = BOOKLET_TO_PLAN_ISSUES_MAP[areaKey] || [];
            const metricsForArea = [...new Set(issueKeys.flatMap(issueKey => BOOKLET_ISSUE_TO_METRICS_MAP[issueKey] || []))];

            if (metricsForArea.length === 0) {
                scores[areaKey] = { average: 0, count: 0 };
                return;
            }

            let totalScore = 0;
            let scoreCount = 0;
            analysisData.schools.forEach(school => {
                metricsForArea.forEach(metric => {
                    const score = parseInt(school[metric as keyof SchoolForAnalysis] as string, 10);
                    if (!isNaN(score) && score > 0) {
                        totalScore += score;
                        scoreCount++;
                    }
                });
            });

            scores[areaKey] = {
                average: scoreCount > 0 ? totalScore / scoreCount : 0,
                count: metricsForArea.length
            };
        });
        return scores;
    }, [analysisData]);

    const handleToggleArea = (areaKey: string) => {
        setSelectedAreas(prev => 
            prev.includes(areaKey) 
                ? prev.filter(key => key !== areaKey) 
                : [...prev, areaKey]
        );
    };

    const getScoreColor = (score: number) => {
        if (score >= 3.2) return 'text-green-600';
        if (score >= 2.5) return 'text-yellow-500';
        if (score >= 1.8) return 'text-orange-500';
        return 'text-red-600';
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <header className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">שלב 2: בחירת תחומי התמקדות מערכתיים</h1>
                <p className="text-gray-500 mt-2 text-lg max-w-3xl mx-auto">
                    בהתבסס על הנתונים שהועלו, חושב ציון ממוצע לכל תחום מערכתי. בחר/י את התחומים שבהם תרצה/י להתמקד.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(FOCUS_AREA_DEFINITIONS).map(([key, def]) => {
                    const isSelected = selectedAreas.includes(key);
                    const scoreInfo = focusAreaScores[key];
                    return (
                        <div
                            key={key}
                            onClick={() => handleToggleArea(key)}
                            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 relative ${
                                isSelected ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                            }`}
                        >
                            {isSelected && <CheckCircle className="w-6 h-6 text-blue-500 absolute top-4 left-4" />}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-gray-100 p-3 rounded-lg text-gray-600">{def.icon}</div>
                                <h3 className="text-xl font-bold text-gray-800">{def.name}</h3>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500">ציון ממוצע</p>
                                <p className={`text-5xl font-extrabold ${getScoreColor(scoreInfo.average)}`}>
                                    {scoreInfo.average.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">מבוסס על {scoreInfo.count} מדדים</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center mt-12 border-t pt-6">
                <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors">
                    <ArrowRight size={18} />
                    חזרה לניתוח נתונים
                </button>
                <button
                    onClick={() => onComplete(selectedAreas)}
                    disabled={selectedAreas.length === 0}
                    className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                    המשך לבחירת סוגיות
                    <ArrowLeft size={20} />
                </button>
            </div>
        </div>
    );
};

export default FocusAreaSelectionStep;
