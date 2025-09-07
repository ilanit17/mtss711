import React, { useState, useCallback, useMemo } from 'react';
import { parseFile } from '../services/fileParserService';
import { School, AnalysisData, Issue, AllInterventionPlans, TieredSchools, SchoolForAnalysis } from '../types';
import DynamicDataAnalyzer from './DynamicDataAnalyzer';
import Step1_DataMapping from './Step1_DataMapping';
import IssueSelectionStep from './IssueSelectionStep';
import { InterventionPlanBuilder } from './InterventionPlanBuilder';
import MTSS_TieringStep from './MTSS_TieringStep';
import Step6_SupervisorGoals from './Step6_SupervisorGoals';
import FocusAreaSelectionStep from './FocusAreaSelectionStep';
import PrintableBooklet from './PrintableBooklet';
import { BookOpen } from 'lucide-react';


const FileUploadAnalyzer: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<'upload' | 'data-mapping' | 'analysis' | 'focus-area-selection' | 'issue-selection' | 'mtss-tiering' | 'supervisor-goals' | 'plan'>('upload');
    const [schoolsData, setSchoolsData] = useState<School[]>([]);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
    const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);
    const [interventionPlans, setInterventionPlans] = useState<AllInterventionPlans>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewingBooklet, setViewingBooklet] = useState(false);

    const handleFileUpload = useCallback(async (file: File) => {
        try {
            setLoading(true);
            setError(null);
            const parsedData = await parseFile(file);
            const schoolsWithIds = parsedData.schools.map((school, index) => ({
                ...school,
                id: school.id || index + 1
            }));
            setSchoolsData(schoolsWithIds);
            setCurrentStep('data-mapping');
        } catch (error) {
            setError(`שגיאה בעיבוד הקובץ: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDataMappingComplete = useCallback(() => {
        if (schoolsData.length === 0) {
            setError("יש להזין נתונים עבור בית ספר אחד לפחות.");
            return;
        }
        setCurrentStep('analysis');
    }, [schoolsData]);

    const handleAnalysisComplete = useCallback((data: AnalysisData) => {
        setAnalysisData(data);
        setCurrentStep('focus-area-selection');
    }, []);

    const handleFocusAreasSelected = useCallback((areas: string[]) => {
        setSelectedFocusAreas(areas);
        setCurrentStep('issue-selection');
    }, []);

    const handleIssuesSelected = useCallback((issues: Issue[]) => {
        setSelectedIssues(issues);
        setCurrentStep('mtss-tiering');
    }, []);
    
    const handleTieringComplete = useCallback(() => {
        setCurrentStep('supervisor-goals');
    }, []);

    const handleSupervisorGoalsReviewed = useCallback(() => {
        setCurrentStep('plan');
    }, []);

    const handlePlanComplete = useCallback((plans: AllInterventionPlans) => {
        setInterventionPlans(plans);
        alert("תכנית התערבות נוצרה בהצלחה!");
    }, []);

    const handleReset = useCallback(() => {
        setCurrentStep('upload');
        setSchoolsData([]);
        setAnalysisData(null);
        setSelectedFocusAreas([]);
        setSelectedIssues([]);
        setInterventionPlans({});
        setError(null);
    }, []);

     const tieredSchoolsForPlan = useMemo((): TieredSchools => {
        if (!analysisData) {
            return { tier1: [], tier2: [], tier3: [] };
        }
        const affectedSchoolIds = new Set<number>();
        selectedIssues.forEach(issue => {
            issue.schoolDetails.forEach(detail => {
                affectedSchoolIds.add(detail.schoolId);
            });
        });

        const tier3 = analysisData.schools.filter(s => s.tier === 3 && affectedSchoolIds.has(s.id));
        const tier2 = analysisData.schools.filter(s => s.tier === 2 && affectedSchoolIds.has(s.id));
        const tier1 = analysisData.schools; // Universal tier includes all schools

        return { tier1, tier2, tier3 };
    }, [analysisData, selectedIssues]);

    const FileUploadStep = () => (
        <div className="max-w-4xl mx-auto p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    🚀 מתכנן התערבויות MTSS
                </h1>
                <p className="text-xl text-gray-600">
                    העלה קובץ נתונים, אמת את המידע והתחל בניתוח אוטומטי
                </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        העלאת קובץ נתונים
                    </h2>
                    <p className="text-gray-600">
                        העלה קובץ Excel או CSV עם נתוני בתי הספר
                    </p>
                </div>
                {error && (
                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
                         <p className="text-sm text-red-800">{error}</p>
                     </div>
                )}
                {loading ? (
                     <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-white bg-blue-600 rounded-md shadow-sm">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            מעבד קובץ...
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">לחץ להעלאה</span> או גרור לכאן</p>
                                <p className="text-xs text-gray-500">נתמכים: Excel (.xlsx/.xls), CSV</p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file);
                                }}
                            />
                        </label>
                    </div>
                )}
                 <div className="mt-8 text-center flex justify-center items-center gap-6">
                    <button onClick={() => setCurrentStep('data-mapping')} className="text-blue-600 hover:underline font-medium">
                        המשך להזנה ידנית
                    </button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => setViewingBooklet(true)} className="flex items-center gap-2 text-green-700 hover:underline font-medium">
                        <BookOpen size={18} />
                        הצג/הדפס את חוברת המפקח
                    </button>
                </div>
            </div>
        </div>
    );

    if (viewingBooklet) {
        return <PrintableBooklet onBack={() => setViewingBooklet(false)} />;
    }

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'upload':
                return <FileUploadStep />;
            case 'data-mapping':
                return <Step1_DataMapping schools={schoolsData} setSchools={setSchoolsData} onComplete={handleDataMappingComplete} onReset={handleReset} />;
            case 'analysis':
                return (
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        <DynamicDataAnalyzer schoolsData={schoolsData} onAnalysisComplete={handleAnalysisComplete} />
                    </div>
                );
            case 'focus-area-selection':
                return (
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        {analysisData && (
                            <FocusAreaSelectionStep
                                analysisData={analysisData}
                                onComplete={handleFocusAreasSelected}
                                onBack={() => setCurrentStep('analysis')}
                            />
                        )}
                    </div>
                );
            case 'issue-selection':
                 return (
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        {analysisData && (
                            <IssueSelectionStep
                                schools={analysisData.schools}
                                selectedFocusAreas={selectedFocusAreas}
                                onComplete={handleIssuesSelected}
                                onBack={() => setCurrentStep('focus-area-selection')}
                            />
                        )}
                    </div>
                );
            case 'mtss-tiering':
                 return (
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        {analysisData && (
                            <MTSS_TieringStep
                                analysisData={analysisData}
                                selectedIssues={selectedIssues}
                                onComplete={handleTieringComplete}
                                onBack={() => setCurrentStep('issue-selection')}
                            />
                        )}
                    </div>
                );
            case 'supervisor-goals':
                return (
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        <Step6_SupervisorGoals
                            selectedIssues={selectedIssues}
                            onComplete={handleSupervisorGoalsReviewed}
                            onBack={() => setCurrentStep('mtss-tiering')}
                        />
                    </div>
                );
            case 'plan':
                return (
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                         {selectedIssues.length > 0 && (
                            <InterventionPlanBuilder
                                selectedIssues={selectedIssues}
                                tieredSchools={tieredSchoolsForPlan}
                                onPlanComplete={handlePlanComplete}
                                onReset={handleReset}
                                onBack={() => setCurrentStep('supervisor-goals')}
                            />
                        )}
                    </div>
                );
            default:
                return <FileUploadStep />;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {renderCurrentStep()}
        </div>
    );
};

export default FileUploadAnalyzer;