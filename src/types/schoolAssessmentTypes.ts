import { School } from ".";

export interface SchoolReportCard {
    school: School;
    schoolName: string;
    principalName: string;
    studentCount: number;
    supportLevel: string;
    overallAverage: number;
    performanceTier: number;
    domainAverages: { [key: string]: number };
    strengths: string[];
    challenges: { subCategory: string; text: string }[];
    recommendations: string[];
}

export interface SchoolAssessmentData {
    id: number;
    schoolName: string;
    principalName: string;
    overallAverage: number;
    performanceTier: number;
}