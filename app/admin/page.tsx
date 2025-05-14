"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DateTime } from "luxon";

interface CategoryDistribution {
    category: string;
    count: number;
}

interface TestByDay {
    date: string;
    count: number;
}

interface RecentTest {
    id: number;
    email: string;
    test_date: string;
    final_result: string;
}

interface StatsData {
    totalTests: number;
    categoryDistribution: CategoryDistribution[];
    testsByDay: TestByDay[];
    recentTests: RecentTest[];
}

export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [error, setError] = useState('');
    const router = useRouter();

    // Verificar autenticación
    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
        const authTime = parseInt(sessionStorage.getItem('adminAuthTime') || '0');
        const currentTime = Date.now();
        const sessionToken = sessionStorage.getItem('adminSessionToken');

        // Si no está autenticado o la sesión ha expirado (8 horas), redirigir al login
        if (!isAuthenticated || !sessionToken || (currentTime - authTime > 8 * 60 * 60 * 1000)) {
            sessionStorage.removeItem('adminAuthenticated');
            sessionStorage.removeItem('adminAuthTime');
            sessionStorage.removeItem('adminSessionToken');
            router.push('/admin/login');
            return;
        }

        // Cargar estadísticas
        fetchStats(sessionToken);
    }, [router]);

    const fetchStats = async (token: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token inválido, redirigir al login
                    sessionStorage.removeItem('adminAuthenticated');
                    sessionStorage.removeItem('adminAuthTime');
                    sessionStorage.removeItem('adminSessionToken');
                    router.push('/admin/login');
                    return;
                }
                throw new Error('Error al cargar estadísticas');
            }

            const data = await response.json();
            console.log('Estadísticas cargadas:', data);
            setStats(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar estadísticas. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminAuthTime');
        sessionStorage.removeItem('adminSessionToken');
        router.push('/admin/login');
    };

    const refreshStats = () => {
        const sessionToken = sessionStorage.getItem('adminSessionToken');
        if (sessionToken) {
            fetchStats(sessionToken);
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
            'desenganchados': 'bg-red-500',
            'soñadores': 'bg-yellow-400',
            'aficionados': 'bg-green-500',
            'comprometidos': 'bg-blue-500'
        };

        return colorMap[category] || 'bg-gray-500';
    };

    const formatDate = (dateString: string): string => {
        const monterreyDate = DateTime.fromISO(dateString, { zone: "utc" })
            .setZone("America/Monterrey")
            .setLocale("es-MX");

        return monterreyDate.toLocaleString({
            weekday: "long",     // martes
            day: "numeric",      // 13
            month: "long",       // mayo
            year: "numeric",     // 2025
            hour: "numeric",     // 6
            minute: "2-digit",   // 45
            hour12: true         // 6:45 p. m.
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="text-red-500 text-xl font-bold mb-4">{error}</div>
                    <button
                        onClick={refreshStats}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    // Si no hay datos, mostrar un mensaje
    if (!stats || stats.totalTests === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">Panel Administrativo</h1>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-300 shadow-sm flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Cerrar sesión
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-xl text-gray-700 font-medium">No hay datos de tests disponibles todavía.</p>
                        <p className="mt-3 text-gray-500">Los datos aparecerán aquí una vez que los usuarios completen el test.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-4">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel Administrativo</h1>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            onClick={refreshStats}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-sm flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Actualizar datos
                        </button>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-300 shadow-sm flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Cerrar sesión
                        </button>
                    </div>
                </div>

                {/* Cards de estadísticas principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    {/* Total de tests */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600 hover:shadow-md transition duration-300">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Tests Completados</h2>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalTests}</p>
                            </div>
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Espacios para mantener el diseño uniforme */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-300 hover:shadow-md transition duration-300">
                        <div className="flex justify-center items-center h-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-300 hover:shadow-md transition duration-300">
                        <div className="flex justify-center items-center h-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-300 hover:shadow-md transition duration-300">
                        <div className="flex justify-center items-center h-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Distribución por categoría */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                        Distribución por Categoría
                    </h2>
                    <div className="space-y-5">
                        {/* Asegurar que todas las categorías están representadas */}
                        {['comprometidos', 'aficionados', 'soñadores', 'desenganchados'].map((categoryKey) => {
                            // Buscar la categoría en los datos
                            const categoryData = stats.categoryDistribution.find(c => c.category === categoryKey) || { category: categoryKey, count: 0 };
                            const percentage = stats.totalTests > 0 ? (categoryData.count / stats.totalTests) * 100 : 0;
                            const categoryColor = getCategoryColor(categoryKey);

                            return (
                                <div key={categoryKey}>
                                    <div className="flex flex-wrap justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700 flex items-center">
                                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${categoryColor}`}></span>
                                            {getCategoryName(categoryKey)}
                                        </span>
                                        <span className="text-sm font-medium text-gray-700">
                                            {categoryData.count} tests ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${categoryColor}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tabla de tests recientes */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-gray-900">Tests Recientes</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats.recentTests.map((test) => (
                                    <tr key={test.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(test.test_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(test.final_result)} text-white`}>
                                                {getCategoryName(test.final_result)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}