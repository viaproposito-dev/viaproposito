// app/admin/components/StatsOverview.tsx
"use client";
import React, { useState, useEffect } from 'react';

interface CategoryDistribution {
    category: string;
    count: number;
}

interface TestByDay {
    date: string;
    count: number;
}

interface StatsOverviewProps {
    categoryDistribution: CategoryDistribution[];
    totalTests: number;
    getSessionToken: () => string | null;
}

export default function StatsOverview({ categoryDistribution, totalTests, getSessionToken }: StatsOverviewProps) {
    const [testsByDay, setTestsByDay] = useState<TestByDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTestsByDay();
    }, []);

    const fetchTestsByDay = async () => {
        const token = getSessionToken();
        if (!token) return;

        try {
            const response = await fetch('/api/admin/tests-by-day', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTestsByDay(data.testsByDay);
            }
        } catch (error) {
            console.error('Error fetching tests by day:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryName = (category: string): string => {
        const categoryMap: Record<string, string> = {
            'desenganchados': 'Desenganchados',
            'soñadores': 'Soñadores',
            'aficionados': 'Aficionados',
            'comprometidos': 'Comprometidos'
        };
        return categoryMap[category] || category;
    };

    const getCategoryColor = (category: string): string => {
        const colorMap: Record<string, string> = {
            'desenganchados': 'bg-[#A3B7AD]',
            'soñadores': 'bg-[#96AC61]',
            'aficionados': 'bg-[#586E26]',
            'comprometidos': 'bg-[#295244]'
        };
        return colorMap[category] || 'bg-via-sage';
    };

    return (
        <div className="space-y-8">
            {/* Distribución por categoría */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-via-sage/20">
                <h2 className="text-xl font-poppins font-semibold text-via-primary mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-via-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    Distribución por Categoría
                </h2>
                <div className="space-y-6">
                    {['comprometidos', 'aficionados', 'soñadores', 'desenganchados'].map((categoryKey) => {
                        const categoryData = categoryDistribution.find(c => c.category === categoryKey) || { category: categoryKey, count: 0 };
                        const percentage = totalTests > 0 ? (categoryData.count / totalTests) * 100 : 0;
                        const categoryColor = getCategoryColor(categoryKey);

                        return (
                            <div key={categoryKey} className="bg-via-cream/30 p-4 rounded-lg border border-via-sage/10">
                                <div className="flex flex-wrap justify-between mb-3">
                                    <span className="font-poppins font-medium text-via-primary flex items-center">
                                        <span className={`inline-block w-4 h-4 rounded-full mr-3 ${categoryColor}`}></span>
                                        {getCategoryName(categoryKey)}
                                    </span>
                                    <span className="font-poppins font-semibold text-via-primary">
                                        {categoryData.count} tests ({percentage.toFixed(1)}%)
                                    </span>
                                </div>
                                <div className="w-full bg-via-sage/20 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full ${categoryColor} transition-all duration-500 ease-out`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tests por día - Últimos 30 días */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-via-sage/20">
                <h2 className="text-xl font-poppins font-semibold text-via-primary mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-via-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Actividad - Últimos 30 días
                </h2>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <svg className="animate-spin h-8 w-8 text-via-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : testsByDay.length > 0 ? (
                    <div className="space-y-3">
                        {testsByDay.map((day, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-via-cream/30 rounded-lg">
                                <span className="font-poppins text-via-primary">
                                    {new Date(day.date).toLocaleDateString('es-MX', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                                <span className="font-poppins font-semibold text-via-primary bg-via-primary/10 px-3 py-1 rounded-full">
                                    {day.count} tests
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-via-primary/60">
                        <p className="font-poppins">No hay datos de actividad en los últimos 30 días</p>
                    </div>
                )}
            </div>
        </div>
    );
}