// app/admin/components/IndividualResultSection.tsx
"use client";
import React, { useState } from 'react';
import { DateTime } from "luxon";

interface UserTest {
    id: number;
    birth_year?: number;
    gender?: string;
    occupation?: string;
    marital_status?: string;
    test_date: string;
    final_result: string;
    categoryScores: {
        desenganchados: number;
        soñadores: number;
        aficionados: number;
        comprometidos: number;
    };
}

interface Demographics {
    birth_year?: number;
    gender?: string;
    occupation?: string;
    marital_status?: string;
    last_updated: string;
}

interface UserSummary {
    email: string;
    totalTests: number;
    firstTest: string;
    lastTest: string;
    demographics?: Demographics;
    tests: UserTest[];
}

interface IndividualResultSectionProps {
    getSessionToken: () => string | null;
}

export default function IndividualResultSection({ getSessionToken }: IndividualResultSectionProps) {
    const [searchEmail, setSearchEmail] = useState('');
    const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [expandedTests, setExpandedTests] = useState<Set<number>>(new Set());

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchEmail.trim()) {
            setError('Por favor ingresa un email');
            return;
        }

        const token = getSessionToken();
        if (!token) return;

        setIsLoading(true);
        setError('');
        setHasSearched(true);

        try {
            const response = await fetch(`/api/admin/user-summary?email=${encodeURIComponent(searchEmail.trim())}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserSummary(data);
            } else if (response.status === 404) {
                setUserSummary(null);
                setError('No se encontraron tests para este email');
            } else {
                throw new Error('Error al buscar el usuario');
            }
        } catch (error) {
            console.error('Error searching user:', error);
            setError('Error al buscar el usuario. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTestExpansion = (testId: number) => {
        const newExpanded = new Set(expandedTests);
        if (newExpanded.has(testId)) {
            newExpanded.delete(testId);
        } else {
            newExpanded.add(testId);
        }
        setExpandedTests(newExpanded);
    };

    const formatDemographicValue = (key: string, value?: string | number): string => {
        if (!value) return 'No especificado';

        switch (key) {
            case 'gender':
                switch (value) {
                    case 'masculino': return 'Masculino';
                    case 'femenino': return 'Femenino';
                    case 'otro': return 'Otro';
                    default: return value as string;
                }
            case 'occupation':
                const occupationMap: { [key: string]: string } = {
                    'estudiante': 'Estudiante',
                    'medico': 'Médico',
                    'ingeniero': 'Ingeniero',
                    'abogado': 'Abogado',
                    'maestro': 'Maestro/Profesor',
                    'enfermero': 'Enfermero',
                    'contador': 'Contador',
                    'arquitecto': 'Arquitecto',
                    'psicologo': 'Psicólogo',
                    'vendedor': 'Vendedor',
                    'empresario': 'Empresario',
                    'empleado_publico': 'Empleado Público',
                    'trabajador_social': 'Trabajador Social',
                    'artista': 'Artista',
                    'chef': 'Chef/Cocinero',
                    'policia': 'Policía',
                    'bombero': 'Bombero',
                    'tecnico': 'Técnico',
                    'comerciante': 'Comerciante',
                    'empleado_domestico': 'Empleado Doméstico',
                    'jubilado': 'Jubilado',
                    'desempleado': 'Desempleado',
                    'otro': 'Otro'
                };
                return occupationMap[value as string] || value as string;
            case 'marital_status':
                switch (value) {
                    case 'soltero': return 'Soltero/a';
                    case 'casado': return 'Casado/a';
                    case 'union_libre': return 'Unión Libre';
                    case 'divorciado': return 'Divorciado/a';
                    case 'viudo': return 'Viudo/a';
                    case 'separado': return 'Separado/a';
                    default: return value as string;
                }
            case 'birth_year':
                const currentYear = new Date().getFullYear();
                const age = currentYear - (value as number);
                return `${value} (${age} años)`;
            default:
                return value.toString();
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

    const formatDate = (dateString: string): string => {
        const monterreyDate = DateTime.fromISO(dateString, { zone: "utc" })
            .setZone("America/Monterrey")
            .setLocale("es-MX");

        return monterreyDate.toLocaleString({
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    };

    const getScorePercentage = (score: number, category: string): number => {
        // Different max scores per category based on number of questions
        const maxScores = {
            'desenganchados': 36, // 9 questions * 4 points max
            'soñadores': 36,      // 9 questions * 4 points max
            'aficionados': 36,    // 9 questions * 4 points max
            'comprometidos': 40   // 10 questions * 4 points max
        };

        const maxScore = maxScores[category as keyof typeof maxScores] || 36;
        return Math.round((score / maxScore) * 100);
    };

    const getMaxScore = (category: string): number => {
        const maxScores = {
            'desenganchados': 36, // 9 questions * 4 points max
            'soñadores': 36,      // 9 questions * 4 points max
            'aficionados': 36,    // 9 questions * 4 points max
            'comprometidos': 40   // 10 questions * 4 points max
        };

        return maxScores[category as keyof typeof maxScores] || 36;
    };

    return (
        <div className="space-y-8">
            {/* Search Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-via-sage/20">
                <h2 className="text-xl font-poppins font-semibold text-via-primary mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-via-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar Usuario
                </h2>

                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="flex-1">
                        <input
                            type="email"
                            placeholder="Ingresa el email del usuario..."
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-via-sage/30 rounded-lg focus:ring-2 focus:ring-via-primary/20 focus:border-via-primary font-poppins"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-via-primary text-white rounded-lg hover:bg-via-secondary transition duration-300 font-poppins font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Buscando...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Buscar
                            </>
                        )}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                        <div className="flex items-center text-red-700">
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="font-poppins text-sm">{error}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* User Summary */}
            {userSummary && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-via-sage/20">
                    <h3 className="text-xl font-poppins font-semibold text-via-primary mb-6 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-via-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Perfil de {userSummary.email}
                    </h3>

                    {/* User Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-via-cream/30 p-4 rounded-lg border border-via-sage/10">
                            <div className="text-2xl font-poppins font-bold text-via-primary">{userSummary.totalTests}</div>
                            <div className="text-sm font-poppins text-via-primary/70">Tests Completados</div>
                        </div>
                        <div className="bg-via-cream/30 p-4 rounded-lg border border-via-sage/10">
                            <div className="text-sm font-poppins font-semibold text-via-primary">Primer Test</div>
                            <div className="text-sm font-poppins text-via-primary/70">
                                {DateTime.fromISO(userSummary.firstTest).setZone("America/Monterrey").toLocaleString({
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                })}
                            </div>
                        </div>
                        <div className="bg-via-cream/30 p-4 rounded-lg border border-via-sage/10">
                            <div className="text-sm font-poppins font-semibold text-via-primary">Último Test</div>
                            <div className="text-sm font-poppins text-via-primary/70">
                                {DateTime.fromISO(userSummary.lastTest).setZone("America/Monterrey").toLocaleString({
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Demographics Section */}
                    {userSummary.demographics && (
                        <div className="mb-8">
                            <h4 className="text-lg font-poppins font-semibold text-via-primary mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-via-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Información Demográfica
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-via-cream/20 rounded-lg border border-via-sage/10">
                                <div className="bg-white p-3 rounded-lg border border-via-sage/10">
                                    <dt className="text-xs font-poppins font-semibold text-via-primary/60 uppercase tracking-wider mb-1">Año de Nacimiento</dt>
                                    <dd className="text-sm font-poppins text-via-primary">{formatDemographicValue('birth_year', userSummary.demographics.birth_year)}</dd>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-via-sage/10">
                                    <dt className="text-xs font-poppins font-semibold text-via-primary/60 uppercase tracking-wider mb-1">Sexo</dt>
                                    <dd className="text-sm font-poppins text-via-primary">{formatDemographicValue('gender', userSummary.demographics.gender)}</dd>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-via-sage/10">
                                    <dt className="text-xs font-poppins font-semibold text-via-primary/60 uppercase tracking-wider mb-1">Ocupación</dt>
                                    <dd className="text-sm font-poppins text-via-primary">{formatDemographicValue('occupation', userSummary.demographics.occupation)}</dd>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-via-sage/10">
                                    <dt className="text-xs font-poppins font-semibold text-via-primary/60 uppercase tracking-wider mb-1">Estado Civil</dt>
                                    <dd className="text-sm font-poppins text-via-primary">{formatDemographicValue('marital_status', userSummary.demographics.marital_status)}</dd>
                                </div>
                            </div>
                            <p className="text-xs font-poppins text-via-primary/50 mt-2">
                                * Información del test más reciente ({DateTime.fromISO(userSummary.demographics.last_updated).setZone("America/Monterrey").toLocaleString({
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                })})
                            </p>
                        </div>
                    )}

                    {/* Individual Tests */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-poppins font-semibold text-via-primary border-b border-via-sage/20 pb-2">
                            Historial de Tests
                        </h4>

                        {userSummary.tests.map((test) => (
                            <div key={test.id} className="border border-via-sage/20 rounded-lg p-6 bg-via-cream/10">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h5 className="font-poppins font-semibold text-via-primary">
                                                Test #{test.id}
                                            </h5>
                                            <button
                                                onClick={() => toggleTestExpansion(test.id)}
                                                className="text-via-primary hover:text-via-secondary transition-colors"
                                            >
                                                <svg
                                                    className={`h-4 w-4 transition-transform duration-200 ${expandedTests.has(test.id) ? 'rotate-90' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="text-sm font-poppins text-via-primary/70 mt-1">
                                            {formatDate(test.test_date)}
                                        </div>
                                        <div className="mt-2">
                                            <span className={`px-3 py-1.5 inline-flex text-sm font-poppins font-semibold rounded-full ${getCategoryColor(test.final_result)} text-white shadow-sm`}>
                                                Resultado: {getCategoryName(test.final_result)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {expandedTests.has(test.id) && (
                                    <>
                                        {/* Demographics for this test */}
                                        {(test.birth_year || test.gender || test.occupation || test.marital_status) && (
                                            <div className="mb-6 p-4 bg-white rounded-lg border border-via-sage/10">
                                                <h6 className="font-poppins font-medium text-via-primary/80 mb-3">Información Demográfica:</h6>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                    <div>
                                                        <dt className="text-xs font-poppins font-semibold text-via-primary/60 uppercase tracking-wider">Año Nacimiento</dt>
                                                        <dd className="text-sm font-poppins text-via-primary">{formatDemographicValue('birth_year', test.birth_year)}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs font-poppins font-semibold text-via-primary/60 uppercase tracking-wider">Sexo</dt>
                                                        <dd className="text-sm font-poppins text-via-primary">{formatDemographicValue('gender', test.gender)}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs font-poppins font-semibold text-via-primary/60 uppercase tracking-wider">Ocupación</dt>
                                                        <dd className="text-sm font-poppins text-via-primary">{formatDemographicValue('occupation', test.occupation)}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs font-poppins font-semibold text-via-primary/60 uppercase tracking-wider">Estado Civil</dt>
                                                        <dd className="text-sm font-poppins text-via-primary">{formatDemographicValue('marital_status', test.marital_status)}</dd>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Category Scores */}
                                        <div className="space-y-4">
                                            <h6 className="font-poppins font-medium text-via-primary/80">Puntajes por Categoría:</h6>

                                            {Object.entries(test.categoryScores).map(([category, score]) => {
                                                const percentage = getScorePercentage(score, category);
                                                const maxScore = getMaxScore(category);
                                                const categoryColor = getCategoryColor(category);

                                                return (
                                                    <div key={category} className="flex items-center justify-between p-3 bg-white rounded-lg border border-via-sage/10">
                                                        <div className="flex items-center">
                                                            <span className={`inline-block w-3 h-3 rounded-full mr-3 ${categoryColor}`}></span>
                                                            <span className="font-poppins font-medium text-via-primary">
                                                                {getCategoryName(category)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-24 bg-via-sage/20 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full ${categoryColor}`}
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="font-poppins font-semibold text-via-primary text-sm w-12 text-right">
                                                                {score}/{maxScore}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No results state */}
            {hasSearched && !userSummary && !isLoading && !error && (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-via-sage/20">
                    <svg className="mx-auto h-12 w-12 text-via-primary/40 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="font-poppins text-via-primary/60">No se encontraron tests para este usuario</p>
                </div>
            )}
        </div>
    );
}