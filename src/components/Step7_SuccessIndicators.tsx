import React, { useState, useMemo } from 'react';
import { SupervisorGoals, SuccessIndicators, SelectedGoals } from '../types';
import { indicatorsData } from '../data/indicatorsData';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Step7Props {
  selectedGoals: SupervisorGoals;
  onComplete: (indicators: SuccessIndicators) => void;
  onBack: () => void;
}

// Sub-component for a single goal's form
const GoalIndicatorForm: React.FC<{
  goal: string;
  indicators: string[] | null;
  selection: { predefined: string[]; custom: string };
  onIndicatorChange: (goal: string, indicator: string, checked: boolean) => void;
  onCustomChange: (goal: string, value: string) => void;
}> = ({ goal, indicators, selection, onIndicatorChange, onCustomChange }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p className="font-semibold text-gray-800 mb-3">{goal}</p>
      <div className="space-y-2">
        {indicators && indicators.map((indicator) => (
          <label key={indicator} className="flex items-center text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={selection.predefined.includes(indicator)}
              onChange={(e) => onIndicatorChange(goal, indicator, e.target.checked)}
            />
            <span className="mr-2">{indicator}</span>
          </label>
        ))}
        <div className="flex items-center text-sm pt-2">
          <span className="font-medium mr-6">אחר:</span>
          <input
            type="text"
            value={selection.custom}
            onChange={(e) => onCustomChange(goal, e.target.value)}
            placeholder="הגדר מדד מותאם אישית..."
            className="flex-grow p-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
          />
        </div>
      </div>
    </div>
  );
};

// Sub-component for rendering a whole section (General, Tier 1, etc.)
const SectionRenderer: React.FC<{
  title: string;
  goals: SelectedGoals;
  indicatorsData: string[] | null;
  indicatorsState: SuccessIndicators;
  handleIndicatorChange: (goal: string, indicator: string, checked: boolean) => void;
  handleCustomChange: (goal: string, value: string) => void;
}> = ({ title, goals, indicatorsData, indicatorsState, handleIndicatorChange, handleCustomChange }) => {
  const allGoals = useMemo(() => {
    const predefinedGoals = goals?.predefined || [];
    // Fix: Added a type guard to ensure `g` is a string before calling `trim()`.
    const customGoals = Object.values(goals?.custom || {}).filter(g => typeof g === 'string' && g.trim() !== '');
    return [...predefinedGoals, ...customGoals];
  }, [goals]);

  if (allGoals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-700 border-r-4 border-blue-500 pr-3">{title}</h3>
      <div className="space-y-4">
        {allGoals.map((goal) => (
          <GoalIndicatorForm
            key={goal} // Using the goal string itself as a stable key
            goal={goal}
            indicators={indicatorsData}
            selection={indicatorsState[goal] || { predefined: [], custom: '' }}
            onIndicatorChange={handleIndicatorChange}
            onCustomChange={handleCustomChange}
          />
        ))}
      </div>
    </div>
  );
};


const Step7_SuccessIndicators: React.FC<Step7Props> = ({ selectedGoals, onComplete, onBack }) => {
  const [indicators, setIndicators] = useState<SuccessIndicators>({});

  const allSelectedGoalsFlat = useMemo(() => {
    return [
      ...(selectedGoals.general.predefined || []),
      ...Object.values(selectedGoals.general.custom || {}),
      ...(selectedGoals.tier1.predefined || []),
      ...Object.values(selectedGoals.tier1.custom || {}),
      ...(selectedGoals.tier2.predefined || []),
      ...Object.values(selectedGoals.tier2.custom || {}),
      ...(selectedGoals.tier3.predefined || []),
      ...Object.values(selectedGoals.tier3.custom || {}),
    ].filter(g => g && typeof g === 'string' && g.trim() !== '');
  }, [selectedGoals]);

  const handleIndicatorChange = (goal: string, indicator: string, checked: boolean) => {
    setIndicators(prev => {
      const currentSelection = prev[goal] || { predefined: [], custom: '' };
      const newPredefined = checked
        ? [...currentSelection.predefined, indicator]
        : currentSelection.predefined.filter(i => i !== indicator);
      return { ...prev, [goal]: { ...currentSelection, predefined: newPredefined } };
    });
  };

  const handleCustomChange = (goal: string, value: string) => {
    setIndicators(prev => {
      const currentSelection = prev[goal] || { predefined: [], custom: '' };
      return { ...prev, [goal]: { ...currentSelection, custom: value } };
    });
  };

  const isComplete = useMemo(() => {
      // Allow proceeding even if no goals were selected in the previous step
      if (allSelectedGoalsFlat.length === 0) return true; 

      return allSelectedGoalsFlat.every(goal => {
          const selection = indicators[goal];
          return selection && (selection.predefined.length > 0 || selection.custom.trim() !== '');
      });
  }, [indicators, allSelectedGoalsFlat]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          שלב 7: הגדרת מדדי הצלחה (אינדיקטורים)
        </h1>
        <p className="text-gray-500 mt-2 text-lg max-w-3xl mx-auto">
          לכל מטרה שנבחרה בשלב הקודם, הגדר/י מדד הצלחה כמותי או איכותני שישמש למדידת ההתקדמות.
        </p>
      </header>

      <div className="space-y-8">
        <SectionRenderer
          title="מטרות כלליות"
          goals={selectedGoals.general}
          indicatorsData={indicatorsData.general}
          indicatorsState={indicators}
          handleIndicatorChange={handleIndicatorChange}
          handleCustomChange={handleCustomChange}
        />
        <SectionRenderer
          title="מטרות לשכבה 3 (התערבות אינטנסיבית)"
          goals={selectedGoals.tier3}
          indicatorsData={indicatorsData.tier3}
          indicatorsState={indicators}
          handleIndicatorChange={handleIndicatorChange}
          handleCustomChange={handleCustomChange}
        />
        <SectionRenderer
          title="מטרות לשכבה 2 (תמיכה ממוקדת)"
          goals={selectedGoals.tier2}
          indicatorsData={indicatorsData.tier2}
          indicatorsState={indicators}
          handleIndicatorChange={handleIndicatorChange}
          handleCustomChange={handleCustomChange}
        />
        <SectionRenderer
          title="מטרות לשכבה 1 (אוניברסלית)"
          goals={selectedGoals.tier1}
          indicatorsData={indicatorsData.tier1}
          indicatorsState={indicators}
          handleIndicatorChange={handleIndicatorChange}
          handleCustomChange={handleCustomChange}
        />
      </div>

       {allSelectedGoalsFlat.length === 0 && (
          <div className="text-center bg-yellow-50 border border-yellow-200 p-6 rounded-lg mt-8">
            <h2 className="text-xl font-semibold text-yellow-800">לא נבחרו מטרות</h2>
            <p className="text-gray-600 mt-2">
                נראה שלא נבחרו מטרות בשלב הקודם. ניתן לחזור אחורה או להמשיך לשלב הבא.
            </p>
          </div>
       )}

      <div className="flex justify-between items-center mt-12 border-t pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors"
        >
          <ArrowRight size={18} />
          חזרה להגדרת מטרות ויעדים
        </button>
        <button
          onClick={() => onComplete(indicators)}
          disabled={!isComplete}
          className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          המשך לבניית תוכנית התערבות
          <ArrowLeft size={20} />
        </button>
      </div>
       {!isComplete && allSelectedGoalsFlat.length > 0 && (
          <p className="text-center text-sm text-yellow-700 mt-4 bg-yellow-50 p-2 rounded-md">יש להגדיר לפחות מדד הצלחה אחד עבור כל מטרה שנבחרה.</p>
      )}
    </div>
  );
};

export default Step7_SuccessIndicators;