import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText, Users, Target, CheckCircle, ArrowRight, ArrowLeft, ChevronDown, AlertCircle, Briefcase, BookOpen, HeartHandshake, Puzzle } from 'lucide-react';
import { SchoolForAnalysis, Issue, School, SchoolIssueDetail, FullSystemicIssue } from '../types';
import { ALL_SCORE_FIELDS, FIELD_HEBREW_MAP, METRIC_TO_CHALLENGE_MAP, BOOKLET_ISSUE_TO_METRICS_MAP, BOOKLET_TO_PLAN_ISSUES_MAP } from '../constants';
import { issuesAndGoalsData } from '../data/issuesAndGoalsData';

interface IssueSelectionStepProps {
  schools: SchoolForAnalysis[];
  selectedFocusAreas: string[];
  onComplete: (selectedIssues: Issue[]) => void;
  onBack: () => void;
}


const PerformanceTierIndicator: React.FC<{ tier: 1 | 2 | 3 }> = ({ tier }) => {
  const tierInfo = {
    1: { color: 'bg-green-500', label: 'תפקוד מצוין' },
    2: { color: 'bg-yellow-500', label: 'תפקוד בינוני' },
    3: { color: 'bg-red-500', label: 'תפקוד נמוך' },
  }[tier];
  return (
    <div className="flex items-center group relative" aria-label={tierInfo.label}>
      <div className={`w-3 h-3 rounded-full ${tierInfo.color}`}></div>
      <span className="absolute right-full mr-2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
        {tierInfo.label}
      </span>
    </div>
  );
};

const SchoolDetailsView: React.FC<{ details: SchoolIssueDetail[] }> = ({ details }) => {
    const [sortBy, setSortBy] = useState<'severity' | 'affectedCount'>('severity');
    
    const severityOrder = { critical: 3, high: 2, medium: 1 };
    const getSeverityClass = (severity: 'critical' | 'high' | 'medium') => ({
        critical: 'bg-red-100 border-red-200',
        high: 'bg-orange-100 border-orange-200',
        medium: 'bg-yellow-100 border-yellow-200',
    }[severity]);

    const sortedDetails = useMemo(() => {
        return [...details].sort((a, b) => {
            if (sortBy === 'severity') {
                return severityOrder[b.severity] - severityOrder[a.severity];
            }
            return b.affectedMetrics.length - a.affectedMetrics.length;
        });
    }, [details, sortBy]);

    return (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-b-lg">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-700">פירוט אתגרי בתי הספר בנושא התחום</h4>
                <div className="flex items-center text-xs">
                    <span className="ml-2 font-medium">מיין לפי:</span>
                    <button onClick={() => setSortBy('severity')} className={`px-2 py-1 rounded-md ${sortBy === 'severity' ? 'bg-blue-100 text-blue-800' : ''}`}>חומרה</button>
                    <button onClick={() => setSortBy('affectedCount')} className={`px-2 py-1 rounded-md ${sortBy === 'affectedCount' ? 'bg-blue-100 text-blue-800' : ''}`}>מס' אתגרים</button>
                </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {sortedDetails.map(school => (
                    <div key={school.schoolId} className={`p-3 rounded-md border ${getSeverityClass(school.severity)}`}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <PerformanceTierIndicator tier={school.performanceTier} />
                                <span className="font-bold text-gray-800">{school.schoolName}</span>
                            </div>
                            <span className="text-xs font-semibold">{school.affectedMetrics.length} אתגרים</span>
                        </div>
                        <ul className="mt-2 list-disc list-inside text-xs text-gray-600 space-y-1">
                            {school.affectedMetrics.map((metric, i) => <li key={i}>{metric}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};


const IssueSelectionStep: React.FC<IssueSelectionStepProps> = ({ schools, selectedFocusAreas, onComplete, onBack }) => {
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);

  const analyzeSchoolData = useCallback(() => {
    // Always include differentiated instruction regardless of focus areas or school data
    const relevantIssueIds = new Set(['differentiated_instruction']);
    
    // Add issues from selected focus areas
    if (selectedFocusAreas.length > 0) {
      selectedFocusAreas.forEach(area => {
        const issuesForArea = BOOKLET_TO_PLAN_ISSUES_MAP[area] || [];
        issuesForArea.forEach(issueId => relevantIssueIds.add(issueId));
      });
    }
    
    let relevantIssuesData = issuesAndGoalsData.filter(issue => relevantIssueIds.has(issue.id));
    
    // If differentiated_instruction is not found in issuesAndGoalsData, add it manually
    if (!relevantIssuesData.find(issue => issue.id === 'differentiated_instruction')) {
      relevantIssuesData.push({
        id: 'differentiated_instruction',
        title: 'הוראה דיפרנציאלית',
        category: 'pedagogical',
        principalGoal: 'פיתוח תרבות הוראה המכירה בשונות התלמידים ומתאימה את ההוראה לצרכי הלמידה השונים של כל תלמיד ותלמידה.',
        supervisorStance: 'מוביל/ת הוראה דיפרנציאלית: מנחה תהליכי הוראה דיפרנציאלית ופיתוח הוראה מותאמת.',
        provenPractices: [
          'מיפוי צרכי למידה: ביצוע אבחון שיטתי של סגנונות למידה ורמות ידע.',
          'תכנון הוראה מגוון: עיצוב שיעורים המכילים מגוון דרכי הוראה ופעילויות.',
          'הערכה דיפרנציאלית: שימוש בכלי הערכה מגוונים.',
          'תמיכה אישית: מתן מענה אישי לתלמידים.'
        ],
        supervisorSupport: {
          roles: [
            'הנחיית תהליכי מיפוי צרכים',
            'הדגמת מודלים של הוראה דיפרנציאלית',
            'פיתוח כלי הערכה מגוונים'
          ],
          activities: [
            'ליווי בתכנון שיעורים דיפרנציאליים',
            'הכשרת מורים להוראה דיפרנציאלית',
            'מעקב אחר יישום'
          ]
        },
        mtss: {
          tier1: { title: 'אוניברסלי', description: 'הפצת כלים להוראה דיפרנציאלית' },
          tier2: { title: 'ממוקד', description: 'ליווי קבוצת מורים בהוראה דיפרנציאלית' },
          tier3: { title: 'אינטנסיבי', description: 'ליווי אישי בהוראה דיפרנציאלית מורכבת' }
        }
      } as any);
    }

    const calculateAverageForCategory = (categoryKey: string, schoolSet: SchoolForAnalysis[]): number => {
        const metricsForCategory = BOOKLET_ISSUE_TO_METRICS_MAP[categoryKey] || [];
        if (metricsForCategory.length === 0 || schoolSet.length === 0) return 0;

        let totalScore = 0;
        let scoreCount = 0;

        schoolSet.forEach(school => {
            metricsForCategory.forEach(metric => {
                const score = parseInt(school[metric] as string, 10);
                if (!isNaN(score) && score > 0) {
                    totalScore += score;
                    scoreCount++;
                }
            });
        });
        return scoreCount > 0 ? totalScore / scoreCount : 0;
    };


    const buildSchoolDetails = (categoryKey: string): SchoolIssueDetail[] => {
        const metricsForCategory = BOOKLET_ISSUE_TO_METRICS_MAP[categoryKey] || [];
        if (metricsForCategory.length === 0 || !schools || schools.length === 0) return [];

        return schools.map(school => {
            const affectedMetricsForSchool = metricsForCategory.filter(metric => {
                const score = parseInt(school[metric] as string, 10);
                return !isNaN(score) && score <= 2;
            });

            if (affectedMetricsForSchool.length === 0) return null;

            const percentage = (affectedMetricsForSchool.length / metricsForCategory.length) * 100;
            let severity: 'critical' | 'high' | 'medium';
            if (percentage >= 70) severity = 'critical';
            else if (percentage >= 40) severity = 'high';
            else severity = 'medium';

            return {
                schoolId: school.id, schoolName: school.name, performanceTier: school.tier, severity,
                affectedMetrics: affectedMetricsForSchool.map(key => METRIC_TO_CHALLENGE_MAP[key as string] || `תפקוד נמוך במדד: "${FIELD_HEBREW_MAP[key as string]?.split(' - ')[1] || String(key)}"`)
            };
        }).filter((detail): detail is SchoolIssueDetail => detail !== null);
    };
    
    const identifiedIssues: Issue[] = relevantIssuesData
      .map((issueData: FullSystemicIssue) => {
        // Special handling for differentiated instruction - calculate real data
        if (issueData.id === 'differentiated_instruction') {
          // Manual mapping since BOOKLET_ISSUE_TO_METRICS_MAP doesn't seem to load correctly
          const metricsForCategory = [
            'pedagogyPractices_differentiatedTeachingScore',
            'language_differentiatedResponseScore', 
            'math_sufficientDifferentiationScore',
            'english_groupSizeAllowsGrowthScore',
            'pedagogyPractices_diverseLearningMethodsScore',
            'pedagogyPractices_lessonsIncludeVarietyScore'
          ];
          console.log('DEBUG: Using manual metrics for differentiated_instruction:', metricsForCategory);
          let totalLowScores = 0;
          let totalScoresCount = 0;
          const affectedSchoolIds = new Set<number>();

          if (schools && schools.length > 0) {
            schools.forEach(school => {
              let hasLowScoreInIssue = false;
              metricsForCategory.forEach(metric => {
                const score = parseInt(school[metric] as string, 10);
                if (!isNaN(score) && score > 0) {
                  totalScoresCount++;
                  if (score <= 2) {
                    totalLowScores++;
                    hasLowScoreInIssue = true;
                  }
                }
              });
              if (hasLowScoreInIssue) {
                affectedSchoolIds.add(school.id);
              }
            });
          }

          const affectedSchoolsCount = affectedSchoolIds.size;
          const scopeScore = (schools && schools.length > 0) ? (affectedSchoolsCount / schools.length) : 0;
          const severityScore = totalScoresCount > 0 ? (totalLowScores / totalScoresCount) : 0;
          const finalScore = (scopeScore * 0.6) + (severityScore * 0.4);
          
          console.log('DEBUG: differentiated_instruction calculations:');
          console.log('  - affectedSchoolsCount:', affectedSchoolsCount);
          console.log('  - totalScoresCount:', totalScoresCount);
          console.log('  - totalLowScores:', totalLowScores);
          console.log('  - scopeScore:', scopeScore);
          console.log('  - severityScore:', severityScore);
          console.log('  - finalScore:', finalScore);

          let severity: 'critical' | 'high' | 'medium' | 'low';
          if (finalScore > 0.4) severity = 'critical';
          else if (finalScore > 0.25) severity = 'high';
          else if (finalScore > 0.1) severity = 'medium';
          else severity = 'medium'; // Default to medium for differentiated instruction

          const tier1Schools = schools ? schools.filter(s => s.tier === 1) : [];
          const tier2Schools = schools ? schools.filter(s => s.tier === 2) : [];
          const tier3Schools = schools ? schools.filter(s => s.tier === 3) : [];

          // Calculate averages manually since calculateAverageForCategory doesn't work for differentiated_instruction
          const calculateManualAverage = (schoolList: SchoolForAnalysis[]) => {
            if (!schoolList || schoolList.length === 0) return 0;
            let totalScore = 0;
            let scoreCount = 0;
            schoolList.forEach(school => {
              metricsForCategory.forEach(metric => {
                const score = parseInt(school[metric] as string, 10);
                if (!isNaN(score) && score > 0) {
                  totalScore += score;
                  scoreCount++;
                }
              });
            });
            return scoreCount > 0 ? totalScore / scoreCount : 0;
          };

          const overallAvg = calculateManualAverage(schools || []);
          const tier1Avg = calculateManualAverage(tier1Schools);
          const tier2Avg = calculateManualAverage(tier2Schools);
          const tier3Avg = calculateManualAverage(tier3Schools);
          
          console.log('DEBUG: differentiated_instruction averages:');
          console.log('  - overallAverage:', overallAvg);
          console.log('  - tier1Average:', tier1Avg);
          console.log('  - tier2Average:', tier2Avg);
          console.log('  - tier3Average:', tier3Avg);

          return {
            id: issueData.id,
            name: issueData.title,
            description: issueData.principalGoal,
            affectedSchools: affectedSchoolsCount,
            totalSchools: schools ? schools.length : 0,
            severity,
            category: issueData.category,
            urgency: Math.round(finalScore * 100) || 50, // Default to 50 if no data
            schoolDetails: buildSchoolDetails(issueData.id),
            overallAverage: overallAvg,
            tier1Average: tier1Avg,
            tier2Average: tier2Avg,
            tier3Average: tier3Avg,
          };
        }
        const metricsForCategory = BOOKLET_ISSUE_TO_METRICS_MAP[issueData.id] || [];
        let totalLowScores = 0;
        let totalScoresCount = 0;
        const affectedSchoolIds = new Set<number>();

        if (schools && schools.length > 0) {
            schools.forEach(school => {
                let hasLowScoreInIssue = false;
                metricsForCategory.forEach(metric => {
                    const score = parseInt(school[metric] as string, 10);
                    if (!isNaN(score) && score > 0) {
                        totalScoresCount++;
                        if (score <= 2) {
                            totalLowScores++;
                            hasLowScoreInIssue = true;
                        }
                    }
                });
                if (hasLowScoreInIssue) {
                    affectedSchoolIds.add(school.id);
                }
            });
        }

        const affectedSchoolsCount = affectedSchoolIds.size;
        
        // Always show differentiated instruction even if no schools have low scores or no schools at all
        if (affectedSchoolsCount === 0 && issueData.id !== 'differentiated_instruction') {
          return null;
        }
        
        // For differentiated instruction, ensure it always appears
        if (issueData.id === 'differentiated_instruction') {
            // This issue will always be included
        }

        const scopeScore = (schools && schools.length > 0) ? (affectedSchoolsCount / schools.length) : 0;
        const severityScore = totalScoresCount > 0 ? (totalLowScores / totalScoresCount) : 0;
        const finalScore = (scopeScore * 0.6) + (severityScore * 0.4);

        let severity: 'critical' | 'high' | 'medium' | 'low';
        
        // For differentiated instruction, set minimum severity if no low scores or no schools
        if (issueData.id === 'differentiated_instruction' && (affectedSchoolsCount === 0 || !schools || schools.length === 0)) {
            severity = 'medium';
        } else {
            if (finalScore > 0.4) severity = 'critical';
            else if (finalScore > 0.25) severity = 'high';
            else if (finalScore > 0.1) severity = 'medium';
            else severity = 'low';
        }
        
        const tier1Schools = schools ? schools.filter(s => s.tier === 1) : [];
        const tier2Schools = schools ? schools.filter(s => s.tier === 2) : [];
        const tier3Schools = schools ? schools.filter(s => s.tier === 3) : [];

        return {
          id: issueData.id,
          name: issueData.title,
          description: issueData.principalGoal,
          affectedSchools: affectedSchoolsCount,
          totalSchools: schools ? schools.length : 0,
          severity,
          category: issueData.category,
          urgency: issueData.id === 'differentiated_instruction' && (!schools || schools.length === 0) ? 50 : Math.round(finalScore * 100),
          schoolDetails: buildSchoolDetails(issueData.id),
          overallAverage: calculateAverageForCategory(issueData.id, schools || []),
          tier1Average: calculateAverageForCategory(issueData.id, tier1Schools),
          tier2Average: calculateAverageForCategory(issueData.id, tier2Schools),
          tier3Average: calculateAverageForCategory(issueData.id, tier3Schools),
        };
      })
      .filter((issue): issue is Issue => issue !== null)
      .sort((a, b) => b.urgency - a.urgency);

    setIssues(identifiedIssues);
  }, [schools, selectedFocusAreas]);

  useEffect(() => {
    setIsAnalyzing(true);
    const timerId = setTimeout(() => {
      analyzeSchoolData(); // Always call this, even without schools
      setIsAnalyzing(false);
    }, 1500);
    return () => clearTimeout(timerId);
  }, [schools, analyzeSchoolData]);

  const handleIssueSelection = (issueId: string) => {
    setSelectedIssues(prev => {
      if (prev.includes(issueId)) return prev.filter(id => id !== issueId);
      if (prev.length < 3) return [...prev, issueId];
      return prev;
    });
  };

  const handleToggleDetails = (issueId: string) => {
    setExpandedIssueId(prev => (prev === issueId ? null : issueId));
  };

  const handleContinue = () => {
    onComplete(issues.filter(issue => selectedIssues.includes(issue.id)));
  };

    const getSeverityText = (severity: 'critical' | 'high' | 'medium' | 'low') => ({ critical: 'קריטי', high: 'גבוה', medium: 'בינוני', low: 'נמוך'}[severity]);
    const getCategoryText = (category: 'pedagogical' | 'organizational' | 'community' | 'strategic') => ({ pedagogical: 'פדגוגי', organizational: 'ארגוני', community: 'קהילתי', strategic: 'אסטרטגי'}[category]);
    const getCategoryIcon = (category: string) => ({ 
        pedagogical: <BookOpen className="w-5 h-5" />, 
        organizational: <Briefcase className="w-5 h-5" />, 
        community: <HeartHandshake className="w-5 h-5" />,
        strategic: <Puzzle className="w-5 h-5" />
    }[category] || <FileText className="w-5 h-5" />);

  if (isAnalyzing) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg"><div className="flex flex-col items-center justify-center text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">מנתח נתונים מערכתיים</h2>
          <p className="text-lg text-gray-600 mt-2">מקבץ אתגרים ומזהה סוגיות רלוונטיות... אנא המתן.</p>
        </div></div>);
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center"><div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">3</div><h2 className="text-2xl font-bold">בחירת סוגיות ספציפיות להתערבות</h2></div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">{schools.length} בתי ספר נותחו</div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <div>
            <p className="font-semibold">זיהינו {issues.length} סוגיות רלוונטיות לתחומי ההתמקדות שבחרת. בחר/י עד 3 סוגיות להתערבות.</p>
            <p className="text-sm">הסוגיות מדורגות לפי רמת הדחיפות שלהן, המבוססת על היקף וחומרת האתגרים בנתונים.</p>
        </div>
      </div>
      
      <div className="space-y-4 mb-8">
        {issues.length > 0 ? (
          issues.map((issue) => (
            <div key={issue.id} className={`border rounded-lg transition-all duration-300 ${ selectedIssues.includes(issue.id) ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              <div className="p-4 md:p-6 cursor-pointer" onClick={() => handleIssueSelection(issue.id)}>
                  <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border bg-white`}>{getSeverityText(issue.severity)}</span>
                          <div className="flex items-center text-gray-500"><span className="text-sm mr-1.5">{getCategoryText(issue.category)}</span>{getCategoryIcon(issue.category)}</div>
                      </div>
                      <div className="flex items-center h-5">
                          {selectedIssues.includes(issue.id) && <><CheckCircle className="w-5 h-5 text-blue-600 ml-1" /><span className="text-blue-600 font-semibold">נבחר</span></>}
                      </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{issue.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{issue.description}</p>
              
                   <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                          <div className="text-xs text-gray-500">ממוצע כללי</div>
                          <div className="text-xl font-bold text-gray-800">{issue.overallAverage?.toFixed(2) ?? 'N/A'}</div>
                      </div>
                      <div>
                          <div className="text-xs text-gray-500">ממוצע תפקוד גבוה</div>
                          <div className="text-xl font-bold text-green-600">{issue.tier1Average?.toFixed(2) ?? 'N/A'}</div>
                      </div>
                      <div>
                          <div className="text-xs text-gray-500">ממוצע תפקוד בינוני</div>
                          <div className="text-xl font-bold text-yellow-500">{issue.tier2Average?.toFixed(2) ?? 'N/A'}</div>
                      </div>
                      <div>
                          <div className="text-xs text-gray-500">ממוצע תפקוד נמוך</div>
                          <div className="text-xl font-bold text-red-600">{issue.tier3Average?.toFixed(2) ?? 'N/A'}</div>
                      </div>
                  </div>
              </div>
              <div className="px-4 md:px-6 py-3 border-t border-gray-200 bg-white/50">
                  <button onClick={(e) => { e.stopPropagation(); handleToggleDetails(issue.id);}} className="flex justify-between items-center w-full text-sm font-semibold text-blue-700 hover:text-blue-800">
                      <span>{expandedIssueId === issue.id ? 'הסתר פירוט' : 'הצג פירוט בתי ספר'}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${expandedIssueId === issue.id ? 'rotate-180' : ''}`} />
                  </button>
              </div>
               <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedIssueId === issue.id ? 'max-h-[500px]' : 'max-h-0'}`}>
                   {expandedIssueId === issue.id && <SchoolDetailsView details={issue.schoolDetails} />}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed">
            <h2 className="text-xl font-semibold text-gray-700">לא זוהו סוגיות רלוונטיות</h2>
            <p className="text-gray-500 mt-2">בהתבסס על הנתונים ותחומי ההתמקדות שנבחרו, לא אותרו סוגיות מערכתיות הדורשות התערבות. ניתן לחזור אחורה ולבחור תחומי התמקדות אחרים.</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <button onClick={onBack} className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors flex items-center font-semibold"><ArrowRight className="w-5 h-5 ml-2" />חזרה</button>
        <button
          disabled={issues.length > 0 && selectedIssues.length === 0}
          onClick={handleContinue}
          className={`py-3 px-6 rounded-lg flex items-center gap-2 font-bold ${
            (selectedIssues.length > 0 || issues.length === 0) ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          המשך לסיווג MTSS <ArrowLeft className="w-5 h-5" />
          {issues.length > 0 && <span className="bg-white bg-opacity-20 px-2.5 py-1 rounded-full text-xs">{selectedIssues.length}/3</span>}
        </button>
      </div>
    </div>
  );
};

export default IssueSelectionStep;
