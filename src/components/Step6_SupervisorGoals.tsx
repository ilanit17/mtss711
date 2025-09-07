import React from 'react';
import { Issue } from '../types';
import { issuesAndGoalsData } from '../data/issuesAndGoalsData';
import { ArrowRight, ArrowLeft, CheckSquare, Lightbulb, Users } from 'lucide-react';

interface Step6Props {
  selectedIssues: Issue[];
  onComplete: () => void;
  onBack: () => void;
}

const IssueKnowledgeCard: React.FC<{ issueId: string }> = ({ issueId }) => {
    const issueData = issuesAndGoalsData.find(i => i.id === issueId);
    if (!issueData) {
        return <div className="p-4 bg-red-100 border border-red-200 rounded-lg">לא נמצא מידע עבור הסוגייה: {issueId}</div>;
    }

    const { title, principalGoal, supervisorStance, provenPractices, supervisorSupport } = issueData;

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-md mb-8 overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h2 className="text-2xl font-extrabold text-gray-800">{title}</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                {/* Left Column */}
                <div className="space-y-8">
                    <div>
                        <h3 className="font-bold text-lg text-gray-700 mb-2">מטרת המנהל/ת</h3>
                        <p className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-r-lg">{principalGoal}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-700 mb-3 flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            תפקיד המפקח/ת בתמיכה במנהל/ת
                        </h3>
                        <div className="p-4 bg-purple-50 border-l-4 border-purple-500 text-purple-800 rounded-r-lg space-y-4">
                             <p className="italic">{supervisorStance}</p>
                             {supervisorSupport.roles.length > 0 && (
                                <ul className="space-y-2 text-sm list-disc list-inside pl-2 text-purple-900">
                                    {supervisorSupport.roles.map((role, index) => <li key={index}>{role}</li>)}
                                </ul>
                             )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                     <div>
                        <h3 className="font-bold text-lg text-gray-700 mb-2 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            <span>תובנות מהמחקר ומהשטח: פרקטיקות מובילות בתחום <strong>{title}</strong></span>
                        </h3>
                        <ul className="space-y-3 text-sm list-inside pl-2 text-gray-700">
                            {provenPractices.map((practice, index) => (
                                <li key={index} className="flex items-start">
                                    <CheckSquare className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                                    <span>{practice}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Step6_SupervisorGoals: React.FC<Step6Props> = ({ selectedIssues, onComplete, onBack }) => {
  const selectedIssueNames = selectedIssues.map(issue => issue.name).join(', ');

  return (
    <div className="bg-gray-50 p-8 rounded-lg">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          הגדרת מטרות ויעדים
        </h1>
        <p className="text-gray-500 mt-2 text-lg max-w-3xl mx-auto">
          להלן פירוט הידע המקצועי, הפרקטיקות המומלצות ומודל התמיכה עבור הסוגיות שבחרת.
        </p>
      </header>

       {selectedIssueNames && (
        <div className="mb-8 p-4 bg-white border border-gray-200 shadow-sm rounded-lg">
            <h2 className="text-lg font-bold text-gray-800">התמקדות בסוגיות שנבחרו:</h2>
            <p className="text-blue-700 font-medium">{selectedIssueNames}</p>
        </div>
      )}

      <div>
        {selectedIssues.map(issue => (
            <IssueKnowledgeCard key={issue.id} issueId={issue.id} />
        ))}
      </div>

      <div className="flex justify-between items-center mt-12 border-t border-gray-200 pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors"
        >
          <ArrowRight size={18} />
          חזרה לסיווג MTSS
        </button>
        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105"
        >
          המשך לבניית תוכנית התערבות
          <ArrowLeft size={20} />
        </button>
      </div>
    </div>
  );
};

export default Step6_SupervisorGoals;