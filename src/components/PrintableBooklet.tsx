import React, { useRef, useMemo, useState } from 'react';
import { issuesAndGoalsData } from '../data/issuesAndGoalsData';
import { interventionPlanData } from '../data/interventionPlanData';
import { FOCUS_AREA_DEFINITIONS, BOOKLET_TO_PLAN_ISSUES_MAP } from '../constants';
import { Printer, Download, ArrowRight, CheckSquare, Lightbulb, Users, Layers3, Target, ShieldAlert, BookOpen, Loader } from 'lucide-react';
import type { FullSystemicIssue } from '../types';

// Declare globals for CDN scripts
declare global {
    interface Window {
        jspdf: {
            jsPDF: any;
        };
    }
}
declare const html2canvas: any;


interface PlanOptions {
    mainGoalOptions: string[];
    measurableObjectivesOptions: string[];
    mainActionsOptions: string[];
    supportFrequencyOptions: string[];
    successMetricsOptions: string[];
    partnersOptions: string[];
}

interface PrintableBookletProps {
    onBack: () => void;
}

const RenderOptionsList: React.FC<{ title: string; options: string[] }> = ({ title, options }) => {
    if (!options || options.length === 0) return null;
    return (
        <div className="mb-4 break-inside-avoid">
            <h6 className="font-semibold text-gray-700 text-sm mb-1">{title}</h6>
            <ul className="list-disc list-inside space-y-1 pl-2 text-sm text-gray-600">
                {options.map((opt, i) => <li key={i}>{opt}</li>)}
            </ul>
        </div>
    );
};

const PlanOptionsDisplay: React.FC<{ tierTitle: string; options: PlanOptions; color: string }> = ({ tierTitle, options, color }) => (
    <div className={`mt-4 p-4 border-l-4 ${color} bg-gray-50/50 rounded-r-lg break-inside-avoid`}>
        <h5 className="text-lg font-bold text-gray-800">{tierTitle}</h5>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <RenderOptionsList title="מטרות מרכזיות" options={options.mainGoalOptions} />
            <RenderOptionsList title="יעדים מדידים" options={options.measurableObjectivesOptions} />
            <RenderOptionsList title="פעולות מרכזיות" options={options.mainActionsOptions} />
            <RenderOptionsList title="תדירות ליווי" options={options.supportFrequencyOptions} />
            <RenderOptionsList title="מדדי הצלחה" options={options.successMetricsOptions} />
            <RenderOptionsList title="שותפים" options={options.partnersOptions} />
        </div>
    </div>
);

const BoldingFormatter: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </>
    );
};

const KnowledgeCardDisplay: React.FC<{ issueInfo: FullSystemicIssue }> = ({ issueInfo }) => (
    <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm break-inside-avoid">
        <h4 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">כרטיס ידע מקצועי</h4>
        <div className="space-y-6">
            <div className="p-3 bg-blue-50 border-r-4 border-blue-500 rounded-lg">
                <h5 className="text-md font-bold text-blue-800">מטרת המנהל/ת</h5>
                <p className="mt-1 text-sm text-gray-700">{issueInfo.principalGoal}</p>
            </div>
            <div className="p-3 bg-purple-50 border-r-4 border-purple-500 rounded-lg">
                <h5 className="text-md font-bold text-purple-800">עמדת המפקח/ת</h5>
                <p className="mt-1 text-sm text-gray-700">{issueInfo.supervisorStance}</p>
            </div>
            <div>
                <h5 className="text-md font-bold text-gray-700 mb-2 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-500" />פרקטיקות מוכחות להצלחה</h5>
                <ul className="space-y-2 text-sm list-inside pl-2 text-gray-700">
                    {issueInfo.provenPractices.map((practice, i) => (
                        <li key={i} className="flex items-start">
                            <CheckSquare className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span><BoldingFormatter text={practice} /></span>
                        </li>
                    ))}
                </ul>
            </div>
             <div>
                <h5 className="text-md font-bold text-gray-700 mb-2 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600" />תפקידי המפקח/ת בתמיכה</h5>
                 <ul className="space-y-1 list-disc list-inside pl-4 text-sm text-gray-700">
                     {issueInfo.supervisorSupport.roles.map((role, i) => <li key={i}><BoldingFormatter text={role} /></li>)}
                </ul>
            </div>
             <div>
                <h5 className="text-md font-bold text-gray-700 mb-3 text-center">מודל תמיכה MTSS</h5>
                <div className="space-y-2 text-sm">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <h6 className="font-semibold text-green-800 flex items-center gap-2"><Layers3 size={16}/>רובד 1 (אוניברסלי):</h6>
                        <p className="mt-1 text-gray-600">{issueInfo.supervisorSupport.mtss.tier1.description}</p>
                    </div>
                     <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <h6 className="font-semibold text-amber-800 flex items-center gap-2"><Target size={16}/>רובד 2 (ממוקד):</h6>
                        <p className="mt-1 text-gray-600">{issueInfo.supervisorSupport.mtss.tier2.description}</p>
                    </div>
                     <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <h6 className="font-semibold text-red-800 flex items-center gap-2"><ShieldAlert size={16}/>רובד 3 (אינטנסיבי):</h6>
                        <p className="mt-1 text-gray-600">{issueInfo.supervisorSupport.mtss.tier3.description}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const PrintableBooklet: React.FC<PrintableBookletProps> = ({ onBack }) => {
    const printableContentRef = useRef<HTMLDivElement>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const combinedData = useMemo(() => {
        return Object.entries(FOCUS_AREA_DEFINITIONS).map(([areaKey, areaDef]) => {
            const issueIds = BOOKLET_TO_PLAN_ISSUES_MAP[areaKey as keyof typeof BOOKLET_TO_PLAN_ISSUES_MAP] || [];
            const issues = issueIds.map(id => {
                const issueInfo = issuesAndGoalsData.find(i => i.id === id);
                const planOptions = interventionPlanData[id];
                return { issueInfo, planOptions };
            }).filter(item => item.issueInfo && item.planOptions);

            return { areaKey, areaDef, issues };
        });
    }, []);

    const handlePrint = () => {
        const content = printableContentRef.current;
        if (!content) return;
        const printWindow = window.open('', '', 'height=800,width=1200');
        printWindow?.document.write('<html><head><title>חוברת המפקח</title>');
        printWindow?.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        printWindow?.document.write('<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800&display=swap" rel="stylesheet">');
        printWindow?.document.write('<style>body { font-family: "Heebo", sans-serif; direction: rtl; } .page-break-before { page-break-before: always; } .page-break-inside-avoid { page-break-inside: avoid; } @page { size: A4; margin: 20mm; }</style>');
        printWindow?.document.write('</head><body>');
        printWindow?.document.write(content.innerHTML);
        printWindow?.document.write('</body></html>');
        printWindow?.document.close();
        printWindow?.focus();
        setTimeout(() => {
            printWindow?.print();
            printWindow?.close();
        }, 500);
    };
    
    const handleDownload = async () => {
        setIsGeneratingPdf(true);
        const element = printableContentRef.current;
        if (!element || typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            alert('שגיאה בייצוא PDF. ודא שכל הספריות נטענו.');
            setIsGeneratingPdf(false);
            return;
        }

        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, windowWidth: 1200, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = imgProps.width;
            const imgHeight = imgProps.height;
            
            const ratio = pdfWidth / imgWidth;
            const totalPDFHeight = imgHeight * ratio;
            
            let heightLeft = totalPDFHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPDFHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPDFHeight);
                heightLeft -= pdfHeight;
            }
            pdf.save("חוברת_המפקח_MTSS.pdf");
        } catch (error) {
            console.error('PDF export failed:', error);
            alert(`שגיאה בייצוא ל-PDF: ${(error as Error).message}`);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="bg-gray-100 p-4 md:p-8">
            <header className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8 no-print flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">חוברת המפקח המלאה</h1>
                    <p className="text-gray-600">כלל הידע, הסוגיות ואפשרויות התכנון מתוך הכלי</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors">
                        <ArrowRight size={18} /> חזרה
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
                        <Printer size={18} /> הדפסה
                    </button>
                    <button onClick={handleDownload} disabled={isGeneratingPdf} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition disabled:bg-gray-400">
                        {isGeneratingPdf ? <Loader className="animate-spin" size={18} /> : <Download size={18} />}
                        {isGeneratingPdf ? 'מייצא...' : 'הורדה (PDF)'}
                    </button>
                </div>
            </header>

            <div ref={printableContentRef} className="printable-content max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-lg rounded-lg">
                <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900">חוברת המפקח</h1>
                    <p className="text-xl text-gray-600 mt-2">מתכנן התערבויות MTSS</p>
                    <p className="mt-4 text-sm text-gray-500">מסמך זה מרכז את כלל הידע המקצועי, הסוגיות המערכתיות, כרטיסי המידע ואפשרויות התכנון הקיימים בכלי.</p>
                </div>

                <div className="toc page-break-before mb-10">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">תוכן עניינים</h2>
                    <ul className="space-y-2 columns-1 sm:columns-2">
                        {combinedData.map(({ areaKey, areaDef }) => (
                            <li key={areaKey} className="break-inside-avoid">
                                <a href={`#${areaKey}`} className="text-blue-700 hover:underline font-semibold flex items-start gap-2">
                                    <span className="text-gray-500">{areaDef.icon}</span>
                                    <span>{areaDef.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {combinedData.map(({ areaKey, areaDef, issues }) => (
                    <section key={areaKey} id={areaKey} className="page-break-before pt-8">
                        <div className="bg-gray-100 p-4 rounded-lg border-b-4 border-gray-300 mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <span className="text-gray-600">{areaDef.icon}</span>
                                {areaDef.name}
                            </h2>
                        </div>

                        {issues.map(({ issueInfo, planOptions }) => (
                            issueInfo && planOptions && (
                                <article key={issueInfo.id} className="mb-12 break-inside-avoid">
                                    <div className="border-b-2 border-blue-600 pb-2 mb-6">
                                        <h3 className="text-2xl font-semibold text-blue-800 flex items-center gap-2">
                                           <BookOpen size={24} /> {issueInfo.title}
                                        </h3>
                                    </div>
                                    
                                    <KnowledgeCardDisplay issueInfo={issueInfo} />

                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 break-inside-avoid">
                                        <h4 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">אפשרויות לבניית תוכנית התערבות</h4>
                                        <div className="mb-4">
                                            <h5 className="font-semibold text-gray-700 text-sm mb-1">גורמי שורש אפשריים</h5>
                                            <ul className="list-disc list-inside space-y-1 pl-2 text-sm text-gray-600">
                                                {planOptions.rootCauseOptions.map((cause, i) => <li key={i}>{cause}</li>)}
                                            </ul>
                                        </div>
                                        <PlanOptionsDisplay tierTitle="שכבה 1: אוניברסלית" options={planOptions.tier1} color="border-green-500" />
                                        <PlanOptionsDisplay tierTitle="שכבה 2: תמיכה ממוקדת" options={planOptions.tier2} color="border-amber-500" />
                                        <PlanOptionsDisplay tierTitle="שכבה 3: התערבות אינטנסיבית" options={planOptions.tier3} color="border-red-500" />
                                    </div>
                                </article>
                            )
                        ))}
                    </section>
                ))}
            </div>
        </div>
    );
};

export default PrintableBooklet;