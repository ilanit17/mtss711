import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Step4Props {
  onComplete: () => void;
  onBack: () => void;
}

const Step4_InterventionPlan: React.FC<Step4Props> = ({ onComplete, onBack }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          שלב 4: בניית תוכנית התערבות
        </h1>
        <p className="text-gray-500 mt-2 text-lg max-w-3xl mx-auto">
          בשלב זה תיבנה תוכנית התערבות המפורטת לכל שכבות MTSS
        </p>
      </header>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-lg mb-8 text-center">
        <h2 className="text-xl font-bold mb-2">תוכנית ההתערבות תיבנה בשלב הבא</h2>
        <p className="text-blue-700">
          בשלב הבא תוכל לבנות תוכנית התערבות מפורטת לכל שכבות MTSS
          עם אפשרויות בחירה מגוונות ומותאמות אישית לכל סוגיה.
        </p>
      </div>

      <div className="flex justify-between items-center mt-12 border-t pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors"
        >
          <ArrowRight size={18} />
          חזרה לשלב הקודם
        </button>
        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105"
        >
          המשך לבניית תוכנית
          <ArrowLeft size={20} />
        </button>
      </div>
    </div>
  );
};

export default Step4_InterventionPlan;
