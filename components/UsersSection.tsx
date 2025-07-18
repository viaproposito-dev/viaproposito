// app/admin/components/UsersSection.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { DateTime } from "luxon";

interface TestResult {
    id: number;
    email: string;
    test_date: string;
    final_result: string;
}

interface UsersSectionProps {
    getSessionToken: () => string | null;
}

export default function UsersSection({ getSessionToken }: UsersSectionProps) {
    const [tests, setTests] = useState<TestResult[]>([]);
    const [filteredTests, setFilteredTests] = useState<TestResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchEmail, setSearchEmail] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTests, setTotalTests] = useState(0);
    const testsPerPage = 20;

    useEffect(() => {
        fetchTests();
    }, [currentPage]);

    useEffect(() => {
        handleSearch();
    }, [searchEmail, tests]);

    const fetchTests = async () => {
        const token = getSessionToken();
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/all-tests?page=${currentPage}&limit=${testsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTests(data.tests);
                setTotalPages(data.totalPages);
                setTotalTests(data.totalTests);
            }
        } catch (error) {
            console.error('Error fetching tests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchEmail.trim()) {
            setFilteredTests(tests);
            return;
        }

        const filtered = tests.filter(test =>
            test.email.toLowerCase().includes(searchEmail.toLowerCase())
        );
        setFilteredTests(filtered);
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

    const formatDate = (dateString: string): string => {
        const monterreyDate = DateTime.fromISO(dateString, { zone: "utc" })
            .setZone("America/Monterrey")
            .setLocale("es-MX");

        return monterreyDate.toLocaleString({
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            const end = Math.min(totalPages, start + maxVisible - 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-via-sage/20">
            {/* Header */}
            <div className="px-6 py-4 border-b border-via-sage/10 bg-via-cream/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl font-poppins font-semibold text-via-primary flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-via-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Todos los Tests ({totalTests})
                    </h2>

                    {/* Search input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-via-primary/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por email..."
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-via-sage/30 rounded-lg focus:ring-2 focus:ring-via-primary/20 focus:border-via-primary font-poppins text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Loading state */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-via-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-via-sage/10">
                            <thead className="bg-via-sage/5">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-poppins font-semibold text-via-primary uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-poppins font-semibold text-via-primary uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-poppins font-semibold text-via-primary uppercase tracking-wider">Fecha</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-poppins font-semibold text-via-primary uppercase tracking-wider">Resultado</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-via-sage/10">
                                {(searchEmail ? filteredTests : tests).map((test) => (
                                    <tr key={test.id} className="hover:bg-via-cream/30 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-poppins text-via-primary/70">#{test.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-poppins font-medium text-via-primary">{test.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-poppins text-via-primary/70">{formatDate(test.test_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1.5 inline-flex text-xs font-poppins font-semibold rounded-full ${getCategoryColor(test.final_result)} text-white shadow-sm`}>
                                                {getCategoryName(test.final_result)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination - only show if not searching */}
                    {!searchEmail && totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-via-sage/10 bg-via-cream/10">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-via-primary/70 font-poppins">
                                    Página {currentPage} de {totalPages}
                                </div>

                                <div className="flex space-x-2">
                                    {/* Previous button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage <= 1}
                                        className={`px-3 py-2 text-sm font-poppins rounded-lg ${currentPage <= 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-via-sage/20 text-via-primary hover:bg-via-sage/30'
                                            }`}
                                    >
                                        Anterior
                                    </button>

                                    {/* Page numbers */}
                                    {getPageNumbers().map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-2 text-sm font-poppins rounded-lg ${currentPage === page
                                                ? 'bg-via-primary text-white'
                                                : 'bg-via-sage/20 text-via-primary hover:bg-via-sage/30'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    {/* Next button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages}
                                        className={`px-3 py-2 text-sm font-poppins rounded-lg ${currentPage >= totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-via-sage/20 text-via-primary hover:bg-via-sage/30'
                                            }`}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No results message */}
                    {searchEmail && filteredTests.length === 0 && (
                        <div className="text-center py-12 text-via-primary/60">
                            <svg className="mx-auto h-12 w-12 text-via-primary/40 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="font-poppins">No se encontraron tests para "{searchEmail}"</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
