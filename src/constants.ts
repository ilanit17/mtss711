import React from 'react';
import { Score, School } from "./types";
import { issuesAndGoalsData } from './data/issuesAndGoalsData';
import { Briefcase, BookOpen, HeartHandshake, Puzzle, Users, CheckCircle, BrainCircuit } from 'lucide-react';


// Base64 encoded Assistant font for Hebrew support in PDFs.
const HEBREW_FONT_REGULAR_BASE64 = 'AAEAAAARAQAABAAQR0RFRgQsBFIAAAbIAAAAHkdQT1O4B5LPAAAGJAAAAEhHU1VCAu4g6QAAAkQAAABIT1MvMmuG8wQAAAEoAAAAYGNtYXAAMQDXAAABxAAAAHxnYXNwAAAAEAAAAbgAAAAIZ2x5ZuAA1xIAAAqMAAAGHGhlYWQGUCyLAAAA4AAAADZoaGVhA+IB6QAAALwAAAAkaG10eBv2C0QAAAHgAAAAQmxvY2EAKAESAAACUAAAACBtYXhwABMAHwAAARgAAAAgbmFtZWVjixIAAAXQAAAAeXBvc3QAAwAAAAAABoAAAAEACgAoAAMABQALAAUACwABAAMPABQACQAGAAMAAQACAAAAAgAAAAAAAAABAAAAAwBwACwAAAAAAAgAAAABAAEAAgAWAAEAAgAWAAEACAAWAAEACQAWAAYACQAWAAkACQAWAAkACQAWAAkABgAaAAYACQAAAAEACAACAAYADgAJAA4ACQAOAAkADgAGAAYABgAGAAQACAAOAAkACgAJAAkACQAGAAYABgAKAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYACQAJAAkACQAKAAsACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAoABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAJAAkACQAJAAkACgABgAGAAYABgAJAAoABgAGAAYACQAJAAkACQAJAAoABgAGAAYACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAOAA4ACQAJAAkACQAJAA4ACQAJAAoABgAGAAYACQAJAAoABgAJAAoABgAGAAYACQAJAAkACQAGAAYACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAAAABAABm729eXw889QADAgAAAAADDdXdAAAAAAN0pT0AAAAAA4Y5Q==';
const HEBREW_FONT_BOLD_BASE64 = 'AAEAAAARAQAABAAQR0RFRgQsBFIAAAbYAAAAHkdQT1O4B5LPAAAGKAAAAEhHU1VCAu4g6QAAAkQAAABIT1MvMmuG8wQAAAEoAAAAYGNtYXAAMQDXAAABxAAAAHxnYXNwAAAAEAAAAbgAAAAIZ2x5ZuAA1xIAAAqYAAAGHGhlYWQGUCyLAAAA4AAAADZoaGVhA+IB6QAAALwAAAAkaG10eBv2C0QAAAHgAAAAQmxvY2EAKAESAAACUAAAACBtYXhwABMAHwAAARgAAAAgbmFtZWVjixIAAAXAAAAAeXBvc3QAAwAAAAAABoAAAAEACgAoAAMABQALAAUACwABAAMPABQACQAGAAMAAQACAAAAAgAAAAAAAAABAAAAAwBwACwAAAAAAAgAAAABAAEAAgAWAAEAAgAWAAEACAAWAAEACQAWAAYACQAWAAkACQAWAAkACQAWAAkABgAaAAYACQAAAAEACAACAAYADgAJAA4ACQAOAAkADgAGAAYABgAGAAQACAAOAAkACgAJAAkACQAGAAYABgAKAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYACQAJAAkACQAKAAsACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAoABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAJAAkACQAJAAkACgABgAGAAYABgAJAAoABgAGAAYACQAJAAkACQAJAAoABgAGAAYACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAOAA4ACQAJAAkACQAJAA4ACQAJAAoABgAGAAYACQAJAAoABgAJAAoABgAGAAYACQAJAAkACQAGAAYACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAAAABAABm729eXw889QADAgAAAAADDdXdAAAAAAN0pT0AAAAAA4YF5Q==';
export const HEBREW_FONTS = {
  REGULAR: {
    fileName: 'Assistant-Regular.ttf',
    data: HEBREW_FONT_REGULAR_BASE64,
  },
  BOLD: {
    fileName: 'Assistant-Bold.ttf',
    data: HEBREW_FONT_BOLD_BASE64,
  },
};

export const ALL_SCORE_FIELDS: (keyof import('./types').School)[] = [
    'vision_clearAndAgreedScore', 'vision_educationalConceptTranslatedScore', 'vision_resourcesAndEdgesScore', 'vision_strategicPlanningScore', 'vision_measurableGoalsScore', 'vision_communityPartnershipScore',
    'workPlan_needsBasedScore', 'workPlan_clearGoalsAndMetricsScore', 'workPlan_systematicMonitoringScore',
    'managementTeam_teamworkBasedScore', 'managementTeam_clearRolesScore', 'managementTeam_middleLeadershipInvolvedScore', 'managementTeam_roleHoldersCoachingScore', 'managementTeam_dataBasedDecisionsScore', 'managementTeam_teacherCollaborationScore',
    'routines_adaptedTimetableScore', 'routines_orderlyMeetingRoutinesScore', 'routines_decisionMakingProcessesScore',
    'resources_systematicAllocationScore', 'resources_resourceUtilizationTrackingScore', 'resources_controlAndImprovementScore',
    'staffCommitment_teamEngagementScore', 'staffCommitment_highSenseOfCapabilityScore', 'staffCommitment_highExpectationsScore',
    'staffLearning_adaptedProfessionalDevelopmentScore', 'staffLearning_connectingDevelopmentToPracticeScore', 'staffLearning_subjectAreaTrainingScore', 'staffLearning_peerLearningCultureScore', 'staffLearning_innovativeInitiativesScore', 'staffLearning_highExpectationsOfAchievementsScore',
    'staffWellbeing_teachersReceiveSupportScore', 'staffWellbeing_structuredOnboardingProcessesScore', 'staffWellbeing_wellbeingAndResilienceSupportScore', 'staffWellbeing_cohesionBuildingActivitiesScore', 'staffWellbeing_highStaffStabilityScore', 'staffWellbeing_highSatisfactionScore',
    'climateMapping_climateDataAnalysisScore', 'climateMapping_monitoringAndEvaluationRoutinesScore', 'climateMapping_detectionAndTreatmentMechanismsScore',
    'climateSafety_proceduresAndRulesEnforcedScore', 'climateSafety_safetyReinforcementProgramsScore', 'climateSafety_socialActivitiesScore', 'climateSafety_fewViolenceIncidentsScore', 'climateSafety_recognitionAndAppreciationCultureScore',
    'climateRelationships_personalSocialEmotionalDialogueScore', 'climateRelationships_familiarityAndPersonalConnectionScore', 'climateRelationships_teacherToolsAndCoachingScore', 'climateRelationships_optimalSocialAtmosphereScore',
    'sel_lifeSkillsProgramScore', 'sel_parentalConnectionScore', 'sel_diverseSupportOptionsScore',
    'language_adequateReadingComprehensionScore', 'language_developedWritingSkillsScore', 'language_broadVocabularyScore', 'language_clearOralExpressionScore', 'language_establishedReadingCultureScore', 'language_differentiatedResponseScore',
    'math_basicSkillsMasteryScore', 'math_effectiveStrategiesScore', 'math_optimalAnxietyCopingScore', 'math_useOfVisualAidsScore', 'math_sufficientDifferentiationScore', 'math_linkToDailyLifeScore',
    'english_studentsConfidentInUseScore', 'english_exposureOutsideClassScore', 'english_adaptedTeachingMethodsScore', 'english_useOfTechnologicalToolsScore', 'english_groupSizeAllowsGrowthScore', 'english_useOfAuthenticMaterialsScore',
    'science_sufficientLabEquipmentScore', 'science_developedInquirySkillsScore', 'science_practicalExperiencesScore', 'science_developedScientificThinkingScore', 'science_updatedCurriculumScore', 'science_linkToEnvironmentAndCommunityScore',
    'pedagogyPlanning_knowledgeAndSkillsMappingScore', 'pedagogyPlanning_findingsTranslatedScore', 'pedagogyPlanning_effectivenessReviewScore', 'pedagogyPlanning_literacyPromotionEffortsScore', 'pedagogyPlanning_entrepreneurshipAndInnovationCultureScore',
    'pedagogyPractices_lessonsIncludeVarietyScore', 'pedagogyPractices_diverseLearningMethodsScore', 'pedagogyPractices_useOfDigitalToolsScore', 'pedagogyPractices_differentiatedTeachingScore', 'pedagogyPractices_teachingPromotesThinkingScore', 'pedagogyPractices_teachingLearningSkillsScore',
    'pedagogyFeedback_managedEvaluationProcessesScore', 'pedagogyFeedback_teachersHaveKnowledgeAndSkillsScore', 'pedagogyFeedback_feedbackAndReflectionProcessesScore', 'pedagogyFeedback_evaluationCriteriaScore',
    'pedagogyFlexibility_flexibleLearningOrganizationScore', 'pedagogyFlexibility_focusedCurriculumScore', 'pedagogyFlexibility_teachersHaveInterdisciplinaryKnowledgeScore',
    'pedagogyCollaboration_jointPlanningRoutinesScore', 'pedagogyCollaboration_adaptedPracticesScore', 'pedagogyCollaboration_jointExaminationScore', 'pedagogyCollaboration_openDialogueForImprovementScore', 'pedagogyCollaboration_opennessToLearningScore', 'pedagogyCollaboration_beliefInAbilitiesScore',
    'communityContinuum_enrichmentProgramsOfferedScore', 'communityContinuum_tripsConnectedToCurriculumScore', 'communityContinuum_diverseEducationalFrameworksScore',
    'communitySocial_socialEducationIsAdaptedScore', 'communitySocial_teachersHaveKnowledgeAndToolsScore', 'communitySocial_teachingAssistantsPotentialRealizedScore',
    'communityLeisure_collaborationsWithOrganizationsScore', 'communityLeisure_encouragementAndGuidanceForParticipationScore', 'communityLeisure_wideRangeOfActivitiesScore',
    'communityPartnerships_parentParticipationInMeetingsScore', 'communityPartnerships_continuousCommunicationToFamiliesScore', 'communityPartnerships_parentsInvolvedInActivitiesScore', 'communityPartnerships_parentsHaveToolsToSupportScore', 'communityPartnerships_effectiveDialogueWithAuthorityScore', 'communityPartnerships_externalResourcesUtilizedScore'
];


export const FIELD_HEBREW_MAP: { [key: string]: string } = {
    'vision_clearAndAgreedScore': 'חזון ברור - החזון ברור ומוסכם',
    'vision_educationalConceptTranslatedScore': 'חזון ברור - התפיסה החינוכית מתורגמת',
    'vision_resourcesAndEdgesScore': 'חזון ברור - משאבים וקצו',
    'vision_strategicPlanningScore': 'חזון ברור - תכנון אסטרטגי',
    'vision_measurableGoalsScore': 'חזון ברור - היעדים מדידים',
    'vision_communityPartnershipScore': 'חזון ברור - הקהילה שותפה',
    'workPlan_needsBasedScore': 'תוכנית עבודה - מבוססת על מיפוי צרכים',
    'workPlan_clearGoalsAndMetricsScore': 'תוכנית עבודה - יעדים ומדדים ברורים',
    'workPlan_systematicMonitoringScore': 'תוכנית עבודה - מעקב שיטתי',
    'managementTeam_teamworkBasedScore': 'צוות הנהלה - עבודת צוות מתבססת',
    'managementTeam_clearRolesScore': 'צוות הנהלה - הגדרות תפקידים ברורות',
    'managementTeam_middleLeadershipInvolvedScore': 'צוות הנהלה - מנהיגות הביניים שותפה',
    'managementTeam_roleHoldersCoachingScore': 'צוות הנהלה - בעלי תפקידים מקבלים ליווי',
    'managementTeam_dataBasedDecisionsScore': 'צוות הנהלה - קבלת החלטות מבוססת נתונים',
    'managementTeam_teacherCollaborationScore': 'צוות הנהלה - שיתוף פעולה צוות מורים',
    'routines_adaptedTimetableScore': 'שגרות ארגוניות - מערכת שעות מותאמת',
    'routines_orderlyMeetingRoutinesScore': 'שגרות ארגוניות - שגרות ישיבות סדורות',
    'routines_decisionMakingProcessesScore': 'שגרות ארגוניות - תהליכי קבלת החלטות',
    'resources_systematicAllocationScore': 'ניהול משאבים - הקצאת משאבים שיטתית',
    'resources_resourceUtilizationTrackingScore': 'ניהול משאבים - מעקב ניצול משאבים',
    'resources_controlAndImprovementScore': 'ניהול משאבים - בקרה ושיפור',
    'staffCommitment_teamEngagementScore': 'מחויבות צוות - הצוות נרתם ומחויב',
    'staffCommitment_highSenseOfCapabilityScore': 'מחויבות צוות - תחושת מסוגלות גבוהה',
    'staffCommitment_highExpectationsScore': 'מחויבות צוות - רף ציפיות גבוה',
    'staffLearning_adaptedProfessionalDevelopmentScore': 'למידה והתמקצעות - פיתוח מקצועי מותאם',
    'staffLearning_connectingDevelopmentToPracticeScore': 'למידה והתמקצעות - חיבור פיתוח ליישום',
    'staffLearning_subjectAreaTrainingScore': 'למידה והתמקצעות - הדרכה בתחומי דעת',
    'staffLearning_peerLearningCultureScore': 'למידה והתמקצעות - תרבות למידת עמיתים',
    'staffLearning_innovativeInitiativesScore': 'למידה והתמקצעות - יוזמות חדשניות',
    'staffLearning_highExpectationsOfAchievementsScore': 'למידה והתמקצעות - ציפיות גבוהות מהישגים',
    'staffWellbeing_teachersReceiveSupportScore': 'רווחה ויציבות - מורים זוכים לליווי',
    'staffWellbeing_structuredOnboardingProcessesScore': 'רווחה ויציבות - תהליכי קליטה מובנים',
    'staffWellbeing_wellbeingAndResilienceSupportScore': 'רווחה ויציבות - מענים לרווחה וחוסן',
    'staffWellbeing_cohesionBuildingActivitiesScore': 'רווחה ויציבות - פעילויות חיזוק לכידות',
    'staffWellbeing_highStaffStabilityScore': 'רווחה ויציבות - יציבות הצוות גבוהה',
    'staffWellbeing_highSatisfactionScore': 'רווחה ויציבות - שביעות רצון גבוהה',
    'climateMapping_climateDataAnalysisScore': 'מיפוי אקלים - ניתוח נתוני אקלים',
    'climateMapping_monitoringAndEvaluationRoutinesScore': 'מיפוי אקלים - שגרות למעקב והערכה',
    'climateMapping_detectionAndTreatmentMechanismsScore': 'מיפוי אקלים - מנגנוני איתור וטיפול',
    'climateSafety_proceduresAndRulesEnforcedScore': 'מוגנות ושייכות - נהלים וכללים נאכפים',
    'climateSafety_safetyReinforcementProgramsScore': 'מוגנות ושייכות - תוכניות חיזוק מוגנות',
    'climateSafety_socialActivitiesScore': 'מוגנות ושייכות - פעילויות חברתיות',
    'climateSafety_fewViolenceIncidentsScore': 'מוגנות ושייכות - אירועי אלימות מצומצמים',
    'climateSafety_recognitionAndAppreciationCultureScore': 'מוגנות ושייכות - תרבות הכרה והוקרה',
    'climateRelationships_personalSocialEmotionalDialogueScore': 'יחסי קרבה - שיח אישי רגשי חברתי',
    'climateRelationships_familiarityAndPersonalConnectionScore': 'יחסי קרבה - היכרות וקשר אישי',
    'climateRelationships_teacherToolsAndCoachingScore': 'יחסי קרבה - למורים כלים וליווי',
    'climateRelationships_optimalSocialAtmosphereScore': 'יחסי קרבה - אווירה חברתית מיטבית',
    'sel_lifeSkillsProgramScore': 'מיומנויות רגשיות - תוכנית כישורי חיים',
    'sel_parentalConnectionScore': 'מיומנויות רגשיות - קיום קשר עם הורים',
    'sel_diverseSupportOptionsScore': 'מיומנויות רגשיות - מגוון מענים לטיפול',
    'language_adequateReadingComprehensionScore': 'שפה - רמת הבנת הנקרא מספקת',
    'language_developedWritingSkillsScore': 'שפה - כישורי כתיבה מפותחים',
    'language_broadVocabularyScore': 'שפה - אוצר מילים רחב',
    'language_clearOralExpressionScore': 'שפה - ביטוי בעל פה ברור',
    'language_establishedReadingCultureScore': 'שפה - תרבות קריאה מבוססת',
    'language_differentiatedResponseScore': 'שפה - מענה דיפרנציאלי',
    'math_basicSkillsMasteryScore': 'מתמטיקה - מיומנויות יסוד בשליטה',
    'math_effectiveStrategiesScore': 'מתמטיקה - אסטרטגיות יעילות',
    'math_optimalAnxietyCopingScore': 'מתמטיקה - התמודדות מיטבית חרדה',
    'math_useOfVisualAidsScore': 'מתמטיקה - שימוש אמצעי המחשה',
    'math_sufficientDifferentiationScore': 'מתמטיקה - דיפרנציאציה מספקת',
    'math_linkToDailyLifeScore': 'מתמטיקה - קישור לחיי יומיום',
    'english_studentsConfidentInUseScore': 'אנגלית - תלמידים בטוחים בשימוש',
    'english_exposureOutsideClassScore': 'אנגלית - חשיפה מחוץ לשיעור',
    'english_adaptedTeachingMethodsScore': 'אנגלית - שיטות הוראה מותאמות',
    'english_useOfTechnologicalToolsScore': 'אנגלית - שימוש כלים טכנולוגיים',
    'english_groupSizeAllowsGrowthScore': 'אנגלית - גודל קבוצות מאפשר מגדל',
    'english_useOfAuthenticMaterialsScore': 'אנגלית - שימוש חומרים אותנטיים',
    'science_sufficientLabEquipmentScore': 'מדעים - ציוד מעבדה מספק',
    'science_developedInquirySkillsScore': 'מדעים - מיומנויות חקר מפותחות',
    'science_practicalExperiencesScore': 'מדעים - התנסויות מעשיות',
    'science_developedScientificThinkingScore': 'מדעים - חשיבה מדעית מפותחת',
    'science_updatedCurriculumScore': 'מדעים - תוכנית מעודכנת לחזית',
    'science_linkToEnvironmentAndCommunityScore': 'מדעים - קישור לסביבה ולקהילה',
    'pedagogyPlanning_knowledgeAndSkillsMappingScore': 'תכנון הוראה - מיפוי ידע ומיומנויות',
    'pedagogyPlanning_findingsTranslatedScore': 'תכנון הוראה - ממצאי המיפוי מתורגמים',
    'pedagogyPlanning_effectivenessReviewScore': 'תכנון הוראה - בחינת אפקטיביות',
    'pedagogyPlanning_literacyPromotionEffortsScore': 'תכנון הוראה - המאמצים לקידום אוריינות',
    'pedagogyPlanning_entrepreneurshipAndInnovationCultureScore': 'תכנון הוראה - תרבות יזמות וחדשנות',
    'pedagogyPractices_lessonsIncludeVarietyScore': 'פרקטיקות הוראה - שיעורים כוללים מגוון',
    'pedagogyPractices_diverseLearningMethodsScore': 'פרקטיקות הוראה - דרכי למידה מגוונות',
    'pedagogyPractices_useOfDigitalToolsScore': 'פרקטיקות הוראה - שימוש כלים דיגיטליים',
    'pedagogyPractices_differentiatedTeachingScore': 'פרקטיקות הוראה - הוראה דיפרנציאלית',
    'pedagogyPractices_teachingPromotesThinkingScore': 'פרקטיקות הוראה - ההוראה מקדמת חשיבה',
    'pedagogyPractices_teachingLearningSkillsScore': 'פרקטיקות הוראה - הקנייה מיומנויות למידה',
    'pedagogyFeedback_managedEvaluationProcessesScore': 'משוב והערכה - תהליכי הערכה מנוהלים',
    'pedagogyFeedback_teachersHaveKnowledgeAndSkillsScore': 'משוב והערכה - למורים ידע ומיומנויות',
    'pedagogyFeedback_feedbackAndReflectionProcessesScore': 'משוב והערכה - תהליכי משוב ורפלקציה',
    'pedagogyFeedback_evaluationCriteriaScore': 'משוב והערכה - קריטריונים להערכה',
    'pedagogyFlexibility_flexibleLearningOrganizationScore': 'גמישות פדגוגית - ארגון הלמידה גמיש',
    'pedagogyFlexibility_focusedCurriculumScore': 'גמישות פדגוגית - תוכנית הלימודים ממוקדת',
    'pedagogyFlexibility_teachersHaveInterdisciplinaryKnowledgeScore': 'גמישות פדגוגית - למורים ידע למידה בין תחומית',
    'pedagogyCollaboration_jointPlanningRoutinesScore': 'שיתוף פעולה הוראה - שגרות תכנון משותף',
    'pedagogyCollaboration_adaptedPracticesScore': 'שיתוף פעולה הוראה - פרקטיקות מותאמות',
    'pedagogyCollaboration_jointExaminationScore': 'שיתוף פעולה הוראה - בחינה משותפת',
    'pedagogyCollaboration_openDialogueForImprovementScore': 'שיתוף פעולה הוראה - שיח פתוח לשיפור',
    'pedagogyCollaboration_opennessToLearningScore': 'שיתוף פעולה הוראה - פתיחות ללמידה',
    'pedagogyCollaboration_beliefInAbilitiesScore': 'שיתוף פעולה הוראה - אמונה ביכולות',
    'communityContinuum_enrichmentProgramsOfferedScore': 'מענים לרצף - קיים היצע תוכניות העשרה',
    'communityContinuum_tripsConnectedToCurriculumScore': 'מענים לרצף - טיולים מחוברים לתוכנית',
    'communityContinuum_diverseEducationalFrameworksScore': 'מענים לרצף - מסגרות חינוכיות מגוונות',
    'communitySocial_socialEducationIsAdaptedScore': 'חינוך חברתי - החינוך החברתי מותאם',
    'communitySocial_teachersHaveKnowledgeAndToolsScore': 'חינוך חברתי - למורים ידע וכלים',
    'communitySocial_teachingAssistantsPotentialRealizedScore': 'חינוך חברתי - מוצה פוטנציאאל תומכי הוראה',
    'communityLeisure_collaborationsWithOrganizationsScore': 'פעילות פנאי - שיתופי פעולה ארגונים',
    'communityLeisure_encouragementAndGuidanceForParticipationScore': 'פעילות פנאי - עידוד והכוונה השתתפות',
    'communityLeisure_wideRangeOfActivitiesScore': 'פעילות פנאי - היצע חוגים רחב',
    'communityPartnerships_parentParticipationInMeetingsScore': 'קשרי קהילה - השתתפות הורים במפגשים',
    'communityPartnerships_continuousCommunicationToFamiliesScore': 'קשרי קהילה - תקשורת רציפה למשפחות',
    'communityPartnerships_parentsInvolvedInActivitiesScore': 'קשרי קהילה - הורים מעורבים בפעילויות',
    'communityPartnerships_parentsHaveToolsToSupportScore': 'קשרי קהילה - להורים כלים לתמיכה',
    'communityPartnerships_effectiveDialogueWithAuthorityScore': 'קשרי קהילה - שיח אפקטיבי עם רשות',
    'communityPartnerships_externalResourcesUtilizedScore': 'קשרי קהילה - משאבים חיצוניים מנוצלים'
};

export const METRIC_TO_CHALLENGE_MAP: { [key: string]: string } = {
    'vision_clearAndAgreedScore': 'החזון הבית ספרי אינו ברור או מוסכם דיו.',
    'vision_educationalConceptTranslatedScore': 'התפיסה החינוכית אינה מתורגמת באופן עקבי לפרקטיקה.',
    'vision_strategicPlanningScore': 'היעדר תכנון אסטרטגי ארוך טווח.',
    'vision_measurableGoalsScore': 'היעדים שהוגדרו אינם מדידים או ריאליים.',
    'vision_communityPartnershipScore': 'הקהילה אינה שותפה מספיק בגיבוש וקידום החזון.',
    'workPlan_needsBasedScore': 'תוכנית העבודה אינה מבוססת מספיק על מיפוי צרכים ונתונים.',
    'workPlan_clearGoalsAndMetricsScore': 'תוכנית העבודה חסרה יעדים ומדדים ברורים.',
    'workPlan_systematicMonitoringScore': 'המעקב אחר יישום תוכנית העבודה אינו שיטתי.',
    'managementTeam_clearRolesScore': 'הגדרות התפקידים בצוות ההנהלה אינן ברורות דיין.',
    'managementTeam_middleLeadershipInvolvedScore': 'מנהיגות הביניים אינה שותפה מספיק בתהליכי ההובלה.',
    'managementTeam_roleHoldersCoachingScore': 'בעלי תפקידים אינם מקבלים ליווי מקצועי מספק.',
    'managementTeam_dataBasedDecisionsScore': 'תהליכי קבלת ההחלטות אינם מבוססי נתונים.',
    'staffCommitment_teamEngagementScore': 'רמת המחויבות וההירתמות של הצוות אינה מספקת.',
    'staffCommitment_highSenseOfCapabilityScore': 'תחושת המסוגלות של הצוות נמוכה.',
    'staffCommitment_highExpectationsScore': 'רף הציפיות של הצוות מהתלמידים אינו גבוה מספיק.',
    'staffLearning_adaptedProfessionalDevelopmentScore': 'הפיתוח המקצועי אינו מותאם לצורכי המורים.',
    'staffLearning_peerLearningCultureScore': 'תרבות למידת עמיתים אינה מפותחת דיה.',
    'staffWellbeing_wellbeingAndResilienceSupportScore': 'קיים חסר במענים לרווחת וחוסן המורים.',
    'staffWellbeing_highStaffStabilityScore': 'קיימת תחלופה גבוהה של צוות ההוראה.',
    'climateMapping_climateDataAnalysisScore': 'ניתוח נתוני האקלים אינו מוביל למענים מותאמים.',
    'climateSafety_proceduresAndRulesEnforcedScore': 'קיימת אי-אחידות באכיפת הנהלים והכללים.',
    'climateSafety_fewViolenceIncidentsScore': 'קיימים אירועי אלימות הדורשים התערבות.',
    'climateRelationships_personalSocialEmotionalDialogueScore': 'שיח אישי-רגשי בין מורים לתלמידים אינו מתקיים באופן שיטתי.',
    'pedagogyPractices_differentiatedTeachingScore': 'ההוראה אינה דיפרנציאלית ואינה נותנת מענה לשונות.',
    'pedagogyPractices_teachingPromotesThinkingScore': 'ההוראה אינה מקדמת מספיק חשיבה מסדר גבוה.',
    'pedagogyFeedback_feedbackAndReflectionProcessesScore': 'תהליכי משוב ורפלקציה אינם חלק אינטגרלי מההוראה.',
    'communityPartnerships_parentParticipationInMeetingsScore': 'השתתפות ההורים במפגשים ופעילויות נמוכה.',
};


export const HIERARCHICAL_CATEGORIES = [
    {
        name: 'מנהיגות ותרבות בית ספרית',
        subCategories: [
            { name: 'חזון ברור', key: 'vision', metrics: [
                { key: 'vision_clearAndAgreedScore', name: 'החזון הבית ספרי ברור ומוסכם על כלל הצוות.'},
                { key: 'vision_educationalConceptTranslatedScore', name: 'התפיסה החינוכית מתורגמת לעקרונות פעולה ברורים.'},
                { key: 'vision_resourcesAndEdgesScore', name: 'החזון מתבסס על ניצול המשאבים והיתרונות היחסיים של בית הספר.'},
                { key: 'vision_strategicPlanningScore', name: 'בית הספר פועל על פי תכנון אסטרטגי ארוך טווח.'},
                { key: 'vision_measurableGoalsScore', name: 'היעדים הנגזרים מהחזון הם מדידים וניתנים להערכה.'},
                { key: 'vision_communityPartnershipScore', name: 'הקהילה שותפה בעיצוב ובקידום החזון הבית ספרי.'},
            ]},
            { name: 'תוכנית עבודה', key: 'workPlan', metrics: [
                { key: 'workPlan_needsBasedScore', name: 'תוכנית העבודה מבוססת על מיפוי צרכים ואיסוף נתונים שיטתי.'},
                { key: 'workPlan_clearGoalsAndMetricsScore', name: 'תוכנית העבודה כוללת יעדים ומדדים ברורים להצלחה.'},
                { key: 'workPlan_systematicMonitoringScore', name: 'קיים מעקב שיטתי אחר התקדמות תוכנית העבודה וביצוע התאמות.'},
            ]},
            { name: 'צוות הנהלה', key: 'managementTeam', metrics: [
                { key: 'managementTeam_teamworkBasedScore', name: 'עבודת צוות ההנהלה מתבססת על שיתוף פעולה ואמון.'},
                { key: 'managementTeam_clearRolesScore', name: 'הגדרות התפקידים ותחומי האחריות בצוות ההנהלה ברורים.'},
                { key: 'managementTeam_middleLeadershipInvolvedScore', name: 'מנהיגות הביניים (רכזים) שותפה באופן מלא בהובלת בית הספר.'},
                { key: 'managementTeam_roleHoldersCoachingScore', name: 'בעלי תפקידים בצוות ההנהלה מקבלים ליווי ותמיכה לפיתוחם המקצועי.'},
                { key: 'managementTeam_dataBasedDecisionsScore', name: 'תהליכי קבלת ההחלטות בצוות ההנהלה מבוססים על נתונים.'},
                { key: 'managementTeam_teacherCollaborationScore', name: 'צוות ההנהלה מוביל ומעודד שיתופי פעולה בקרב המורים.'},
            ]},
            { name: 'שגרות ארגוניות', key: 'routines', metrics: [
                { key: 'routines_adaptedTimetableScore', name: 'מערכת השעות מותאמת ליעדים הפדגוגיים ותומכת בגמישות.'},
                { key: 'routines_orderlyMeetingRoutinesScore', name: 'שגרות הישיבות בבית הספר סדורות, יעילות וממוקדות.'},
                { key: 'routines_decisionMakingProcessesScore', name: 'תהליכי קבלת ההחלטות בבית הספר שקופים וברורים לכלל הצוות.'},
            ]},
            { name: 'ניהול משאבים', key: 'resources', metrics: [
                { key: 'resources_systematicAllocationScore', name: 'הקצאת המשאבים (תקציב, שעות) נעשית באופן שיטתי בהתאם ליעדים.'},
                { key: 'resources_resourceUtilizationTrackingScore', name: 'קיים מעקב אחר ניצול אפקטיבי של המשאבים.'},
                { key: 'resources_controlAndImprovementScore', name: 'מתקיימים תהליכי בקרה ושיפור מתמידים בניהול המשאבים.'},
            ]},
        ]
    },
    {
        name: 'צוות חינוכי',
        subCategories: [
            { name: 'מחויבות צוות', key: 'staffCommitment', metrics: [
                { key: 'staffCommitment_teamEngagementScore', name: 'הצוות החינוכי נרתם ומחויב למטרות בית הספר.'},
                { key: 'staffCommitment_highSenseOfCapabilityScore', name: 'לצוות החינוכי תחושת מסוגלות גבוהה ויכולת להשפיע.'},
                { key: 'staffCommitment_highExpectationsScore', name: 'הצוות מציב רף ציפיות גבוה הן מהתלמידים והן מעצמו.'},
            ]},
            { name: 'למידה והתמקצעות', key: 'staffLearning', metrics: [
                 { key: 'staffLearning_adaptedProfessionalDevelopmentScore', name: 'הפיתוח המקצועי מותאם לצרכים האישיים והמערכתיים.'},
                { key: 'staffLearning_connectingDevelopmentToPracticeScore', name: 'קיים חיבור הדוק בין הפיתוח המקצועי ליישום בשטח.'},
                { key: 'staffLearning_subjectAreaTrainingScore', name: 'הצוות מקבל הדרכה מקצועית ועדכנית בתחומי הדעת השונים.'},
                { key: 'staffLearning_peerLearningCultureScore', name: 'קיימת תרבות של למידת עמיתים, שיתוף ידע ושיח פתוח.'},
                { key: 'staffLearning_innovativeInitiativesScore', name: 'בית הספר מעודד ומטפח יוזמות חדשניות בקרב הצוות.'},
                { key: 'staffLearning_highExpectationsOfAchievementsScore', name: 'לצוות ציפיות גבוהות מהישגי התלמידים בכל התחומים.'},
            ]},
            { name: 'רווחה ויציבות', key: 'staffWellbeing', metrics: [
                { key: 'staffWellbeing_teachersReceiveSupportScore', name: 'מורים זוכים לליווי, תמיכה ומשוב מקדם מההנהלה.'},
                { key: 'staffWellbeing_structuredOnboardingProcessesScore', name: 'קיימים תהליכי קליטה מובנים ותומכים למורים חדשים.'},
                { key: 'staffWellbeing_wellbeingAndResilienceSupportScore', name: 'בית הספר מספק מענים לרווחת ולחוסן הנפשי של המורים.'},
                { key: 'staffWellbeing_cohesionBuildingActivitiesScore', name: 'מתקיימות פעילויות לחיזוק הלכידות והגיבוש הצוותי.'},
                { key: 'staffWellbeing_highStaffStabilityScore', name: 'יציבות הצוות החינוכי גבוהה, ותחלופת המורים נמוכה.'},
                { key: 'staffWellbeing_highSatisfactionScore', name: 'שביעות הרצון של המורים ממקום עבודתם גבוהה.'},
            ]},
        ]
    },
    {
        name: 'למידה רגשית-חברתית ואקלים',
        subCategories: [
            { name: 'מיפוי אקלים', key: 'climateMapping', metrics: [
                { key: 'climateMapping_climateDataAnalysisScore', name: 'בית הספר מנתח באופן שיטתי את נתוני האקלים.'},
                { key: 'climateMapping_monitoringAndEvaluationRoutinesScore', name: 'קיימות שגרות למעקב והערכה של האקלים הבית ספרי.'},
                { key: 'climateMapping_detectionAndTreatmentMechanismsScore', name: 'קיימים מנגנונים לאיתור וטיפול בתלמידים בסיכון.'},
            ]},
            { name: 'מוגנות ושייכות', key: 'climateSafety', metrics: [
                { key: 'climateSafety_proceduresAndRulesEnforcedScore', name: 'הנהלים והכללים נאכפים באופן עקבי וברור.'},
                { key: 'climateSafety_safetyReinforcementProgramsScore', name: 'מופעלות תוכניות לחיזוק תחושת המוגנות של התלמידים.'},
                { key: 'climateSafety_socialActivitiesScore', name: 'מתקיימות פעילויות חברתיות המקדמות לכידות ושייכות.'},
                { key: 'climateSafety_fewViolenceIncidentsScore', name: 'אירועי האלימות בבית הספר מצומצמים ומטופלים ביעילות.'},
                { key: 'climateSafety_recognitionAndAppreciationCultureScore', name: 'קיימת תרבות של הכרה והוקרה התורמת לתחושת הערך העצמי.'},
            ]},
            { name: 'יחסי קרבה', key: 'climateRelationships', metrics: [
                { key: 'climateRelationships_personalSocialEmotionalDialogueScore', name: 'מתקיים שיח אישי, רגשי וחברתי בין מורים לתלמידים.'},
                { key: 'climateRelationships_familiarityAndPersonalConnectionScore', name: 'המורים מכירים היטב את תלמידיהם ומקיימים עמם קשר אישי.'},
                { key: 'climateRelationships_teacherToolsAndCoachingScore', name: 'למורים יש כלים וליווי לפיתוח קשר אישי עם תלמידים.'},
                { key: 'climateRelationships_optimalSocialAtmosphereScore', name: 'האווירה החברתית בבית הספר מיטבית ותומכת.'},
            ]},
            { name: 'מיומנויות רגשיות', key: 'sel', metrics: [
                { key: 'sel_lifeSkillsProgramScore', name: 'מופעלת תוכנית כישורי חיים המפתחת מיומנויות רגשיות-חברתיות.'},
                { key: 'sel_parentalConnectionScore', name: 'מתקיים קשר רציף עם ההורים בנושאים רגשיים וחברתיים.'},
                { key: 'sel_diverseSupportOptionsScore', name: 'בית הספר מציע מגוון מענים לטיפול בקשיים רגשיים והתנהגותיים.'},
            ]},
        ]
    },
    {
        name: 'הישגים בתחומי הליבה',
        subCategories: [
             { name: 'שפה', key: 'language', metrics: [
                { key: 'language_adequateReadingComprehensionScore', name: 'רמת הבנת הנקרא של התלמידים מספקת.'},
                { key: 'language_developedWritingSkillsScore', name: 'כישורי כתיבה של התלמידים מפותחים היטב.'},
                { key: 'language_broadVocabularyScore', name: 'לתלמידים אוצר מילים רחב ועשיר.'},
                { key: 'language_clearOralExpressionScore', name: 'יכולת הביטוי בעל פה של התלמידים ברורה ורהוטה.'},
                { key: 'language_establishedReadingCultureScore', name: 'קיימת תרבות קריאה מבוססת בבית הספר.'},
                { key: 'language_differentiatedResponseScore', name: 'ניתן מענה דיפרנציאלי לצרכים השונים של התלמידים בתחום השפה.'},
            ]},
            { name: 'מתמטיקה', key: 'math', metrics: [
                { key: 'math_basicSkillsMasteryScore', name: 'מיומנויות היסוד במתמטיקה נשלטות היטב על ידי התלמידים.'},
                { key: 'math_effectiveStrategiesScore', name: 'התלמידים משתמשים באסטרטגיות יעילות לפתרון בעיות.'},
                { key: 'math_optimalAnxietyCopingScore', name: 'בית הספר מסייע לתלמידים להתמודד באופן מיטבי עם חרדת מתמטיקה.'},
                { key: 'math_useOfVisualAidsScore', name: 'נעשה שימוש יעיל באמצעי המחשה וכלים טכנולוגיים בהוראת המתמטיקה.'},
                { key: 'math_sufficientDifferentiationScore', name: 'ההוראה במתמטיקה מותאמת לרמות השונות של התלמידים.'},
                { key: 'math_linkToDailyLifeScore', name: 'ההוראה מקשרת את המתמטיקה לחיי היומיום והופכת אותה לרלוונטית.'},
            ]},
            { name: 'אנגלית', key: 'english', metrics: [
                { key: 'english_studentsConfidentInUseScore', name: 'התלמידים מרגישים בטוחים להשתמש בשפה האנגלית.'},
                { key: 'english_exposureOutsideClassScore', name: 'התלמידים נחשפים לשפה האנגלית גם מחוץ למסגרת השיעור.'},
                { key: 'english_adaptedTeachingMethodsScore', name: 'שיטות ההוראה באנגלית מותאמות וחדשניות.'},
                { key: 'english_useOfTechnologicalToolsScore', name: 'נעשה שימוש יעיל בכלים טכנולוגיים לקידום לימודי האנגלית.'},
                { key: 'english_groupSizeAllowsGrowthScore', name: 'גודל קבוצות הלימוד מאפשר למידה וצמיחה מיטבית.'},
                { key: 'english_useOfAuthenticMaterialsScore', name: 'נעשה שימוש בחומרים אותנטיים ומגוונים בהוראת האנגלית.'},
            ]},
            { name: 'מדעים', key: 'science', metrics: [
                { key: 'science_sufficientLabEquipmentScore', name: 'ציוד המעבדה בבית הספר מספק ומאפשר למידה התנסותית.'},
                { key: 'science_developedInquirySkillsScore', name: 'מיומנויות החקר של התלמידים מפותחות היטב.'},
                { key: 'science_practicalExperiencesScore', name: 'התלמידים זוכים להתנסויות מעשיות רבות בשיעורי המדעים.'},
                { key: 'science_developedScientificThinkingScore', name: 'ההוראה מטפחת חשיבה מדעית, ביקורתית ויצירתית.'},
                { key: 'science_updatedCurriculumScore', name: 'תוכנית הלימודים במדעים מעודכנת לחזית הידע המדעי.'},
                { key: 'science_linkToEnvironmentAndCommunityScore', name: 'הלמידה מקשרת בין תכני המדעים לסביבה ולקהילה.'},
            ]},
        ]
    },
    {
        name: 'תהליכי הוראה-למידה-הערכה',
        subCategories: [
            { name: 'תכנון הוראה', key: 'pedagogyPlanning', metrics: [
                { key: 'pedagogyPlanning_knowledgeAndSkillsMappingScore', name: 'צוותי ההוראה ממפים את הידע והמיומנויות הנדרשים בכל תחום.'},
                { key: 'pedagogyPlanning_findingsTranslatedScore', name: 'ממצאי המיפוי מתורגמים לתכנון הוראה מותאם לתלמידים.'},
                { key: 'pedagogyPlanning_effectivenessReviewScore', name: 'מתקיימת בחינה מתמדת של אפקטיביות תכנון ההוראה.'},
                { key: 'pedagogyPlanning_literacyPromotionEffortsScore', name: 'המאמצים לקידום אוריינות שזורים בכל תחומי הדעת.'},
                { key: 'pedagogyPlanning_entrepreneurshipAndInnovationCultureScore', name: 'קיימת תרבות של יזמות וחדשנות בתכנון ההוראה.'},
            ]},
            { name: 'פרקטיקות הוראה', key: 'pedagogyPractices', metrics: [
                { key: 'pedagogyPractices_lessonsIncludeVarietyScore', name: 'השיעורים כוללים מגוון של פעילויות המותאמות למטרות.'},
                { key: 'pedagogyPractices_diverseLearningMethodsScore', name: 'נעשה שימוש בדרכי למידה מגוונות המעודדות מעורבות פעילה.'},
                { key: 'pedagogyPractices_useOfDigitalToolsScore', name: 'נעשה שימוש מושכל בכלים דיגיטליים לשיפור ההוראה והלמידה.'},
                { key: 'pedagogyPractices_differentiatedTeachingScore', name: 'ההוראה דיפרנציאלית ונותנת מענה אפקטיבי לשונות בין התלמידים.'},
                { key: 'pedagogyPractices_teachingPromotesThinkingScore', name: 'ההוראה מקדמת חשיבה ביקורתית, יצירתית ומעמיקה.'},
                { key: 'pedagogyPractices_teachingLearningSkillsScore', name: 'ההוראה מקנה לתלמידים מיומנויות למידה עצמאית.'},
            ]},
            { name: 'משוב והערכה', key: 'pedagogyFeedback', metrics: [
                 { key: 'pedagogyFeedback_managedEvaluationProcessesScore', name: 'תהליכי ההערכה מנוהלים באופן שיטתי ומקצועי.'},
                { key: 'pedagogyFeedback_teachersHaveKnowledgeAndSkillsScore', name: 'למורים יש את הידע והמיומנויות להעריך את התלמידים באופן מהימן.'},
                { key: 'pedagogyFeedback_feedbackAndReflectionProcessesScore', name: 'מתקיימים תהליכי משוב ורפלקציה המקדמים את למידת התלמידים.'},
                { key: 'pedagogyFeedback_evaluationCriteriaScore', name: 'קיימים קריטריונים ברורים ושקופים להערכת הישגי התלמידים.'},
            ]},
            { name: 'גמישות פדגוגית', key: 'pedagogyFlexibility', metrics: [
                { key: 'pedagogyFlexibility_flexibleLearningOrganizationScore', name: 'ארגון הלמידה בבית הספר גמיש ומאפשר מגוון סביבות למידה.'},
                { key: 'pedagogyFlexibility_focusedCurriculumScore', name: 'תוכנית הלימודים ממוקדת ומאפשרת למידה מעמיקה.'},
                { key: 'pedagogyFlexibility_teachersHaveInterdisciplinaryKnowledgeScore', name: 'למורים ידע המאפשר למידה בין-תחומית ורב-תחומית.'},
            ]},
            { name: 'שיתוף פעולה הוראה', key: 'pedagogyCollaboration', metrics: [
                { key: 'pedagogyCollaboration_jointPlanningRoutinesScore', name: 'קיימות שגרות של תכנון משותף בקרב צוותי המורים.'},
                { key: 'pedagogyCollaboration_adaptedPracticesScore', name: 'פרקטיקות ההוראה מותאמות ונבחנות באופן שוטף על ידי הצוות.'},
                { key: 'pedagogyCollaboration_jointExaminationScore', name: 'מתקיימת בחינה משותפת של עבודות תלמידים להפקת תובנות.'},
                { key: 'pedagogyCollaboration_openDialogueForImprovementScore', name: 'מתקיים שיח פתוח ומקצועי בין המורים במטרה לשפר את ההוראה.'},
                { key: 'pedagogyCollaboration_opennessToLearningScore', name: 'הצוות מפגין פתיחות ללמוד זה מזה ולשנות פרקטיקות.'},
                { key: 'pedagogyCollaboration_beliefInAbilitiesScore', name: 'קיימת אמונה ביכולות המשותפות של הצוות להוביל לשיפור.'},
            ]},
        ]
    },
    {
        name: 'חינוך חברתי קהילתי',
        subCategories: [
            { name: 'מענים לרצף', key: 'communityContinuum', metrics: [
                { key: 'communityContinuum_enrichmentProgramsOfferedScore', name: 'קיים היצע רחב של תוכניות העשרה הנותנות מענה לשונות.'},
                { key: 'communityContinuum_tripsConnectedToCurriculumScore', name: 'הטיולים והסיורים מחוברים באופן משמעותי לתוכנית הלימודים.'},
                { key: 'communityContinuum_diverseEducationalFrameworksScore', name: 'קיימות מסגרות חינוכיות מגוונות (כמו מועדונית) התומכות בלמידה.'},
            ]},
            { name: 'חינוך חברתי', key: 'communitySocial', metrics: [
                { key: 'communitySocial_socialEducationIsAdaptedScore', name: 'החינוך החברתי מותאם לגיל ולשלב ההתפתחותי של התלמידים.'},
                { key: 'communitySocial_teachersHaveKnowledgeAndToolsScore', name: 'למורים יש את הידע והכלים להוביל שיח חברתי משמעותי.'},
                { key: 'communitySocial_teachingAssistantsPotentialRealizedScore', name: 'פוטנציאל תומכי ההוראה ממוצה ותרומתם משמעותית.'},
            ]},
            { name: 'פעילות פנאי', key: 'communityLeisure', metrics: [
                { key: 'communityLeisure_collaborationsWithOrganizationsScore', name: 'קיימים שיתופי פעולה עם ארגונים להעשרת פעילות הפנאי.'},
                { key: 'communityLeisure_encouragementAndGuidanceForParticipationScore', name: 'בית הספר מעודד ומכוון את התלמידים להשתתפות בפעילויות פנאי.'},
                { key: 'communityLeisure_wideRangeOfActivitiesScore', name: 'היצע החוגים והפעילויות לתלמידים רחב ומגוון.'},
            ]},
            { name: 'קשרי קהילה', key: 'communityPartnerships', metrics: [
                { key: 'communityPartnerships_parentParticipationInMeetingsScore', name: 'השתתפות ההורים במפגשים ובפעילויות בית ספריות גבוהה.'},
                { key: 'communityPartnerships_continuousCommunicationToFamiliesScore', name: 'התקשורת עם משפחות התלמידים רציפה, שקופה ודו-כיוונית.'},
                { key: 'communityPartnerships_parentsInvolvedInActivitiesScore', name: 'הורים מעורבים באופן פעיל בעשייה החינוכית בבית הספר.'},
                { key: 'communityPartnerships_parentsHaveToolsToSupportScore', name: 'בית הספר מקנה להורים כלים לתמיכה בלימודי ילדיהם.'},
                { key: 'communityPartnerships_effectiveDialogueWithAuthorityScore', name: 'קיים שיח אפקטיבי ורציף עם הרשות המקומית.'},
                { key: 'communityPartnerships_externalResourcesUtilizedScore', name: 'בית הספר מנצל באופן מיטבי משאבים חיצוניים מהקהילה.'},
            ]},
        ]
    }
];

export const NEW_CHALLENGE_CATEGORIES_FOR_REPORT = HIERARCHICAL_CATEGORIES.map(main => ({
    name: main.name,
    subCategories: main.subCategories.map(sub => ({
        name: sub.name,
        key: sub.key,
        scoreKey: `${sub.key}Score`
    }))
}));


export const BOOKLET_ISSUE_TO_METRICS_MAP: { [key: string]: (keyof School)[] } = {
    strategic_foundations: [
        'vision_clearAndAgreedScore', 'vision_educationalConceptTranslatedScore', 'vision_resourcesAndEdgesScore', 'vision_strategicPlanningScore', 'vision_measurableGoalsScore',
        'workPlan_needsBasedScore', 'workPlan_clearGoalsAndMetricsScore', 'workPlan_systematicMonitoringScore',
        'managementTeam_teamworkBasedScore', 'managementTeam_clearRolesScore', 'managementTeam_middleLeadershipInvolvedScore', 'managementTeam_roleHoldersCoachingScore',
        'routines_adaptedTimetableScore', 'routines_orderlyMeetingRoutinesScore', 'routines_decisionMakingProcessesScore',
        'resources_systematicAllocationScore', 'resources_resourceUtilizationTrackingScore', 'resources_controlAndImprovementScore'
    ],
    teaching_learning_quality: [
        'pedagogyPlanning_knowledgeAndSkillsMappingScore', 'pedagogyPlanning_findingsTranslatedScore', 'pedagogyPlanning_effectivenessReviewScore',
        'pedagogyPractices_lessonsIncludeVarietyScore', 'pedagogyPractices_diverseLearningMethodsScore', 'pedagogyPractices_differentiatedTeachingScore', 'pedagogyPractices_teachingPromotesThinkingScore', 'pedagogyPractices_teachingLearningSkillsScore',
        'language_adequateReadingComprehensionScore', 'language_developedWritingSkillsScore', 'language_differentiatedResponseScore',
        'math_basicSkillsMasteryScore', 'math_effectiveStrategiesScore', 'math_sufficientDifferentiationScore',
        'pedagogyCollaboration_jointPlanningRoutinesScore', 'pedagogyCollaboration_adaptedPracticesScore', 'pedagogyCollaboration_jointExaminationScore', 'pedagogyCollaboration_openDialogueForImprovementScore'
    ],
    staff_development: [
        'staffCommitment_teamEngagementScore', 'staffCommitment_highSenseOfCapabilityScore', 'staffCommitment_highExpectationsScore',
        'staffLearning_adaptedProfessionalDevelopmentScore', 'staffLearning_connectingDevelopmentToPracticeScore', 'staffLearning_subjectAreaTrainingScore', 'staffLearning_peerLearningCultureScore',
        'staffWellbeing_teachersReceiveSupportScore', 'staffWellbeing_structuredOnboardingProcessesScore', 'staffWellbeing_wellbeingAndResilienceSupportScore', 'staffWellbeing_highStaffStabilityScore', 'staffWellbeing_highSatisfactionScore',
        'managementTeam_roleHoldersCoachingScore'
    ],
    climate_and_wellbeing: [
        'climateMapping_climateDataAnalysisScore', 'climateMapping_monitoringAndEvaluationRoutinesScore', 'climateMapping_detectionAndTreatmentMechanismsScore',
        'climateSafety_proceduresAndRulesEnforcedScore', 'climateSafety_safetyReinforcementProgramsScore', 'climateSafety_fewViolenceIncidentsScore', 'climateSafety_recognitionAndAppreciationCultureScore',
        'climateRelationships_personalSocialEmotionalDialogueScore', 'climateRelationships_familiarityAndPersonalConnectionScore', 'climateRelationships_optimalSocialAtmosphereScore',
        'sel_lifeSkillsProgramScore', 'sel_diverseSupportOptionsScore'
    ],
    community_partnerships: [
        'vision_communityPartnershipScore',
        'communityPartnerships_parentParticipationInMeetingsScore', 'communityPartnerships_continuousCommunicationToFamiliesScore', 'communityPartnerships_parentsInvolvedInActivitiesScore', 'communityPartnerships_parentsHaveToolsToSupportScore',
        'communityPartnerships_effectiveDialogueWithAuthorityScore', 'communityPartnerships_externalResourcesUtilizedScore',
        'communityLeisure_collaborationsWithOrganizationsScore'
    ],
    evaluation_and_control: [
        'managementTeam_dataBasedDecisionsScore',
        'pedagogyFeedback_managedEvaluationProcessesScore', 'pedagogyFeedback_teachersHaveKnowledgeAndSkillsScore', 'pedagogyFeedback_feedbackAndReflectionProcessesScore', 'pedagogyFeedback_evaluationCriteriaScore',
        'workPlan_systematicMonitoringScore', 'resources_controlAndImprovementScore'
    ],
    pedagogical_innovation: [
        'staffLearning_innovativeInitiativesScore', 'pedagogyPlanning_entrepreneurshipAndInnovationCultureScore',
        'pedagogyPractices_useOfDigitalToolsScore',
        'pedagogyFlexibility_flexibleLearningOrganizationScore', 'pedagogyFlexibility_focusedCurriculumScore', 'pedagogyFlexibility_teachersHaveInterdisciplinaryKnowledgeScore'
    ],
    empower_middle_leadership: ['managementTeam_middleLeadershipInvolvedScore', 'managementTeam_roleHoldersCoachingScore', 'managementTeam_clearRolesScore', 'staffLearning_innovativeInitiativesScore'],
    data_driven_culture: ['managementTeam_dataBasedDecisionsScore', 'climateMapping_climateDataAnalysisScore', 'workPlan_needsBasedScore', 'pedagogyPlanning_knowledgeAndSkillsMappingScore', 'pedagogyFeedback_managedEvaluationProcessesScore'],
    teacher_onboarding_retention: ['staffWellbeing_structuredOnboardingProcessesScore', 'staffWellbeing_highStaffStabilityScore', 'staffWellbeing_teachersReceiveSupportScore', 'staffWellbeing_highSatisfactionScore'],
    plc_culture: ['staffLearning_peerLearningCultureScore', 'pedagogyCollaboration_jointPlanningRoutinesScore', 'pedagogyCollaboration_jointExaminationScore', 'pedagogyCollaboration_openDialogueForImprovementScore', 'pedagogyCollaboration_opennessToLearningScore'],
    risk_behavior_management: ['climateSafety_proceduresAndRulesEnforcedScore', 'climateSafety_fewViolenceIncidentsScore', 'sel_diverseSupportOptionsScore', 'communitySocial_teachersHaveKnowledgeAndToolsScore', 'climateMapping_detectionAndTreatmentMechanismsScore'],
    student_support_system: ['climateMapping_detectionAndTreatmentMechanismsScore', 'sel_diverseSupportOptionsScore', 'staffWellbeing_wellbeingAndResilienceSupportScore', 'communityPartnerships_parentsHaveToolsToSupportScore', 'climateRelationships_familiarityAndPersonalConnectionScore'],
    closing_learning_gaps: ['language_differentiatedResponseScore', 'math_sufficientDifferentiationScore', 'pedagogyPractices_differentiatedTeachingScore', 'english_groupSizeAllowsGrowthScore', 'pedagogyPlanning_findingsTranslatedScore'],
    excellence_and_gifted_students: ['pedagogyFlexibility_flexibleLearningOrganizationScore', 'communityContinuum_enrichmentProgramsOfferedScore', 'pedagogyPractices_teachingPromotesThinkingScore', 'pedagogyPlanning_entrepreneurshipAndInnovationCultureScore'],
    promoting_hots: ['pedagogyPractices_teachingPromotesThinkingScore', 'science_developedInquirySkillsScore', 'math_effectiveStrategiesScore', 'language_adequateReadingComprehensionScore', 'pedagogyPractices_teachingLearningSkillsScore'],
    edtech_integration: ['pedagogyPractices_useOfDigitalToolsScore', 'english_useOfTechnologicalToolsScore', 'math_useOfVisualAidsScore', 'pedagogyFlexibility_flexibleLearningOrganizationScore'],
    informal_education_expansion: ['communityContinuum_enrichmentProgramsOfferedScore', 'communityLeisure_wideRangeOfActivitiesScore', 'communityLeisure_collaborationsWithOrganizationsScore', 'communityContinuum_tripsConnectedToCurriculumScore'],
    parental_support_tools: ['communityPartnerships_parentsHaveToolsToSupportScore', 'sel_parentalConnectionScore', 'communitySocial_socialEducationIsAdaptedScore'],
    change_management: ['vision_strategicPlanningScore', 'workPlan_systematicMonitoringScore', 'managementTeam_teacherCollaborationScore', 'staffCommitment_teamEngagementScore', 'pedagogyCollaboration_openDialogueForImprovementScore', 'pedagogyCollaboration_opennessToLearningScore'],
    internal_communication: ['routines_orderlyMeetingRoutinesScore', 'managementTeam_teamworkBasedScore', 'communityPartnerships_continuousCommunicationToFamiliesScore', 'pedagogyCollaboration_openDialogueForImprovementScore'],
    staff_resilience: ['staffWellbeing_wellbeingAndResilienceSupportScore', 'staffWellbeing_teachersReceiveSupportScore', 'staffCommitment_highSenseOfCapabilityScore', 'staffWellbeing_highSatisfactionScore'],
    staff_gap_bridging: ['managementTeam_teamworkBasedScore', 'staffLearning_peerLearningCultureScore', 'staffWellbeing_cohesionBuildingActivitiesScore', 'pedagogyCollaboration_openDialogueForImprovementScore'],
    inclusion_equity: ['pedagogyPractices_differentiatedTeachingScore', 'climateSafety_socialActivitiesScore', 'sel_diverseSupportOptionsScore', 'climateRelationships_optimalSocialAtmosphereScore', 'communityPartnerships_parentsInvolvedInActivitiesScore'],
    student_agency: ['pedagogyPractices_teachingLearningSkillsScore', 'pedagogyPractices_teachingPromotesThinkingScore', 'pedagogyPlanning_entrepreneurshipAndInnovationCultureScore', 'pedagogyFlexibility_flexibleLearningOrganizationScore'],
    disciplinary_literacy: ['language_adequateReadingComprehensionScore', 'science_developedScientificThinkingScore', 'pedagogyPractices_teachingPromotesThinkingScore', 'language_developedWritingSkillsScore'],
    test_anxiety_management: ['math_optimalAnxietyCopingScore', 'sel_lifeSkillsProgramScore', 'pedagogyFeedback_feedbackAndReflectionProcessesScore', 'climateRelationships_personalSocialEmotionalDialogueScore'],
    formative_assessment_culture: ['pedagogyFeedback_managedEvaluationProcessesScore', 'pedagogyFeedback_feedbackAndReflectionProcessesScore', 'pedagogyFeedback_teachersHaveKnowledgeAndSkillsScore', 'pedagogyCollaboration_jointExaminationScore'],
    culturally_responsive_teaching: ['pedagogyPractices_differentiatedTeachingScore', 'communityPartnerships_parentsInvolvedInActivitiesScore', 'climateRelationships_familiarityAndPersonalConnectionScore', 'pedagogyPractices_diverseLearningMethodsScore'],
    school_as_community_anchor: ['vision_communityPartnershipScore', 'communityPartnerships_effectiveDialogueWithAuthorityScore', 'communityLeisure_collaborationsWithOrganizationsScore', 'communityContinuum_diverseEducationalFrameworksScore', 'communityPartnerships_externalResourcesUtilizedScore'],
    digital_citizenship: ['pedagogyPractices_useOfDigitalToolsScore', 'sel_lifeSkillsProgramScore', 'communityPartnerships_parentsHaveToolsToSupportScore', 'english_useOfTechnologicalToolsScore']
};

export const BOOKLET_TO_PLAN_ISSUES_MAP: { [key: string]: string[] } = {
  strategic_foundations: ['vision_creation', 'work_plan_building', 'management_team_development', 'strategic_resource_management', 'effective_routines', 'empower_middle_leadership', 'data_driven_culture', 'change_management', 'internal_communication'],
  teaching_learning_quality: ['pedagogy_management', 'data_based_evaluation', 'pedagogical_innovation_flexibility', 'closing_learning_gaps', 'excellence_and_gifted_students', 'promoting_hots', 'disciplinary_literacy', 'formative_assessment_culture', 'culturally_responsive_teaching'],
  staff_development: ['staff_development_leadership', 'staff_learning_professionalism', 'staff_commitment_capability', 'staff_wellbeing_stability', 'teacher_onboarding_retention', 'plc_culture', 'staff_resilience', 'staff_gap_bridging'],
  climate_and_wellbeing: ['climate_improvement', 'safety_and_belonging', 'risk_behavior_management', 'student_support_system', 'test_anxiety_management', 'inclusion_equity', 'student_agency'],
  community_partnerships: ['parent_community_partnership', 'informal_education_expansion', 'parental_support_tools', 'school_as_community_anchor', 'digital_citizenship'],
  evaluation_and_control: ['data_based_evaluation', 'data_driven_culture', 'formative_assessment_culture'],
  pedagogical_innovation: ['pedagogical_innovation_flexibility', 'edtech_integration', 'promoting_hots', 'student_agency'],
};

// Fix: Replaced JSX syntax for icons with React.createElement to avoid TypeScript parsing errors in a .ts file.
export const FOCUS_AREA_DEFINITIONS: { [key: string]: { name: string; icon: JSX.Element } } = {
  strategic_foundations: {
    name: 'יסודות אסטרטגיים וניהול',
    icon: React.createElement(Puzzle, { size: 24 }),
  },
  teaching_learning_quality: {
    name: 'איכות הוראה ולמידה',
    icon: React.createElement(BookOpen, { size: 24 }),
  },
  staff_development: {
    name: 'פיתוח ושימור הצוות החינוכי',
    icon: React.createElement(Users, { size: 24 }),
  },
  climate_and_wellbeing: {
    name: 'אקלים ורווחה רגשית',
    icon: React.createElement(HeartHandshake, { size: 24 }),
  },
  community_partnerships: {
    name: 'שותפות קהילתית',
    icon: React.createElement(Briefcase, { size: 24 }),
  },
  evaluation_and_control: {
    name: 'תהליכי הערכה ובקרה',
    icon: React.createElement(CheckCircle, { size: 24 }),
  },
  pedagogical_innovation: {
    name: 'חדשנות פדגוגית',
    icon: React.createElement(BrainCircuit, { size: 24 }),
  },
};