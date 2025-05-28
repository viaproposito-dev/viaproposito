"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Verificar si ya está autenticado
    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
        const sessionToken = sessionStorage.getItem('adminSessionToken');
        const authTime = parseInt(sessionStorage.getItem('adminAuthTime') || '0');
        const currentTime = Date.now();

        // Si está autenticado y el token no ha expirado (8 horas), redirigir al dashboard
        if (isAuthenticated && sessionToken && (currentTime - authTime < 8 * 60 * 60 * 1000)) {
            router.push('/admin');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Enviar solicitud a la API de login
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            // Guardar token y estado de autenticación
            sessionStorage.setItem('adminAuthenticated', 'true');
            sessionStorage.setItem('adminAuthTime', Date.now().toString());
            sessionStorage.setItem('adminSessionToken', data.token);

            // Redirigir al dashboard
            router.push('/admin');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error desconocido al iniciar sesión');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-via-cream py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-via-sage/20">
                    {/* Logo y header */}
                    <div className="text-center mb-8">
                        <Image
                            src="/logos/logo_295244.png"
                            alt="Vía Propósito"
                            width={180}
                            height={72}
                            className="mx-auto mb-6"
                            priority
                        />
                        <h2 className="text-2xl font-poppins font-bold text-via-primary mb-2">
                            Panel Administrativo
                        </h2>
                        <p className="font-poppins text-via-primary/70 text-sm">
                            Inicia sesión para acceder a las estadísticas
                        </p>
                        <div className="w-16 h-1 bg-gradient-to-r from-via-primary to-via-secondary mx-auto rounded-full mt-4"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Campo de contraseña */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-poppins font-semibold text-via-primary mb-2">
                                Contraseña de administrador
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 border-2 border-via-sage/30 rounded-lg font-poppins text-via-primary placeholder-via-primary/50 focus:outline-none focus:border-via-primary focus:ring-2 focus:ring-via-primary/20 transition-all duration-200"
                                    placeholder="Ingresa la contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-via-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Mensaje de error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span className="text-red-700 text-sm font-poppins font-medium">
                                        {error}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Botón de submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-lg font-poppins font-semibold text-white transition-all duration-200 transform ${isLoading
                                ? 'bg-via-sage cursor-not-allowed'
                                : 'bg-gradient-to-r from-via-primary to-via-secondary hover:from-via-secondary hover:to-via-primary hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                                }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Iniciando sesión...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    Iniciar sesión
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Información adicional */}
                    <div className="mt-6 pt-6 border-t border-via-sage/10">
                        <div className="flex items-center justify-center text-xs text-via-primary/60 font-poppins">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Acceso seguro
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="font-poppins text-via-primary/60 text-sm">
                        © {new Date().getFullYear()} Vía Propósito. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}