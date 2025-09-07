import React, { useState, useEffect } from 'react';
import type { AnalysisData, FinalIssue, Issue } from '../types';

interface Step3Props {
    analysisData: AnalysisData;
    selectedIssues: Issue[];
    onIssueDefined: (issue: FinalIssue) => void;
    onBack: () => void;
}

const Step3_IssueDefiner: React.FC<Step3Props> = ({ analysisData, selectedIssues, onIssueDefined, onBack }) => {
    const [mainIssueId, setMainIssueId] = useState<string | null>(null);
    const [rootCauses, setRootCauses] = useState('');

    useEffect(() => {
        if (selectedIssues.length > 0) {
            setMainIssueId(selectedIssues[0].id);
        }
    }, [selectedIssues]);

    const handleDefineIssue = () => {
        if (!mainIssueId) {
            alert("יש לבחור סוגייה מרכזית.");
            return;
        }

        const selectedIssue = selectedIssues.find(i => i.id === mainIssueId);
        if (!selectedIssue) return;

        const finalIssue: FinalIssue = {
            mainIssue: selectedIssue.name,
            rootCauses: rootCauses.split('\n').filter(rc => rc.trim() !== ''),
            affectedSchools: analysisData.schools
                .filter(school => {
                    const challenges = school.specificChallenges || [];
                    return challenges.includes(selectedIssue.id);
                })
                .map(s => s.id),
        };
        onIssueDefined(finalIssue);
    };
    
    const selectedIssueDetails = selectedIssues.find(i => i.id === mainIssueId);

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    8
                  </div>
                  <h2 className="text-2xl font-bold">הגדרת סוגייה מרכזית</h2>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-700">1. בחירת סוגייה מרכזית להתערבות</h3>
                    <p className="text-gray-500 mb-4">בחר/י את הסוגייה המרכזית מבין האתגרים שזוהו בשלב הקודם.</p>
                    <div className="space-y-3">
                        {selectedIssues.map(issue => (
                            <label key={issue.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${mainIssueId === issue.id ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    name="main-issue"
                                    value={issue.id}
                                    checked={mainIssueId === issue.id}
                                    onChange={() => setMainIssueId(issue.id)}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="mr-3 font-bold text-lg text-gray-800">{issue.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {selectedIssueDetails && (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-semibold mb-3 text-gray-700">2. ניתוח גורמי שורש</h3>
                         <p className="text-gray-500 mb-4">
                            בהתבסס על הסוגייה שנבחרה - <span className="font-bold">{selectedIssueDetails.name}</span> - נסח/י את גורמי השורש המרכזיים שהובילו להיווצרותה.
                        </p>
                        <textarea
                            value={rootCauses}
                            onChange={(e) => setRootCauses(e.target.value)}
                            rows={6}
                            placeholder="רשום כל גורם שורש בשורה חדשה..."
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            לדוגמה: חוסר הכשרה מקצועית למורים, תחלופה גבוהה של צוות, היעדר תכנית עבודה מסודרת.
                        </p>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mt-10">
                <button
                    onClick={onBack}
                    className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300 transition-colors flex items-center"
                >
                    חזרה להגדרת מדדים
                </button>
                <button
                    disabled={!mainIssueId || rootCauses.trim() === ''}
                    onClick={handleDefineIssue}
                    className="py-2 px-6 rounded-md flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    המשך לתכנון התערבות
                </button>
            </div>
        </div>
    );
};

export default Step3_IssueDefiner;
