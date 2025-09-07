import React, { useState, useMemo } from 'react';
import { SchoolAssessmentData } from '../types/schoolAssessmentTypes';

interface SchoolDataTableProps {
    schools: SchoolAssessmentData[];
    onSchoolSelect: (schoolId: number) => void;
    selectedSchoolId: number | null;
}

const SchoolDataTable: React.FC<SchoolDataTableProps> = ({ 
    schools, 
    onSchoolSelect, 
    selectedSchoolId 
}) => {
    const [sortField, setSortField] = useState<keyof SchoolAssessmentData>('overallAverage');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');

    // Sort and filter schools
    const sortedAndFilteredSchools = useMemo(() => {
        let filtered = schools.filter(school =>
            school.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            school.principalName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
             if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });

    }, [schools, sortField, sortDirection, searchTerm]);

    // Handle sorting
    const handleSort = (field: keyof SchoolAssessmentData) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const SortIcon: React.FC<{field: keyof SchoolAssessmentData}> = ({ field }) => {
        if (sortField !== field) return null;
        return (
             <svg className={`w-4 h-4 ml-2 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        )
    }

    const getPerformanceLevel = (tier: number) => {
        switch (tier) {
            case 1: return 'מצוין';
            case 2: return 'בינוני';
            case 3: return 'נמוך';
            default: return 'לא נקבע';
        }
    };

    // Get tier color class
    const getTierColor = (tier: number) => {
        switch (tier) {
            case 1: return 'bg-green-100 text-green-800 border-green-200';
            case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 3: return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getAverageColor = (tier: number) => {
        switch (tier) {
            case 3: return 'bg-red-100 text-red-800';
            case 2: return 'bg-yellow-100 text-yellow-800';
            case 1: return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                     <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="חיפוש לפי שם בית ספר או מנהל..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th 
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('schoolName')}
                            >
                                <div className="flex items-center">
                                    שם בית הספר
                                    <SortIcon field="schoolName" />
                                </div>
                            </th>
                            <th 
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('principalName')}
                            >
                                <div className="flex items-center">
                                    מנהל/ת
                                    <SortIcon field="principalName" />
                                </div>
                            </th>
                            <th 
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('overallAverage')}
                            >
                                <div className="flex items-center">
                                    ממוצע כללי
                                    <SortIcon field="overallAverage" />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                רמת תפקוד
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedAndFilteredSchools.map((school) => (
                            <tr 
                                key={school.id}
                                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                                    selectedSchoolId === school.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                                }`}
                                onClick={() => onSchoolSelect(school.id)}
                            >
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {school.schoolName}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {school.principalName}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAverageColor(school.performanceTier)}`}>
                                        {school.overallAverage.toFixed(1)}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTierColor(school.performanceTier)}`}>
                                        {getPerformanceLevel(school.performanceTier)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-500 text-center">
                מציג {sortedAndFilteredSchools.length} מתוך {schools.length} בתי ספר
            </div>
        </div>
    );
};

export default SchoolDataTable;