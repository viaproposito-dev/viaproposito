"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
            // console.log('Estadísticas cargadas:', data);
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
            weekday: "long",     // martes
            day: "numeric",      // 13
            month: "long",       // mayo
            year: "numeric",     // 2025
            hour: "numeric",     // 6
            minute: "2-digit",   // 45
            hour12: true         // 6:45 p. m.
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-via-cream">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-via-sage/20">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-via-primary/10 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-via-primary animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                    <div className="text-via-primary text-xl font-poppins font-semibold mb-2">Cargando estadísticas...</div>
                    <p className="text-via-primary/60 font-poppins text-sm">Obteniendo datos del dashboard</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-via-cream">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-via-sage/20">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-via-orange/10 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-via-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="text-via-orange text-xl font-poppins font-semibold mb-4">{error}</div>
                    <button
                        onClick={refreshStats}
                        className="w-full px-4 py-3 bg-via-primary text-white rounded-lg hover:bg-via-secondary transition duration-300 font-poppins font-medium focus:outline-none focus:ring-2 focus:ring-via-primary focus:ring-opacity-50 shadow-md"
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
            <div className="min-h-screen bg-via-cream py-12 px-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Image
                            src="/logos/logo_295244.png"
                            alt="Vía Propósito"
                            width={200}
                            height={80}
                            className="mx-auto mb-4"
                            priority
                        />
                        <h1 className="text-3xl font-poppins font-bold text-via-primary">Panel Administrativo</h1>
                    </div>

                    <div className="flex justify-end mb-6">
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-via-sage/20 text-via-primary rounded-lg hover:bg-via-sage/30 transition duration-300 shadow-sm flex items-center gap-2 font-poppins"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Cerrar sesión
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-via-sage/20">
                        <div className="flex justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-via-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-xl text-via-primary font-poppins font-semibold">No hay datos de tests disponibles todavía.</p>
                        <p className="mt-3 text-via-primary/70 font-poppins">Los datos aparecerán aquí una vez que los usuarios completen el test.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-via-cream py-6 sm:py-12 px-4">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <Image
                        src="/logos/logo_295244.png"
                        alt="Vía Propósito"
                        width={200}
                        height={80}
                        className="mx-auto mb-4"
                        priority
                    />
                    <h1 className="text-2xl sm:text-3xl font-poppins font-bold text-via-primary">Panel Administrativo</h1>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mb-8">
                    <button
                        onClick={refreshStats}
                        className="px-4 py-2 bg-via-primary text-white rounded-lg hover:bg-via-secondary transition duration-300 shadow-md flex items-center justify-center gap-2 font-poppins font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Actualizar datos
                    </button>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-via-sage/20 text-via-primary rounded-lg hover:bg-via-sage/30 transition duration-300 shadow-sm flex items-center justify-center gap-2 font-poppins"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar sesión
                    </button>
                </div>

                {/* Card de estadística principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-via-primary hover:shadow-xl transition duration-300">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-sm font-poppins font-medium text-via-primary/70 uppercase tracking-wider mb-1">Tests Completados</h2>
                                <p className="text-4xl font-poppins font-bold text-via-primary">{stats.totalTests}</p>
                            </div>
                            <div className="bg-via-primary/10 p-3 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-via-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Cards decorativas */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-via-sage hover:shadow-xl transition duration-300">
                        <div className="flex justify-center items-center h-full">
                            <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-via-sage mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <p className="text-sm font-poppins text-via-primary/60">Estadísticas</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-via-light hover:shadow-xl transition duration-300">
                        <div className="flex justify-center items-center h-full">
                            <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-via-light mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p className="text-sm font-poppins text-via-primary/60">Usuarios</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Distribución por categoría */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-via-sage/20">
                    <h2 className="text-xl font-poppins font-semibold text-via-primary mb-6 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-via-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                        Distribución por Categoría
                    </h2>
                    <div className="space-y-6">
                        {['comprometidos', 'aficionados', 'soñadores', 'desenganchados'].map((categoryKey) => {
                            const categoryData = stats.categoryDistribution.find(c => c.category === categoryKey) || { category: categoryKey, count: 0 };
                            const percentage = stats.totalTests > 0 ? (categoryData.count / stats.totalTests) * 100 : 0;
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

                {/* Tabla de tests recientes */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-via-sage/20">
                    <div className="px-6 py-4 border-b border-via-sage/10 bg-via-cream/20">
                        <h2 className="text-xl font-poppins font-semibold text-via-primary flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-via-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tests Recientes
                        </h2>
                    </div>
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
                                {stats.recentTests.map((test) => (
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
                </div>
            </div>
        </div>
    );
}