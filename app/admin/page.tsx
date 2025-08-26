// app/admin/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import StatsOverview from '@/components/StatsOverview';
import UsersSection from '@/components/UsersSection';
import IndividualResultSection from '@/components/IndividualResultSection';

interface DemographicData {
    gender: Array<{ gender: string; count: number }>;
    ageGroups: Array<{ age_group: string; count: number }>;
    occupations: Array<{ occupation: string; count: number }>;
    maritalStatus: Array<{ marital_status: string; count: number }>;
}

interface BasicStats {
    totalTests: number;
    totalUsers: number;
    categoryDistribution: Array<{
        category: string;
        count: number;
    }>;
    demographics: DemographicData;
}

export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'individual'>('stats');
    const [basicStats, setBasicStats] = useState<BasicStats | null>(null);
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

        // Cargar estadísticas básicas
        fetchBasicStats(sessionToken);
    }, [router]);

    const fetchBasicStats = async (token: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/basic-stats', {
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
            setBasicStats(data);
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

    const getSessionToken = (): string | null => {
        return sessionStorage.getItem('adminSessionToken');
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
                    <div className="text-via-primary text-xl font-poppins font-semibold mb-2">Cargando dashboard...</div>
                    <p className="text-via-primary/60 font-poppins text-sm">Obteniendo datos del panel</p>
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
                        onClick={() => {
                            const token = getSessionToken();
                            if (token) fetchBasicStats(token);
                        }}
                        className="w-full px-4 py-3 bg-via-primary text-white rounded-lg hover:bg-via-secondary transition duration-300 font-poppins font-medium focus:outline-none focus:ring-2 focus:ring-via-primary focus:ring-opacity-50 shadow-md"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    // Si no hay datos, mostrar un mensaje
    if (!basicStats || basicStats.totalTests === 0) {
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

                {/* Logout button */}
                <div className="flex justify-end mb-8">
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

                {/* Tab Navigation Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                    {/* Tests Completados Tab */}
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`group relative rounded-lg shadow-md transition-all duration-200 transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-via-primary/50 ${activeTab === 'stats'
                            ? 'bg-via-primary text-white shadow-lg scale-102'
                            : 'bg-white text-via-primary hover:shadow-lg hover:bg-via-primary/5 border border-via-sage/20'
                            }`}
                    >
                        <div className="p-4 text-left">
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className={`text-xs font-poppins font-medium uppercase tracking-wide mb-1 ${activeTab === 'stats' ? 'text-white/80' : 'text-via-primary/60'
                                        }`}>
                                        Tests Completados
                                    </div>
                                    <p className="text-2xl font-poppins font-bold mb-1">{basicStats.totalTests}</p>
                                    <p className={`text-sm font-poppins ${activeTab === 'stats' ? 'text-white/70' : 'text-via-primary/50'
                                        }`}>
                                        Estadísticas generales
                                    </p>
                                </div>
                                <div className={`p-2 rounded-lg transition-all duration-200 ${activeTab === 'stats'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-via-primary/10 text-via-primary group-hover:bg-via-primary/20'
                                    }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Usuarios Tab */}
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`group relative rounded-lg shadow-md transition-all duration-200 transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-via-sage/50 ${activeTab === 'users'
                            ? 'bg-via-sage text-white shadow-lg scale-102'
                            : 'bg-white text-via-primary hover:shadow-lg hover:bg-via-sage/5 border border-via-sage/20'
                            }`}
                    >
                        <div className="p-4 text-left">
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className={`text-xs font-poppins font-medium uppercase tracking-wide mb-1 ${activeTab === 'users' ? 'text-white/80' : 'text-via-primary/60'
                                        }`}>
                                        Usuarios Únicos
                                    </div>
                                    <p className="text-2xl font-poppins font-bold mb-1">{basicStats.totalUsers}</p>
                                    <p className={`text-sm font-poppins ${activeTab === 'users' ? 'text-white/70' : 'text-via-primary/50'
                                        }`}>
                                        Gestionar usuarios
                                    </p>
                                </div>
                                <div className={`p-2 rounded-lg transition-all duration-200 ${activeTab === 'users'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-via-sage/10 text-via-sage group-hover:bg-via-sage/20'
                                    }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Resultado Individual Tab */}
                    <button
                        onClick={() => setActiveTab('individual')}
                        className={`group relative rounded-lg shadow-md transition-all duration-200 transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-via-light/50 ${activeTab === 'individual'
                            ? 'bg-via-light text-white shadow-lg scale-102'
                            : 'bg-white text-via-primary hover:shadow-lg hover:bg-via-light/5 border border-via-sage/20'
                            }`}
                    >
                        <div className="p-4 text-left">
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className={`text-xs font-poppins font-medium uppercase tracking-wide mb-1 ${activeTab === 'individual' ? 'text-white/80' : 'text-via-primary/60'
                                        }`}>
                                        Resultado Individual
                                    </div>
                                    <p className="text-lg font-poppins font-bold mb-1">Buscar Usuario</p>
                                    <p className={`text-sm font-poppins ${activeTab === 'individual' ? 'text-white/70' : 'text-via-primary/50'
                                        }`}>
                                        Historial por usuario
                                    </p>
                                </div>
                                <div className={`p-2 rounded-lg transition-all duration-200 ${activeTab === 'individual'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-via-light/10 text-via-light group-hover:bg-via-light/20'
                                    }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="mt-8">
                    {activeTab === 'stats' && (
                        <StatsOverview
                            categoryDistribution={basicStats.categoryDistribution}
                            totalTests={basicStats.totalTests}
                            demographics={basicStats.demographics}
                            getSessionToken={getSessionToken}
                        />
                    )}

                    {activeTab === 'users' && (
                        <UsersSection
                            getSessionToken={getSessionToken}
                        />
                    )}

                    {activeTab === 'individual' && (
                        <IndividualResultSection
                            getSessionToken={getSessionToken}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}