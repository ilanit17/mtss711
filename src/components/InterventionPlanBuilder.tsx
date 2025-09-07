import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Issue, AllInterventionPlans, TierPlan, PlanComponent, TieredSchools, SchoolForAnalysis, Tier2Group, Tier3PlanManager, InformationCard } from '../types';
import { interventionPlanData } from '../data/interventionPlanData';
import { informationCardsData } from '../data/informationCardsData';
import { issuesAndGoalsData } from '../data/issuesAndGoalsData';
import { ArrowLeft, ArrowRight, Send, RotateCcw, ChevronDown, GripVertical, Plus, CheckSquare, Printer, Download, Loader, AlertCircle, Trash2, Users, Wand2, BookOpen, User, Check, Target, Layers3, ShieldAlert } from 'lucide-react';


// Declare globals for CDN scripts
declare global {
    interface Window {
        jspdf: {
            jsPDF: any;
        };
    }
}
declare const html2canvas: any;

const emptyPlanComponent = (): PlanComponent => ({ predefined: [], custom: '' });
const emptyTierPlan = (): TierPlan => ({
    mainGoal: emptyPlanComponent(),
    measurableObjectives: emptyPlanComponent(),
    mainActions: emptyPlanComponent(),
    supportFrequency: emptyPlanComponent(),
    successMetrics: emptyPlanComponent(),
    partners: emptyPlanComponent(),
});

interface PlanOptions {
    mainGoalOptions: string[];
    measurableObjectivesOptions: string[];
    mainActionsOptions: string[];
    supportFrequencyOptions: string[];
    successMetricsOptions: string[];
    partnersOptions: string[];
}

const emptyPlanOptions: PlanOptions = {
    mainGoalOptions: [], measurableObjectivesOptions: [], mainActionsOptions: [],
    supportFrequencyOptions: [], successMetricsOptions: [], partnersOptions: []
};

const createInitialPlanForIssue = (issue: Issue): AllInterventionPlans[string] => {
    const defaults = interventionPlanData[issue.id];
    const goalsData = issuesAndGoalsData.find(i => i.id === issue.id);

    const prefilledTier1: TierPlan = emptyTierPlan();
    if (defaults?.tier1) {
        prefilledTier1.mainGoal.predefined = defaults.tier1.mainGoalOptions.slice(0, 1);
        prefilledTier1.measurableObjectives.predefined = defaults.tier1.measurableObjectivesOptions;
        prefilledTier1.mainActions.predefined = defaults.tier1.mainActionsOptions;
        prefilledTier1.supportFrequency.predefined = defaults.tier1.supportFrequencyOptions.slice(0, 1);
        prefilledTier1.successMetrics.predefined = defaults.tier1.successMetricsOptions;
        prefilledTier1.partners.predefined = defaults.tier1.partnersOptions;
    }

    return {
        selectedRootCauses: [],
        principalGoal: defaults?.principalGoal || goalsData?.principalGoal || '',
        supervisorRole: defaults?.supervisorRole || goalsData?.supervisorStance || '',
        tier1: prefilledTier1,
        tier2Groups: [],
        tier3: {
            useGeneralPlan: true,
            generalPlan: emptyTierPlan(),
            individualPlans: {}
        },
    };
};


// --- DraggableList Component for Reordering ---
interface DraggableListProps {
    items: string[];
    onReorder: (reorderedItems: string[]) => void;
    tierColor: string;
}

const DraggableList: React.FC<DraggableListProps> = ({ items, onReorder, tierColor }) => {
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [dragOverItem, setDragOverItem] = useState<string | null>(null);

    const tierStyles: { [key: string]: { bg: string; bgDragged: string; text: string; grip: string; ring: string; } } = {
        red: { bg: 'bg-red-100', bgDragged: 'bg-red-200', text: 'text-red-900', grip: 'text-red-600', ring: 'ring-red-500' },
        amber: { bg: 'bg-amber-100', bgDragged: 'bg-amber-200', text: 'text-amber-900', grip: 'text-amber-600', ring: 'ring-amber-500' },
        green: { bg: 'bg-green-100', bgDragged: 'bg-green-200', text: 'text-green-900', grip: 'text-green-600', ring: 'ring-green-500' },
        gray: { bg: 'bg-gray-100', bgDragged: 'bg-gray-200', text: 'text-gray-900', grip: 'text-gray-600', ring: 'ring-gray-500' },
    };
    const styles = tierStyles[tierColor] || tierStyles.gray;

    const handleDragStart = (item: string) => setDraggedItem(item);
    const handleDragEnter = (item: string) => setDragOverItem(item);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const handleDrop = () => {
        if (draggedItem && dragOverItem && draggedItem !== dragOverItem) {
            const oldIndex = items.indexOf(draggedItem);
            const newIndex = items.indexOf(dragOverItem);
            if (oldIndex !== -1 && newIndex !== -1) {
                const newItems = [...items];
                const [removed] = newItems.splice(oldIndex, 1);
                newItems.splice(newIndex, 0, removed);
                onReorder(newItems);
            }
        }
        setDraggedItem(null);
        setDragOverItem(null);
    };

    return (
        <div onDragOver={handleDragOver} onDrop={handleDrop} className="space-y-1">
            {items.map(item => (
                <div
                    key={item}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    onDragEnter={() => handleDragEnter(item)}
                    className={`flex items-center p-2 rounded-md cursor-grab transition-all duration-200
                        ${draggedItem === item ? `opacity-50 ${styles.bgDragged}` : styles.bg}
                        ${dragOverItem === item && draggedItem !== item ? `ring-2 ring-offset-1 ${styles.ring}` : ''}
                    `}
                >
                    <GripVertical className={`w-5 h-5 flex-shrink-0 ${styles.grip} mr-2`} aria-hidden="true" />
                    <span className={`text-sm ${styles.text}`}>{item}</span>
                </div>
            ))}
        </div>
    );
};


interface PlanFieldEditorProps {
    label: string;
    options: string[];
    value: PlanComponent;
    tierColor: string;
    onChange: (newValue: PlanComponent) => void;
    reorderable?: boolean;
}

const PlanFieldEditor: React.FC<PlanFieldEditorProps> = ({ label, options, value, tierColor, onChange, reorderable = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const tierStyles: { [key: string]: { bg: string; text: string; border: string; } } = {
        red: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-500' },
        amber: { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-500' },
        green: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-500' },
        gray: { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-500' },
    };
    const styles = tierStyles[tierColor] || tierStyles.gray;

    const handleToggleOption = (option: string) => {
        const isSelected = value.predefined.includes(option);
        let newPredefined;
        if (isSelected) {
            newPredefined = value.predefined.filter(item => item !== option);
        } else {
            const tempSelection = [...value.predefined, option];
            newPredefined = reorderable 
                ? tempSelection 
                : options.filter(o => tempSelection.includes(o));
        }
        onChange({ ...value, predefined: newPredefined });
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...value, custom: e.target.value });
    };
    
    const handleReorder = (reorderedItems: string[]) => {
        onChange({ ...value, predefined: reorderedItems });
    };

    const showSearch = options.length > 6;

    const displayOptions = useMemo(() => {
        if (!searchTerm) {
            return options;
        }
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        // Show options that match the search term OR are already selected.
        return options.filter(option => 
            option.toLowerCase().includes(lowercasedSearchTerm) || value.predefined.includes(option)
        );
    }, [options, searchTerm, value.predefined]);

    return (
        <div className="bg-white/70 rounded-lg p-4 flex flex-col border border-gray-200 shadow-sm h-full">
            <label className="block text-md font-bold text-gray-800 mb-3">{label}</label>
            <div className="flex-grow space-y-4">
                {options.length > 0 && (
                    <div>
                        <h5 className="text-xs font-semibold text-gray-500 mb-2">אפשרויות מוצעות</h5>
                        {showSearch && (
                            <div className="relative mb-2">
                                <input
                                    type="text"
                                    placeholder="חיפוש אפשרויות..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-2 pr-8 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                     <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                             {displayOptions.length > 0 ? displayOptions.map(option => {
                                const isSelected = value.predefined.includes(option);
                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleToggleOption(option)}
                                        className={`px-2.5 py-1 text-xs rounded-full border transition-all duration-200 flex items-center gap-1.5
                                            ${isSelected ? `${styles.bg} ${styles.text} ${styles.border} shadow-sm` : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'}
                                        `}
                                    >
                                        {isSelected ? <CheckSquare className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                        {option}
                                    </button>
                                );
                            }) : (
                                <p className="text-sm text-gray-500 italic w-full text-center">לא נמצאו אפשרויות.</p>
                            )}
                        </div>
                    </div>
                )}
                {value.predefined.length > 0 && (
                     <div className="pt-3">
                        <h5 className="text-xs font-semibold text-gray-500 mb-2">
                            {reorderable ? 'נבחרו (ניתן לסדר מחדש בגרירה)' : 'נבחרו'}
                        </h5>
                        {reorderable ? 
                            <DraggableList items={value.predefined} onReorder={handleReorder} tierColor={tierColor} />
                            : <ul className="list-disc list-inside space-y-1 pl-1">{value.predefined.map(item => <li key={item} className="text-sm text-gray-800">{item}</li>)}</ul>
                        }
                    </div>
                )}
                 <div>
                    <h5 className="text-xs font-semibold text-gray-500 mb-2">אפשרות מותאמת אישית</h5>
                    <input
                        type="text"
                        value={value.custom}
                        onChange={handleCustomChange}
                        placeholder="הוסף אפשרות מותאמת אישית..."
                        className="w-full p-2 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-transparent text-sm"
                    />
                </div>
            </div>
        </div>
    );
};

// --- MultiSchoolSelect Component ---
interface MultiSchoolSelectProps {
    availableSchools: SchoolForAnalysis[];
    selectedSchoolIds: number[];
    onSelectionChange: (selectedIds: number[]) => void;
}
const MultiSchoolSelect: React.FC<MultiSchoolSelectProps> = ({ availableSchools, selectedSchoolIds, onSelectionChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleSchool = (schoolId: number) => {
        const newSelection = selectedSchoolIds.includes(schoolId)
            ? selectedSchoolIds.filter(id => id !== schoolId)
            : [...selectedSchoolIds, schoolId];
        onSelectionChange(newSelection);
    };

    const handleSelectAll = () => onSelectionChange(availableSchools.map(s => s.id));
    const handleDeselectAll = () => onSelectionChange([]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-white border border-gray-300 rounded-md p-2 text-right flex justify-between items-center">
                <span className="text-sm text-gray-700">{selectedSchoolIds.length} בתי ספר נבחרו</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="p-2 border-b border-gray-200 flex gap-2">
                        <button type="button" onClick={handleSelectAll} className="w-full text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">בחר הכל</button>
                        <button type="button" onClick={handleDeselectAll} className="w-full text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded hover:bg-gray-100">נקה בחירה</button>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {availableSchools.map(school => (
                            <label key={school.id} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedSchoolIds.includes(school.id)}
                                    onChange={() => handleToggleSchool(school.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="mr-2 text-sm text-gray-800">{school.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- PlanEditor Component ---
const PlanEditor: React.FC<{ plan: TierPlan, options: any, tierColor: string, onUpdate: (updatedPlan: TierPlan) => void }> = ({ plan, options, tierColor, onUpdate }) => {
    const handleFieldUpdate = (field: keyof TierPlan, value: PlanComponent) => {
        onUpdate({ ...plan, [field]: value });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <PlanFieldEditor label="מטרה מרכזית" options={options.mainGoalOptions} value={plan.mainGoal} onChange={val => handleFieldUpdate('mainGoal', val)} tierColor={tierColor} />
            <PlanFieldEditor label="יעדים מדידים" reorderable options={options.measurableObjectivesOptions} value={plan.measurableObjectives} onChange={val => handleFieldUpdate('measurableObjectives', val)} tierColor={tierColor} />
            <PlanFieldEditor label="פעולות מרכזיות" reorderable options={options.mainActionsOptions} value={plan.mainActions} onChange={val => handleFieldUpdate('mainActions', val)} tierColor={tierColor} />
            <PlanFieldEditor label="תדירות ליווי" options={options.supportFrequencyOptions} value={plan.supportFrequency} onChange={val => handleFieldUpdate('supportFrequency', val)} tierColor={tierColor} />
            <PlanFieldEditor label="מדדי הצלחה" options={options.successMetricsOptions} value={plan.successMetrics} onChange={val => handleFieldUpdate('successMetrics', val)} tierColor={tierColor} />
            <PlanFieldEditor label="שותפים" options={options.partnersOptions} value={plan.partners} onChange={val => handleFieldUpdate('partners', val)} tierColor={tierColor} />
        </div>
    );
};

// --- Tier 2 Components ---
const Tier2GroupEditor: React.FC<{ group: Tier2Group, options: any, availableSchools: SchoolForAnalysis[], onUpdate: (updatedGroup: Tier2Group) => void, onDelete: () => void }> = ({ group, options, availableSchools, onUpdate, onDelete }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleFieldUpdate = <K extends keyof Tier2Group>(field: K, value: Tier2Group[K]) => {
        onUpdate({ ...group, [field]: value });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <input
                    type="text"
                    value={group.name}
                    onChange={(e) => handleFieldUpdate('name', e.target.value)}
                    placeholder="שם הקבוצה..."
                    className="text-lg font-bold text-amber-800 border-b-2 border-transparent focus:border-amber-500 focus:outline-none bg-transparent"
                />
                 <div className="flex items-center gap-2">
                    <button type="button" onClick={onDelete} className="text-red-500 hover:text-red-700 p-1 rounded-full"><Trash2 size={16} /></button>
                    <button type="button" onClick={() => setIsOpen(!isOpen)} className="text-gray-500 p-1"><ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>
                </div>
            </div>
            {isOpen && (
                <div className="p-4 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">בחירת בתי ספר לקבוצה</label>
                        <MultiSchoolSelect
                            availableSchools={availableSchools}
                            selectedSchoolIds={group.schoolIds}
                            onSelectionChange={(ids) => handleFieldUpdate('schoolIds', ids)}
                        />
                    </div>
                    <PlanEditor
                        plan={group.plan}
                        options={options}
                        tierColor="amber"
                        onUpdate={(plan) => handleFieldUpdate('plan', plan)}
                    />
                </div>
            )}
        </div>
    );
};

const Tier2GroupManager: React.FC<{
    groups: Tier2Group[],
    options: any,
    availableSchools: SchoolForAnalysis[],
    allSelectedIssues: Issue[],
    onUpdate: (updatedGroups: Tier2Group[]) => void
}> = ({ groups, options, availableSchools, allSelectedIssues, onUpdate }) => {

    const handleSuggestGroups = () => {
        const issueToSchoolIdsMap = new Map<string, number[]>();
        
        allSelectedIssues.forEach(issue => {
            const relevantSchoolIds = issue.schoolDetails
                .filter(detail => availableSchools.some(s => s.id === detail.schoolId))
                .map(detail => detail.schoolId);
            if (relevantSchoolIds.length > 0) {
                const existing = issueToSchoolIdsMap.get(issue.id) || [];
                issueToSchoolIdsMap.set(issue.id, [...new Set([...existing, ...relevantSchoolIds])]);
            }
        });
    
        const suggestedGroups: Tier2Group[] = [];
        issueToSchoolIdsMap.forEach((schoolIds, issueId) => {
            const issue = allSelectedIssues.find(i => i.id === issueId);
            if (issue && schoolIds.length > 0) {
                suggestedGroups.push({
                    id: `group-${Date.now()}-${issueId}`,
                    name: `קבוצת אתגר: ${issue.name}`,
                    schoolIds: schoolIds,
                    plan: emptyTierPlan()
                });
            }
        });

        if (suggestedGroups.length > 0) {
            onUpdate(suggestedGroups);
        } else {
            alert("לא נמצאו קיבוצים ברורים לפי אתגרים משותפים. ניתן ליצור קבוצות באופן ידני.");
        }
    };
    
    const handleAddNewGroup = () => {
        const newGroup: Tier2Group = {
            id: `group-${Date.now()}`,
            name: `קבוצה חדשה ${groups.length + 1}`,
            schoolIds: [],
            plan: emptyTierPlan()
        };
        onUpdate([...groups, newGroup]);
    };

    return (
        <div className="p-5 bg-gray-50/50 rounded-xl border-l-4 shadow-sm border-amber-500">
            <h4 className="text-xl font-bold text-amber-800 mb-4">שכבה 2: תמיכה ממוקדת</h4>
            <div className="flex flex-wrap gap-2 mb-4">
                <button type="button" onClick={handleAddNewGroup} className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-md hover:bg-green-600"><Plus size={16}/> הוסף קבוצה</button>
                <button type="button" onClick={handleSuggestGroups} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600"><Wand2 size={16}/> הצע קבוצות</button>
            </div>
            {groups.length === 0 && <p className="text-sm text-gray-500 text-center py-4">אין עדיין קבוצות. ניתן להוסיף קבוצה חדשה או לבקש הצעות אוטומטיות.</p>}
            {groups.map(group => (
                <Tier2GroupEditor
                    key={group.id}
                    group={group}
                    options={options}
                    availableSchools={availableSchools}
                    onUpdate={(updated) => onUpdate(groups.map(g => g.id === updated.id ? updated : g))}
                    onDelete={() => onUpdate(groups.filter(g => g.id !== group.id))}
                />
            ))}
        </div>
    );
};

// --- Tier 3 Components ---
const Tier3PlanManager: React.FC<{
    planManager: Tier3PlanManager,
    options: any,
    availableSchools: SchoolForAnalysis[],
    onUpdate: (updatedManager: Tier3PlanManager) => void
}> = ({ planManager, options, availableSchools, onUpdate }) => {
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(availableSchools[0]?.id || null);

    const handleToggleGeneralPlan = (useGeneral: boolean) => {
        onUpdate({ ...planManager, useGeneralPlan: useGeneral });
    };

    const handleIndividualPlanUpdate = (schoolId: number, updatedPlan: TierPlan) => {
        onUpdate({
            ...planManager,
            individualPlans: { ...planManager.individualPlans, [schoolId]: updatedPlan }
        });
    };
    
    if (availableSchools.length === 0) {
        return (
             <div className="p-5 bg-gray-50/50 rounded-xl border-l-4 shadow-sm border-red-500">
                <h4 className="text-xl font-bold text-red-800 mb-4">שכבה 3: התערבות אינטנסיבית</h4>
                <div className="text-center p-4 bg-white rounded-md border text-gray-500">
                    לא שויכו בתי ספר לשכבת התערבות זו.
                </div>
            </div>
        );
    }

    const selectedSchoolPlan = selectedSchoolId ? (planManager.individualPlans[selectedSchoolId] || emptyTierPlan()) : emptyTierPlan();

    return (
        <div className="p-5 bg-gray-50/50 rounded-xl border-l-4 shadow-sm border-red-500">
            <h4 className="text-xl font-bold text-red-800 mb-4">שכבה 3: התערבות אינטנסיבית</h4>
            <label className="flex items-center p-3 bg-white rounded-md border cursor-pointer hover:bg-gray-100 mb-4">
                <input
                    type="checkbox"
                    checked={planManager.useGeneralPlan}
                    onChange={(e) => handleToggleGeneralPlan(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-3 text-sm font-semibold text-gray-700">השתמש בתוכנית כללית לכל בתי הספר בשכבה 3</span>
            </label>

            {planManager.useGeneralPlan ? (
                <PlanEditor
                    plan={planManager.generalPlan}
                    options={options}
                    tierColor="red"
                    onUpdate={(plan) => onUpdate({ ...planManager, generalPlan: plan })}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-white p-3 rounded-lg border">
                        <h5 className="font-semibold mb-2 text-sm">בחר בית ספר לעריכה</h5>
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                            {availableSchools.map(school => (
                                <button
                                    key={school.id}
                                    type="button"
                                    onClick={() => setSelectedSchoolId(school.id)}
                                    className={`w-full text-right p-2 rounded-md text-sm transition-colors ${selectedSchoolId === school.id ? 'bg-blue-100 text-blue-800 font-bold' : 'hover:bg-gray-100'}`}
                                >
                                    {school.name}
                                    {planManager.individualPlans[school.id] && <CheckSquare className="inline w-4 h-4 text-green-600 mr-2" />}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        {selectedSchoolId && (
                            <div>
                                <h5 className="font-bold mb-3">תוכנית אישית עבור: <span className="text-blue-700">{availableSchools.find(s => s.id === selectedSchoolId)?.name}</span></h5>
                                <PlanEditor
                                    plan={selectedSchoolPlan}
                                    options={options}
                                    tierColor="red"
                                    onUpdate={(plan) => handleIndividualPlanUpdate(selectedSchoolId, plan)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


interface IssueAccordionItemProps {
    issueId: string;
    title: string;
    plan: AllInterventionPlans[string];
    tieredSchools: TieredSchools;
    allSelectedIssues: Issue[];
    onUpdate: (issueId: string, updatedPlan: AllInterventionPlans[string]) => void;
    isOpen: boolean;
    onToggle: () => void;
}

const IssueAccordionItem: React.FC<IssueAccordionItemProps> = ({ issueId, title, plan, tieredSchools, allSelectedIssues, onUpdate, isOpen, onToggle }) => {
    const issueDefaults = interventionPlanData[issueId] || {
        title: title,
        rootCauseOptions: [],
        principalGoal: issuesAndGoalsData.find(i => i.id === issueId)?.principalGoal || 'לא הוגדרה מטרה.',
        supervisorRole: issuesAndGoalsData.find(i => i.id === issueId)?.supervisorStance || 'לא הוגדר תפקיד.',
        tier1: emptyPlanOptions,
        tier2: emptyPlanOptions,
        tier3: emptyPlanOptions,
    };
    
    if (!plan) return null;

    const handleRootCauseChange = (cause: string, checked: boolean) => {
        const newCauses = checked
            ? [...plan.selectedRootCauses, cause]
            : plan.selectedRootCauses.filter(c => c !== cause);
        onUpdate(issueId, { ...plan, selectedRootCauses: newCauses });
    };

    const handleTier1Update = (field: keyof TierPlan, value: PlanComponent) => {
        onUpdate(issueId, { ...plan, tier1: { ...plan.tier1, [field]: value } });
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200/80 overflow-hidden">
            <button
                type="button"
                className="w-full flex justify-between items-center p-5 text-right font-semibold text-xl text-gray-800 hover:bg-gray-50/70 transition-colors duration-200"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span>{title}</span>
                <ChevronDown className={`w-6 h-6 transform transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[5000px]' : 'max-h-0'}`}>
                <div className="p-5 border-t border-gray-200 bg-gray-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-blue-800 mb-3">ניתוח גורמי שורש (יש לבחור)</h3>
                            <div className="space-y-2">
                                {issueDefaults.rootCauseOptions.length > 0 ? issueDefaults.rootCauseOptions.map(cause => (
                                    <label key={cause} className="flex items-center p-2 rounded-md hover:bg-blue-50 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={plan.selectedRootCauses.includes(cause)}
                                            onChange={(e) => handleRootCauseChange(cause, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="mr-3 text-gray-700">{cause}</span>
                                    </label>
                                )) : <p className="text-sm text-gray-500">לא נמצאו גורמי שורש מוצעים. ניתן להמשיך לבניית התוכנית.</p>}
                            </div>
                        </div>
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200/50">
                            <h3 className="text-lg font-bold text-blue-800 mb-3">הגדרת מטרות</h3>
                            <div className="space-y-4 text-sm">
                                <p><strong className="font-semibold block text-gray-600">מטרת המנהל/ת:</strong> {plan.principalGoal}</p>
                                <p><strong className="font-semibold block text-gray-600">תפקיד המפקח/ת:</strong> {plan.supervisorRole}</p>
                            </div>
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-blue-800 mb-4">תוכנית התערבות מערכתית (ניתן לערוך)</h3>
                    <div className="space-y-6">
                        <div className="p-5 bg-gray-50/50 rounded-xl border-l-4 shadow-sm border-green-500">
                            <h4 className="text-xl font-bold text-green-800">שכבה 1: אוניברסלית ({tieredSchools.tier1.length} בתי ספר)</h4>
                            <div className="mt-5">
                                <PlanEditor plan={plan.tier1} options={issueDefaults.tier1} tierColor="green" onUpdate={p => onUpdate(issueId, { ...plan, tier1: p })} />
                            </div>
                        </div>
                        <Tier2GroupManager
                            groups={plan.tier2Groups}
                            options={issueDefaults.tier2}
                            availableSchools={tieredSchools.tier2}
                            allSelectedIssues={allSelectedIssues}
                            onUpdate={g => onUpdate(issueId, { ...plan, tier2Groups: g })}
                        />
                        <Tier3PlanManager
                            planManager={plan.tier3}
                            options={issueDefaults.tier3}
                            availableSchools={tieredSchools.tier3}
                            onUpdate={pm => onUpdate(issueId, { ...plan, tier3: pm })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlanPrintLayout: React.FC<{ 
    plans: AllInterventionPlans; 
    issues: { id: string; title: string; }[]; 
    tieredSchools: TieredSchools;
    cardData?: InformationCard | null;
}> = ({ plans, issues, tieredSchools, cardData }) => {
    console.log('PlanPrintLayout - Debug info:', {
        plansCount: Object.keys(plans).length,
        issuesCount: issues.length,
        tieredSchools: tieredSchools ? 'exists' : 'null',
        cardData: cardData ? 'exists' : 'null'
    });
    
    const renderListComponent = (title: string, component: PlanComponent) => {
        const items = [...component.predefined, component.custom].filter(Boolean);
        if (items.length === 0) return null;
        return (
            <div className="mb-3 break-inside-avoid">
                <h5 className="font-bold text-gray-700 text-sm">{title}</h5>
                <ul className="list-disc list-inside pl-2 text-sm text-gray-800 space-y-1">
                    {items.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
        );
    };

    const renderPlan = (plan: TierPlan) => (
         <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {renderListComponent("מטרה מרכזית:", plan.mainGoal)}
            {renderListComponent("יעדים מדידים:", plan.measurableObjectives)}
            {renderListComponent("פעולות מרכזיות:", plan.mainActions)}
            {renderListComponent("תדירות ליווי:", plan.supportFrequency)}
            {renderListComponent("מדדי הצלחה:", plan.successMetrics)}
            {renderListComponent("שותפים:", plan.partners)}
        </div>
    );

    // Check if we have any plans to display
    if (!plans || Object.keys(plans).length === 0) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold text-gray-600 mb-4">לא נמצאו תוכניות התערבות</h2>
                <p className="text-gray-500">יש לבנות תוכנית התערבות לפחות עבור סוגייה אחת.</p>
            </div>
        );
    }
    
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


    const InformationCardDisplay: React.FC<{ card: InformationCard }> = ({ card }) => {
        console.log('InformationCardDisplay - card structure:', {
            title: card.title,
            supervisorSupportType: typeof card.supervisorSupport,
            supervisorSupportIsArray: Array.isArray(card.supervisorSupport),
            supervisorSupport: card.supervisorSupport
        });
        
        return (
        <div className="information-card-print card-section" style={{ pageBreakBefore: 'always' }}>
            <div className="p-8 border-4 border-gray-800 rounded-2xl bg-white">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6 pb-4 border-b-2 border-gray-200">{card.title}</h2>
                <div className="space-y-8">
                    <div className="p-4 bg-blue-50 border-r-4 border-blue-500 rounded-lg">
                        <h3 className="text-lg font-bold text-blue-800">תחום ליבה (מטרת המנהל/ת)</h3>
                        <p className="mt-1 text-gray-700">{card.coreDomain}</p>
                    </div>
                    <div className="p-4 bg-purple-50 border-r-4 border-purple-500 rounded-lg">
                        <h3 className="text-lg font-bold text-purple-800">עמדת המפקח/ת</h3>
                        <p className="mt-1 text-gray-700"><BoldingFormatter text={card.supervisorStance} /></p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2"><Check className="text-green-600" />פרקטיקות מוכחות להצלחת מנהלים</h3>
                            <ul className="space-y-3 text-gray-700">
                                {Array.isArray(card.provenPractices) 
                                    ? card.provenPractices.map((practice, i) => (
                                        <li key={i} className="flex items-start">
                                            <span className="text-green-600 font-bold mr-2 text-lg">{i + 1}.</span>
                                            <p><BoldingFormatter text={practice} /></p>
                                        </li>
                                    ))
                                    : <li><BoldingFormatter text={String(card.provenPractices || '')} /></li>
                                }
                            </ul>
                        </div>
                        <div>
                             <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2"><User className="text-indigo-600"/>תפקיד המפקח/ת בתמיכה במנהל/ת</h3>
                             <ul className="space-y-3 list-disc list-inside text-gray-700">
                                {Array.isArray(card.supervisorSupport) 
                                    ? card.supervisorSupport.map((role, i) => <li key={i}><BoldingFormatter text={role} /></li>)
                                    : card.supervisorSupport && typeof card.supervisorSupport === 'object'
                                    ? (
                                        <>
                                            {card.supervisorSupport.roles && Array.isArray(card.supervisorSupport.roles) && 
                                                card.supervisorSupport.roles.map((role, i) => <li key={`role-${i}`}><BoldingFormatter text={role} /></li>)
                                            }
                                            {card.supervisorSupport.activities && Array.isArray(card.supervisorSupport.activities) && 
                                                card.supervisorSupport.activities.map((activity, i) => <li key={`activity-${i}`}><BoldingFormatter text={activity} /></li>)
                                            }
                                        </>
                                    )
                                    : <li><BoldingFormatter text={String(card.supervisorSupport || '')} /></li>
                                }
                             </ul>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">יישום התמיכה במודל MTSS</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 border-2 border-dashed border-green-300 rounded-lg">
                                <h4 className="font-bold text-green-800 flex items-center gap-2"><Layers3 size={20}/>רובד 1 (אוניברסלי - לכלל המנהלים):</h4>
                                <p className="mt-1 text-sm text-gray-700">{card.mtssTiers.tier1}</p>
                            </div>
                             <div className="p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-lg">
                                <h4 className="font-bold text-amber-800 flex items-center gap-2"><Target size={20}/>רובד 2 (ממוקד - למנהל/ת הזקוק/ה לכך):</h4>
                                <p className="mt-1 text-sm text-gray-700">{card.mtssTiers.tier2}</p>
                            </div>
                             <div className="p-4 bg-red-50 border-2 border-dashed border-red-300 rounded-lg">
                                <h4 className="font-bold text-red-800 flex items-center gap-2"><ShieldAlert size={20}/>רובד 3 (אינטנסיבי - למנהל/ת יחיד/ה):</h4>
                                <p className="mt-1 text-sm text-gray-700">{card.mtssTiers.tier3}</p>
                            </div>
                        </div>
                    </div>


                    {/* שותפים פוטנציאליים */}
                    {card.potentialPartners && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">🤝 שותפים פוטנציאליים לליווי</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Array.isArray(card.potentialPartners) 
                                    ? card.potentialPartners.map((partner, i) => (
                                        <div key={i} className="p-2 bg-gray-100 border border-gray-300 rounded text-center text-sm text-gray-700">
                                            {partner}
                                        </div>
                                    ))
                                    : <div className="p-2 bg-gray-100 border border-gray-300 rounded text-center text-sm text-gray-700">
                                        {String(card.potentialPartners || '')}
                                      </div>
                                }
                            </div>
                        </div>
                    )}

                    {/* משאבים זמינים */}
                    {card.availableResources && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">💼 משאבים זמינים לליווי</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* תקציבי */}
                                {card.availableResources.budget && (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <h4 className="font-bold text-green-800 mb-2">💰 תקציבי</h4>
                                            <ul className="space-y-1 text-xs text-gray-700">
                                                {Array.isArray(card.availableResources.budget) 
                                                    ? card.availableResources.budget.map((item, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="text-green-600 mr-1">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))
                                                    : <li className="flex items-start">
                                                        <span className="text-green-600 mr-1">•</span>
                                                        <span>{String(card.availableResources.budget || '')}</span>
                                                      </li>
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                {/* זמן */}
                                {card.availableResources.time && (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h4 className="font-bold text-blue-800 mb-2">⏰ זמן</h4>
                                            <ul className="space-y-1 text-xs text-gray-700">
                                                {Array.isArray(card.availableResources.time) 
                                                    ? card.availableResources.time.map((item, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="text-blue-600 mr-1">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))
                                                    : <li className="flex items-start">
                                                        <span className="text-blue-600 mr-1">•</span>
                                                        <span>{String(card.availableResources.time || '')}</span>
                                                      </li>
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                {/* מומחיות */}
                                {card.availableResources.expertise && (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                            <h4 className="font-bold text-purple-800 mb-2">🎓 מומחיות</h4>
                                            <ul className="space-y-1 text-xs text-gray-700">
                                                {Array.isArray(card.availableResources.expertise) 
                                                    ? card.availableResources.expertise.map((item, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="text-purple-600 mr-1">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))
                                                    : <li className="flex items-start">
                                                        <span className="text-purple-600 mr-1">•</span>
                                                        <span>{String(card.availableResources.expertise || '')}</span>
                                                      </li>
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                {/* דיגיטלי */}
                                {card.availableResources.digital && (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                            <h4 className="font-bold text-orange-800 mb-2">💻 דיגיטלי</h4>
                                            <ul className="space-y-1 text-xs text-gray-700">
                                                {Array.isArray(card.availableResources.digital) 
                                                    ? card.availableResources.digital.map((item, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="text-orange-600 mr-1">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))
                                                    : <li className="flex items-start">
                                                        <span className="text-orange-600 mr-1">•</span>
                                                        <span>{String(card.availableResources.digital || '')}</span>
                                                      </li>
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                {/* תוכן */}
                                {card.availableResources.content && (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                                            <h4 className="font-bold text-teal-800 mb-2">📚 תוכן</h4>
                                            <ul className="space-y-1 text-xs text-gray-700">
                                                {Array.isArray(card.availableResources.content) 
                                                    ? card.availableResources.content.map((item, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="text-teal-600 mr-1">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))
                                                    : <li className="flex items-start">
                                                        <span className="text-teal-600 mr-1">•</span>
                                                        <span>{String(card.availableResources.content || '')}</span>
                                                      </li>
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                {/* אירועים */}
                                {card.availableResources.events && (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                            <h4 className="font-bold text-indigo-800 mb-2">🎪 אירועים</h4>
                                            <ul className="space-y-1 text-xs text-gray-700">
                                                {Array.isArray(card.availableResources.events) 
                                                    ? card.availableResources.events.map((item, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="text-indigo-600 mr-1">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))
                                                    : <li className="flex items-start">
                                                        <span className="text-indigo-600 mr-1">•</span>
                                                        <span>{String(card.availableResources.events || '')}</span>
                                                      </li>
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                {/* תמיכה נפשית */}
                                {card.availableResources.emotionalSupport && (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
                                            <h4 className="font-bold text-pink-800 mb-2">💝 תמיכה נפשית</h4>
                                            <ul className="space-y-1 text-xs text-gray-700">
                                                {Array.isArray(card.availableResources.emotionalSupport) 
                                                    ? card.availableResources.emotionalSupport.map((item, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="text-pink-600 mr-1">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))
                                                    : <li className="flex items-start">
                                                        <span className="text-pink-600 mr-1">•</span>
                                                        <span>{String(card.availableResources.emotionalSupport || '')}</span>
                                                      </li>
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                {/* חומרים */}
                                {card.availableResources.materials && (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <h4 className="font-bold text-gray-800 mb-2">📄 חומרים</h4>
                                            <ul className="space-y-1 text-xs text-gray-700">
                                                {Array.isArray(card.availableResources.materials) 
                                                    ? card.availableResources.materials.map((item, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="text-gray-600 mr-1">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))
                                                    : <li className="flex items-start">
                                                        <span className="text-gray-600 mr-1">•</span>
                                                        <span>{String(card.availableResources.materials || '')}</span>
                                                      </li>
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                {/* תוכניות */}
                                {card.availableResources.programs && (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <h4 className="font-bold text-yellow-800 mb-2">📋 תוכניות</h4>
                                            <ul className="space-y-1 text-xs text-gray-700">
                                                {Array.isArray(card.availableResources.programs) 
                                                    ? card.availableResources.programs.map((item, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="text-yellow-600 mr-1">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))
                                                    : <li className="flex items-start">
                                                        <span className="text-yellow-600 mr-1">•</span>
                                                        <span>{String(card.availableResources.programs || '')}</span>
                                                      </li>
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        );
    };

    return (
        <div className="plan-to-print bg-white font-sans" style={{ 
            width: '210mm', 
            minHeight: '297mm',
            padding: '20mm',
            margin: '0 auto',
            pageBreakInside: 'avoid'
        }}>
            <style jsx>{`
                @media print {
                    .plan-to-print {
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 20mm !important;
                        box-sizing: border-box;
                    }
                    .page-break-before {
                        page-break-before: always;
                    }
                    .page-break-after {
                        page-break-after: always;
                    }
                    .page-break-inside-avoid {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    .issue-section {
                        page-break-inside: avoid;
                        break-inside: avoid;
                        margin-bottom: 20px;
                    }
                    .tier-section {
                        page-break-inside: avoid;
                        break-inside: avoid;
                        margin-bottom: 15px;
                    }
                    .card-section {
                        page-break-before: always;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                }
            `}</style>
            <header className="text-center border-b-2 border-gray-800 pb-4 mb-6 page-break-inside-avoid">
                <h1 className="text-3xl font-extrabold text-gray-900">תוכנית התערבות מערכתית</h1>
                <p className="text-lg text-gray-600">מסמך מסכם</p>
            </header>
            {issues.map(issue => {
                const plan = plans[issue.id];
                if (!plan) return null;
                return (
                    <div key={issue.id} className="mb-8 issue-section">
                        <h2 className="text-2xl font-bold bg-gray-100 p-3 rounded-md text-blue-800 border-r-4 border-blue-500 page-break-inside-avoid">{issue.title}</h2>
                        <div className="p-4">
                            <div className="mb-4 page-break-inside-avoid">
                                <h3 className="text-lg font-semibold mb-2">גורמי שורש שנבחרו</h3>
                                <ul className="list-disc list-inside pl-4 text-gray-700">
                                    {plan.selectedRootCauses.map(cause => <li key={cause}>{cause}</li>)}
                                </ul>
                            </div>

                             {/* Tier 1 */}
                            <div className={`mt-4 p-3 border-l-4 border-green-500 bg-gray-50/50 rounded-r-lg tier-section`}>
                                <h4 className="text-xl font-bold text-gray-800">שכבה 1: אוניברסלית</h4>
                                <p className="text-xs text-gray-500 mb-2">({tieredSchools.tier1.length} בתי ספר)</p>
                                {renderPlan(plan.tier1)}
                            </div>

                            {/* Tier 2 */}
                             <div className={`mt-4 p-3 border-l-4 border-amber-500 bg-gray-50/50 rounded-r-lg tier-section`}>
                                <h4 className="text-xl font-bold text-gray-800">שכבה 2: תמיכה ממוקדת</h4>
                                {plan.tier2Groups.map(group => (
                                    <div key={group.id} className="mt-3 p-2 border-t border-amber-200 page-break-inside-avoid">
                                        <h5 className="font-bold text-amber-800">{group.name}</h5>
                                        <p className="text-xs text-gray-500 mb-2">({group.schoolIds.length} בתי ספר)</p>
                                        {renderPlan(group.plan)}
                                    </div>
                                ))}
                            </div>

                            {/* Tier 3 */}
                            <div className={`mt-4 p-3 border-l-4 border-red-500 bg-gray-50/50 rounded-r-lg tier-section`}>
                                <h4 className="text-xl font-bold text-gray-800">שכבה 3: התערבות אינטנסיבית</h4>
                                {plan.tier3.useGeneralPlan ? (
                                    <div className="page-break-inside-avoid">
                                        <p className="text-sm text-gray-600 font-semibold mb-2">תוכנית כללית לכל {tieredSchools.tier3.length} בתי הספר:</p>
                                        {renderPlan(plan.tier3.generalPlan)}
                                    </div>
                                ) : (
                                    Object.entries(plan.tier3.individualPlans).map(([schoolId, individualPlan]) => {
                                        const school = tieredSchools.tier3.find(s => s.id === parseInt(schoolId));
                                        return (
                                            <div key={schoolId} className="mt-3 p-2 border-t border-red-200 page-break-inside-avoid">
                                                <h5 className="font-bold text-red-800">{school?.name}</h5>
                                                {renderPlan(individualPlan)}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {cardData && <InformationCardDisplay card={cardData} />}
        </div>
    );
};


interface InterventionPlanBuilderProps {
    selectedIssues: Issue[];
    tieredSchools: TieredSchools;
    onPlanComplete: (plans: AllInterventionPlans) => void;
    onReset: () => void;
    onBack: () => void;
}

export const InterventionPlanBuilder: React.FC<InterventionPlanBuilderProps> = ({ selectedIssues, tieredSchools, onPlanComplete, onReset, onBack }) => {
    const [plans, setPlans] = useState<AllInterventionPlans>({});
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'select' | 'build' | 'review'>('select');
    const [selectedPlanIssueId, setSelectedPlanIssueId] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [hasAutoAdvanced, setHasAutoAdvanced] = useState(false);
    const printLayoutRef = useRef<HTMLDivElement>(null);
    
    const relevantPlanIssues = useMemo(() => {
        if (!selectedIssues) {
            return [];
        }
        return selectedIssues
            .map(issue => ({
                id: issue.id,
                title: interventionPlanData[issue.id]?.title || issue.name || `תוכנית ${issue.id}`
            }));
    }, [selectedIssues]);

    const initializePlans = useCallback(() => {
        const initialPlans: AllInterventionPlans = {};
        
        selectedIssues.forEach(issue => {
            initialPlans[issue.id] = createInitialPlanForIssue(issue);
        });
        setPlans(initialPlans);
    }, [selectedIssues]);

    useEffect(() => {
        initializePlans();
    }, [initializePlans]);
    
    useEffect(() => {
        if (relevantPlanIssues.length === 1 && currentView === 'select' && !hasAutoAdvanced) {
            const issueId = relevantPlanIssues[0].id;
            setSelectedPlanIssueId(issueId);
            setOpenAccordion(issueId);
            setCurrentView('build');
            setHasAutoAdvanced(true);
        }
    }, [relevantPlanIssues, currentView, hasAutoAdvanced]);

    const handleResetPlans = () => {
        if (window.confirm('האם אתה בטוח שברצונך לאפס את כל השינויים בתוכנית הנוכחית?')) {
            const issueId = selectedPlanIssueId;
            if (!issueId) return;
            const issue = selectedIssues.find(i => i.id === issueId);
            if(!issue) return;
            const resetPlan = createInitialPlanForIssue(issue);
            handlePlanUpdate(issueId, resetPlan);
        }
    };

    const handlePlanUpdate = (issueId: string, updatedPlan: AllInterventionPlans[string]) => {
        setPlans(prev => ({
            ...prev,
            [issueId]: updatedPlan,
        }));
    };
    
    const isComplete = useMemo(() => {
        // Check if we have at least one plan built
        return Object.keys(plans).length > 0;
    }, [plans]);

    const handleFinishAndCreatePlan = () => {
        console.log('handleFinishAndCreatePlan - Debug info:', {
            plansCount: Object.keys(plans).length,
            selectedPlanIssueId,
            relevantPlanIssues: relevantPlanIssues.length
        });
        
        // Ensure we have at least one plan before proceeding to review
        if (Object.keys(plans).length === 0) {
            alert('יש לבנות תוכנית התערבות לפחות עבור סוגייה אחת לפני המעבר לביקורת.');
            return;
        }
        
        // If no specific issue is selected, select the first available issue for review
        if (!selectedPlanIssueId && relevantPlanIssues.length > 0) {
            setSelectedPlanIssueId(relevantPlanIssues[0].id);
        }
        
        setCurrentView('review');
    };

    const handlePrint = () => {
        const printableElement = printLayoutRef.current;
        if (!printableElement) return alert('שגיאה: לא ניתן למצוא תוכן להדפסה.');
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>הדפסת תוכנית</title>');
            printWindow.document.write('<link href="https://cdn.tailwindcss.com" rel="stylesheet">');
            printWindow.document.write('<style>body { font-family: Heebo, sans-serif; direction: rtl; } @page { size: A4; margin: 15mm; } .plan-to-print { box-shadow: none !important; border: none !important; } .break-inside-avoid { page-break-inside: avoid; } .information-card-print { page-break-before: always; } </style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(printableElement.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    };
    
    const handleDownloadWord = async () => {
        try {
            // Create mapping from issue IDs to information card IDs
            const issueToCardMapping: { [key: string]: string } = {
                // יסודות אסטרטגיים וניהול
                'strategic_foundations': 'strategic_foundations',
                'vision_creation': 'vision_creation',
                'work_plan_building': 'work_plan_building',
                'management_team_development': 'management_team_development',
                'strategic_resource_management': 'strategic_resource_management',
                'effective_routines': 'effective_routines',
                
                // איכות הוראה ולמידה
                'teaching_learning_quality': 'teaching_learning_quality',
                'staff_development': 'staff_development',
                'climate_and_wellbeing': 'climate_and_wellbeing',
                'community_partnerships': 'community_partnerships_extended',
                'evaluation_and_control': 'evaluation_and_control',
                'pedagogical_innovation': 'pedagogical_innovation',
                
                // פיתוח צוות ומנהיגות
                'empower_middle_leadership': 'management_team_development',
                'data_driven_culture': 'data_based_evaluation',
                'teacher_onboarding_retention': 'staff_commitment_capability',
                'plc_culture': 'staff_learning_professionalism',
                'staff_resilience': 'staff_resilience',
                'staff_gap_bridging': 'staff_gap_bridging',
                
                // אקלים בית-ספרי ותמיכה בתלמידים
                'risk_behavior_management': 'safety_and_belonging',
                'student_support_system': 'safety_and_belonging',
                'closing_learning_gaps': 'work_plan_building',
                'excellence_and_gifted_students': 'effective_routines',
                'promoting_hots': 'work_plan_building',
                'inclusion_equity': 'inclusion_equity',
                'student_agency': 'student_agency',

                // חדשנות פדגוגית וטכנולוגיה
                'edtech_integration': 'effective_routines',
                'disciplinary_literacy': 'disciplinary_literacy',
                'test_anxiety_management': 'test_anxiety_management',
                'formative_assessment_culture': 'formative_assessment_culture',
                'culturally_responsive_teaching': 'culturally_responsive_teaching',

                // שותפויות וקהילה
                'informal_education_expansion': 'parent_community_partnership',
                'parental_support_tools': 'parent_community_partnership',
                'school_as_community_anchor': 'parent_community_partnership',
                'digital_citizenship': 'parent_community_partnership',

                // ניהול שינוי ותקשורת
                'change_management': 'vision_creation',
                'internal_communication': 'effective_routines',

                // סוגיות נוספות
                'pedagogy_management': 'work_plan_building',
                'pedagogical_innovation_flexibility': 'pedagogical_innovation',
                'staff_development_leadership': 'management_team_development',
                'staff_wellbeing_stability': 'staff_commitment_capability',
                'climate_improvement': 'climate_and_wellbeing',

                // משאבי ליווי למנהלים
                'supervisor_resources_implementation': 'supervisor_resources_implementation',

                // הוראה דיפרנציאלית
                'differentiated_instruction': 'differentiated_instruction'
            };
            
            // Get current data from the review view
            const issueForPrint = selectedPlanIssueId 
                ? relevantPlanIssues.filter(p => p.id === selectedPlanIssueId)
                : relevantPlanIssues;
            
            const cardDataForPrint = selectedPlanIssueId && issueToCardMapping[selectedPlanIssueId] 
                ? informationCardsData[issueToCardMapping[selectedPlanIssueId]] 
                : (issueForPrint.length > 0 && issueToCardMapping[issueForPrint[0].id])
                ? informationCardsData[issueToCardMapping[issueForPrint[0].id]]
                : null;
            
            // Create HTML content for Word export
            console.log('Word export - Debug info:', {
                issueForPrint: issueForPrint.length,
                cardDataForPrint: cardDataForPrint ? 'exists' : 'null',
                plans: Object.keys(plans).length,
                tieredSchools: tieredSchools ? 'exists' : 'null',
                firstPlan: issueForPrint.length > 0 ? plans[issueForPrint[0].id] : null
            });
            
            const htmlContent = `
                <!DOCTYPE html>
                <html dir="rtl" lang="he">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>תוכנית התערבות מערכתית</title>
                    <style>
                        body { 
                            font-family: 'Arial', 'David', sans-serif; 
                            direction: rtl; 
                            text-align: right; 
                            line-height: 1.6;
                            margin: 20px;
                        }
                        .header { 
                            text-align: center; 
                            border-bottom: 2px solid #333; 
                            padding-bottom: 20px; 
                            margin-bottom: 30px; 
                        }
                        .issue-section { 
                            margin-bottom: 30px; 
                            page-break-inside: avoid; 
                        }
                        .tier-section { 
                            margin: 15px 0; 
                            padding: 15px; 
                            border-right: 4px solid #ccc; 
                            background-color: #f9f9f9; 
                            page-break-inside: avoid; 
                        }
                        .tier-1 { border-right-color: #10b981; }
                        .tier-2 { border-right-color: #f59e0b; }
                        .tier-3 { border-right-color: #ef4444; }
                        .card-section { 
                            page-break-before: always; 
                            margin-top: 40px; 
                        }
                        h1 { font-size: 28px; font-weight: bold; color: #1f2937; }
                        h2 { font-size: 24px; font-weight: bold; color: #1e40af; background-color: #f3f4f6; padding: 10px; border-radius: 5px; }
                        h3 { font-size: 20px; font-weight: bold; color: #374151; }
                        h4 { font-size: 18px; font-weight: bold; color: #4b5563; }
                        h5 { font-size: 16px; font-weight: bold; color: #6b7280; }
                        ul { margin: 10px 0; padding-right: 20px; }
                        li { margin: 5px 0; }
                        .bold { font-weight: bold; }
                        .highlight { background-color: #fef3c7; padding: 2px 4px; border-radius: 3px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>תוכנית התערבות מערכתית</h1>
                        <p>מסמך מסכם</p>
                    </div>
                    ${issueForPrint.map(issue => {
                        const plan = plans[issue.id];
                        if (!plan) return '';
                        return `
                            <div class="issue-section">
                                <h2>${issue.title}</h2>
                                <div>
                                    <h3>גורמי שורש שנבחרו</h3>
                                    <ul>
                                        ${plan.selectedRootCauses.map(cause => `<li>${cause}</li>`).join('')}
                                    </ul>
                                    
                                    <div class="tier-section tier-1">
                                        <h4>שכבה 1: אוניברסלית (${tieredSchools.tier1.length} בתי ספר)</h4>
                                        ${renderPlanForWord(plan.tier1)}
                                    </div>
                                    
                                    <div class="tier-section tier-2">
                                        <h4>שכבה 2: תמיכה ממוקדת</h4>
                                        ${plan.tier2Groups.map(group => `
                                            <div style="margin: 10px 0; padding: 10px; border-top: 1px solid #f59e0b;">
                                                <h5>${group.name} (${group.schoolIds.length} בתי ספר)</h5>
                                                ${renderPlanForWord(group.plan)}
                                            </div>
                                        `).join('')}
                                    </div>
                                    
                                    <div class="tier-section tier-3">
                                        <h4>שכבה 3: התערבות אינטנסיבית</h4>
                                        ${plan.tier3.useGeneralPlan ? `
                                            <div>
                                                <p><strong>תוכנית כללית לכל ${tieredSchools.tier3.length} בתי הספר:</strong></p>
                                                ${renderPlanForWord(plan.tier3.generalPlan)}
                                            </div>
                                        ` : Object.entries(plan.tier3.individualPlans).map(([schoolId, individualPlan]) => {
                                            const school = tieredSchools.tier3.find(s => s.id === parseInt(schoolId));
                                            return `
                                                <div style="margin: 10px 0; padding: 10px; border-top: 1px solid #ef4444;">
                                                    <h5>${school?.name || `בית ספר ${schoolId}`}</h5>
                                                    ${renderPlanForWord(individualPlan)}
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    
                    ${cardDataForPrint ? `
                        <div class="card-section">
                            <h2>${cardDataForPrint.title}</h2>
                            <div>
                                <div style="background-color: #dbeafe; padding: 15px; border-right: 4px solid #3b82f6; border-radius: 5px; margin: 15px 0;">
                                    <h3>תחום ליבה (מטרת המנהל/ת)</h3>
                                    <p>${cardDataForPrint.coreDomain}</p>
                                </div>
                                
                                <div style="background-color: #f3e8ff; padding: 15px; border-right: 4px solid #8b5cf6; border-radius: 5px; margin: 15px 0;">
                                    <h3>עמדת המפקח/ת</h3>
                                    <p>${cardDataForPrint.supervisorStance}</p>
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                                    <div>
                                        <h3>פרקטיקות מוכחות להצלחת מנהלים</h3>
                                        <ul>
                                            ${Array.isArray(cardDataForPrint.provenPractices) 
                                                ? cardDataForPrint.provenPractices.map((practice, i) => `<li><strong>${i + 1}.</strong> ${practice}</li>`).join('')
                                                : `<li>${String(cardDataForPrint.provenPractices || '')}</li>`
                                            }
                                        </ul>
                                    </div>
                                    <div>
                                        <h3>תפקיד המפקח/ת בתמיכה במנהל/ת</h3>
                                        <ul>
                                            ${Array.isArray(cardDataForPrint.supervisorSupport) 
                                                ? cardDataForPrint.supervisorSupport.map(role => `<li>${role}</li>`).join('')
                                                : cardDataForPrint.supervisorSupport && typeof cardDataForPrint.supervisorSupport === 'object'
                                                ? [
                                                    ...((cardDataForPrint.supervisorSupport as any).roles || []),
                                                    ...((cardDataForPrint.supervisorSupport as any).activities || [])
                                                  ].map(item => `<li>${item}</li>`).join('')
                                                : `<li>${String(cardDataForPrint.supervisorSupport || '')}</li>`
                                            }
                                        </ul>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3>יישום התמיכה במודל MTSS</h3>
                                    <div style="background-color: #dcfce7; padding: 15px; border: 2px dashed #10b981; border-radius: 5px; margin: 10px 0;">
                                        <h4>רמה 1 (אוניברסלית)</h4>
                                        <p>${cardDataForPrint.mtssTiers.tier1}</p>
                                    </div>
                                    <div style="background-color: #fef3c7; padding: 15px; border: 2px dashed #f59e0b; border-radius: 5px; margin: 10px 0;">
                                        <h4>רמה 2 (ממוקדת)</h4>
                                        <p>${cardDataForPrint.mtssTiers.tier2}</p>
                                    </div>
                                    <div style="background-color: #fee2e2; padding: 15px; border: 2px dashed #ef4444; border-radius: 5px; margin: 10px 0;">
                                        <h4>רמה 3 (אינטנסיבית)</h4>
                                        <p>${cardDataForPrint.mtssTiers.tier3}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </body>
                </html>
            `;
            
            // Create blob and download
            const blob = new Blob([htmlContent], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `תוכנית_התערבות_מערכתית_${new Date().toLocaleDateString('he-IL')}.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading Word document:', error);
            alert('שגיאה בהורדת הקובץ. נסי שוב.');
        }
    };

    const renderPlanForWord = (plan: TierPlan) => {
        console.log('renderPlanForWord - plan structure:', {
            mainGoal: plan.mainGoal,
            measurableObjectives: plan.measurableObjectives,
            mainActions: plan.mainActions,
            supportFrequency: plan.supportFrequency,
            successMetrics: plan.successMetrics,
            partners: plan.partners
        });
        
        const renderComponent = (title: string, component: PlanComponent) => {
            if (!component) return '';
            const items = [...(component.predefined || []), component.custom].filter(Boolean);
            if (items.length === 0) return '';
            return `
                <div style="margin: 10px 0;">
                    <h5>${title}</h5>
                    <ul>
                        ${items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        };

        return `
            ${renderComponent('מטרה מרכזית', plan.mainGoal)}
            ${renderComponent('יעדים מדידים', plan.measurableObjectives)}
            ${renderComponent('פעולות מרכזיות', plan.mainActions)}
            ${renderComponent('תדירות ליווי', plan.supportFrequency)}
            ${renderComponent('מדדי הצלחה', plan.successMetrics)}
            ${renderComponent('שותפים', plan.partners)}
        `;
    };
    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true);
        const element = printLayoutRef.current;
        if (!element || typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            alert('שגיאה בייצוא PDF. ודא שכל הספריות נטענו.');
            setIsGeneratingPdf(false);
            return;
        }

        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps= pdf.getImageProperties(imgData);
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

            pdf.save(`תוכנית-התערבות-${selectedIssues[0]?.name || 'כללי'}.pdf`);
        } catch (error) {
            console.error('PDF export failed:', error);
            alert(`שגיאה בייצוא ל-PDF: ${(error as Error).message}`);
        } finally {
            setIsGeneratingPdf(false);
        }
    };
   
    const selectedIssueForPlan = relevantPlanIssues.find(p => p.id === selectedPlanIssueId);

    if (currentView === 'review') {
        const issueForPrint = selectedPlanIssueId 
            ? relevantPlanIssues.filter(p => p.id === selectedPlanIssueId)
            : relevantPlanIssues;
            
        console.log('Review view - Debug info:', {
            selectedPlanIssueId,
            relevantPlanIssues: relevantPlanIssues.length,
            plans: Object.keys(plans).length,
            issueForPrint: issueForPrint.length
        });
        
        // Create mapping from issue IDs to information card IDs
        const issueToCardMapping: { [key: string]: string } = {
            // יסודות אסטרטגיים וניהול
            'strategic_foundations': 'strategic_foundations',
            'vision_creation': 'vision_creation',
            'work_plan_building': 'work_plan_building',
            'management_team_development': 'management_team_development',
            'strategic_resource_management': 'strategic_resource_management',
            'effective_routines': 'effective_routines',
            
            // איכות הוראה ולמידה
            'teaching_learning_quality': 'teaching_learning_quality',
            'staff_development': 'staff_development',
            'climate_and_wellbeing': 'climate_and_wellbeing',
            'community_partnerships': 'community_partnerships_extended',
            'evaluation_and_control': 'evaluation_and_control',
            'pedagogical_innovation': 'pedagogical_innovation',
            
            // פיתוח צוות ומנהיגות
            'empower_middle_leadership': 'management_team_development',
            'data_driven_culture': 'data_based_evaluation',
            'teacher_onboarding_retention': 'staff_commitment_capability',
            'plc_culture': 'staff_learning_professionalism',
            'staff_resilience': 'staff_resilience',
            'staff_gap_bridging': 'staff_gap_bridging',
            
            // אקלים בית-ספרי ותמיכה בתלמידים
            'risk_behavior_management': 'safety_and_belonging',
            'student_support_system': 'safety_and_belonging',
            'closing_learning_gaps': 'work_plan_building',
            'excellence_and_gifted_students': 'effective_routines',
            'promoting_hots': 'work_plan_building',
            'inclusion_equity': 'inclusion_equity',
            'student_agency': 'student_agency',
            
            // חדשנות פדגוגית וטכנולוגיה
            'edtech_integration': 'effective_routines',
            'disciplinary_literacy': 'disciplinary_literacy',
            'test_anxiety_management': 'test_anxiety_management',
            'formative_assessment_culture': 'formative_assessment_culture',
            'culturally_responsive_teaching': 'culturally_responsive_teaching',
            
            // שותפויות וקהילה
            'informal_education_expansion': 'parent_community_partnership',
            'parental_support_tools': 'parent_community_partnership',
            'school_as_community_anchor': 'parent_community_partnership',
            'digital_citizenship': 'parent_community_partnership',
            
            // ניהול שינוי ותקשורת
            'change_management': 'vision_creation',
            'internal_communication': 'effective_routines',
            
            // סוגיות נוספות
            'pedagogy_management': 'work_plan_building',
            'pedagogical_innovation_flexibility': 'pedagogical_innovation',
            'staff_development_leadership': 'management_team_development',
            'staff_wellbeing_stability': 'staff_commitment_capability',
            'climate_improvement': 'climate_and_wellbeing',
            
            // משאבי ליווי למנהלים
            'supervisor_resources_implementation': 'supervisor_resources_implementation',
            
            // הוראה דיפרנציאלית
            'differentiated_instruction': 'differentiated_instruction'
        };
        
        const cardDataForPrint = selectedPlanIssueId && issueToCardMapping[selectedPlanIssueId] 
            ? informationCardsData[issueToCardMapping[selectedPlanIssueId]] 
            : (issueForPrint.length > 0 && issueToCardMapping[issueForPrint[0].id])
            ? informationCardsData[issueToCardMapping[issueForPrint[0].id]]
            : null;

        return (
            <div className="bg-gray-50 p-8 rounded-lg">
                <header className="text-center mb-8 no-print">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">תוכנית ההתערבות המערכתית</h1>
                    <p className="text-gray-500 mt-2 text-lg max-w-3xl mx-auto">
                        להלן התוכנית שנוצרה וכרטיס המידע המקצועי. ניתן לחזור לעריכה, להדפיס, להוריד כ-PDF, או להתחיל מחדש.
                    </p>
                </header>
                
                {issueForPrint.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-lg border max-w-4xl mx-auto p-8 text-center">
                        <h2 className="text-xl font-semibold text-gray-600 mb-4">לא נמצאו תוכניות התערבות</h2>
                        <p className="text-gray-500">יש לחזור לעריכה ולבנות תוכנית התערבות לפחות עבור סוגייה אחת.</p>
                        <button 
                            onClick={() => setCurrentView('build')} 
                            className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            חזרה לעריכה
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="absolute left-[-9999px] top-auto -z-10" aria-hidden="true">
                            <div ref={printLayoutRef}>
                                <PlanPrintLayout plans={plans} issues={issueForPrint} tieredSchools={tieredSchools} cardData={cardDataForPrint} />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg border max-w-4xl mx-auto">
                           <PlanPrintLayout plans={plans} issues={issueForPrint} tieredSchools={tieredSchools} cardData={cardDataForPrint} />
                        </div>
                    </>
                )}
                 <div className="flex flex-wrap gap-4 justify-between items-center mt-12 border-t border-gray-200 pt-6 no-print">
                    <button type="button" onClick={() => setCurrentView('build')} className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors">
                        <ArrowRight size={18} /> חזרה לעריכה
                    </button>
                    <div className="flex-grow flex justify-center gap-3">
                        <button type="button" onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"><Printer size={16} /> הדפסה</button>
                        <button type="button" onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition disabled:bg-gray-400">
                            {isGeneratingPdf ? <><Loader className="animate-spin" size={16}/>מעבד...</> : <><Download size={16} /> הורדה (PDF)</>}
                        </button>
                        <button type="button" onClick={handleDownloadWord} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">
                            <Download size={16} /> הורדה (Word)
                        </button>
                    </div>
                    <button type="button" onClick={onReset} className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition">
                        <RotateCcw size={18} /> התחל מחדש
                    </button>
                </div>
            </div>
        );
    }

    if (currentView === 'build' && selectedIssueForPlan) {
        return (
            <div className="bg-gray-50/50 p-8 rounded-lg">
                <header className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">בניית תוכנית התערבות</h1>
                    <p className="text-gray-500 mt-2 text-lg max-w-3xl mx-auto">נסח/י תוכנית התערבות מפורטת לכל שכבת MTSS עבור הסוגיה שנבחרה.</p>
                </header>
                 <div className="space-y-6">
                    <IssueAccordionItem
                        key={selectedIssueForPlan.id}
                        issueId={selectedIssueForPlan.id}
                        title={selectedIssueForPlan.title}
                        plan={plans[selectedIssueForPlan.id]}
                        tieredSchools={tieredSchools}
                        allSelectedIssues={selectedIssues}
                        onUpdate={handlePlanUpdate}
                        isOpen={openAccordion === selectedIssueForPlan.id}
                        onToggle={() => setOpenAccordion(prev => prev === selectedIssueForPlan.id ? null : selectedIssueForPlan.id)}
                    />
                </div>
                <div className="flex flex-wrap gap-4 justify-center items-center mt-12 border-t border-gray-200 pt-6">
                    <button onClick={() => { setCurrentView('select'); setSelectedPlanIssueId(null); }} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-200 border border-slate-200 transition-colors">
                        <ArrowRight size={18} />
                        <span>חזרה לבחירת סוגיה</span>
                    </button>
                    <button type="button" onClick={handleResetPlans} className="flex items-center gap-2 px-6 py-3 bg-amber-400 text-white font-semibold rounded-lg shadow-md hover:bg-amber-500 transition">
                        <RotateCcw size={18} />
                        <span>אפס תוכנית</span>
                    </button>
                    <button onClick={handleFinishAndCreatePlan} disabled={!isComplete} className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-emerald-600 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none">
                        <span>סיים וצור תוכנית</span>
                        <Send size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50/50 p-8 rounded-lg">
             <header className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">שלב אחרון: בחירת סוגיה לבניית תוכנית</h1>
                <p className="text-gray-500 mt-2 text-lg max-w-3xl mx-auto">בהתבסס על תחומי ההתמקדות שבחרת, זוהו מספר סוגיות אפשריות להתערבות.</p>
            </header>
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-8 flex items-center gap-3 max-w-3xl mx-auto">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div><p className="font-semibold">בחר/י סוגיה אחת לבניית תוכנית התערבות מפורטת. מומלץ להתמקד בסוגיה אחת בכל פעם.</p></div>
            </div>
            <div className="space-y-4 max-w-3xl mx-auto">
                {relevantPlanIssues.length > 0 ? (
                    relevantPlanIssues.map(issue => (
                        <label key={issue.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selectedPlanIssueId === issue.id ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                            <input
                                type="radio"
                                name="plan-issue-selection"
                                value={issue.id}
                                checked={selectedPlanIssueId === issue.id}
                                onChange={() => setSelectedPlanIssueId(issue.id)}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="mr-3 font-bold text-lg text-gray-800">{issue.title}</span>
                        </label>
                    ))
                ) : (
                     <div className="text-center p-12 bg-white rounded-lg border border-dashed">
                        <h2 className="text-xl font-semibold text-gray-700">לא זוהו סוגיות רלוונטיות</h2>
                        <p className="text-gray-500 mt-2">בהתבסס על תחומי ההתמקדות שנבחרו, לא נמצאו תוכניות התערבות מתאימות. יש לחזור אחורה ולבחור תחומים אחרים.</p>
                    </div>
                )}
            </div>
             <div className="flex justify-between items-center mt-12 border-t border-gray-200 pt-6 max-w-3xl mx-auto">
                 <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors">
                    <ArrowRight size={18} /> חזרה להגדרת מטרות
                </button>
                 <button onClick={() => { if (selectedPlanIssueId) { setOpenAccordion(selectedPlanIssueId); setCurrentView('build'); } }} disabled={!selectedPlanIssueId} className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none">
                    המשך לבניית תוכנית
                    <ArrowLeft size={20} />
                </button>
            </div>
        </div>
    );
};