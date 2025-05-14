// components/ResultsDisplay.tsx
import React from 'react';
import { CategoryResult } from '../types';

interface ResultsDisplayProps {
    results: CategoryResult[];
    onReset: () => void;
    email?: string;
    emailSent?: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
    results,
    onReset,
    email,
    emailSent = false
}) => {
    const winningCategory = results[0];

    const getCategoryData = (category: string): {
        title: string,
        description: string,
        icon: React.ReactNode,
        color: string
    } => {
        switch (category) {
            case 'desenganchados':
                return {
                    title: "Desenganchado",
                    description: "Tu perfil muestra una tendencia a mantenerte distante de compromisos profundos. Prefieres la independencia y evitas situaciones que requieran involucramiento emocional o social intenso. Es posible que te sientas más cómodo manteniendo cierta distancia en tus relaciones personales y profesionales.",
                    icon: (
                        <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    ),
                    color: "bg-red-500"
                };
            case 'soñadores':
                return {
                    title: "Soñador",
                    description: "Tu perfil refleja que tienes muchas ideas y aspiraciones, pero puede que te falte concreción en tus planes. Tiendes a imaginar escenarios ideales sin dar necesariamente los pasos prácticos para alcanzarlos. Tu creatividad es tu fortaleza, pero podrías beneficiarte de establecer metas más definidas.",
                    icon: (
                        <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                        </svg>
                    ),
                    color: "bg-yellow-500"
                };
            case 'aficionados':
                return {
                    title: "Aficionado",
                    description: "Tu perfil indica que exploras muchas áreas de interés sin comprometerte profundamente con ninguna. Disfrutas la variedad y las nuevas experiencias, pero puedes encontrar difícil persistir en un solo camino. Tu versatilidad es valiosa, aunque podrías conseguir más profundidad al enfocarte más.",
                    icon: (
                        <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    ),
                    color: "bg-green-500"
                };
            case 'comprometidos':
                return {
                    title: "Comprometido",
                    description: "Tu perfil demuestra un alto nivel de compromiso con tus relaciones, objetivos y comunidad. Tomas en serio tus responsabilidades y trabajas consistentemente hacia tus metas. Valoras la profundidad en tus conexiones y tienes una visión clara de lo que quieres lograr.",
                    icon: (
                        <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    ),
                    color: "bg-blue-500"
                };
            default:
                return {
                    title: "Resultado",
                    description: "Gracias por completar el test. A continuación se muestra tu perfil dominante.",
                    icon: (
                        <svg className="w-16 h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    ),
                    color: "bg-purple-500"
                };
        }
    };

    const categoryInfo = getCategoryData(winningCategory.category);

    const getPersonalizedAdvice = (category: string): string => {
        switch (category) {
            case 'desenganchados':
                return "Intenta encontrar un equilibrio entre tu independencia y el establecimiento de vínculos más profundos. Pequeños pasos como dedicar tiempo de calidad a tus relaciones más cercanas pueden marcar una gran diferencia.";
            case 'soñadores':
                return "Canaliza tu creatividad estableciendo metas concretas y alcanzables. Divide tus grandes sueños en pasos pequeños y medibles que puedas ir completando.";
            case 'aficionados':
                return "Identifica qué áreas te apasionan realmente y permite que algunas de ellas evolucionen hacia un compromiso más profundo. La especialización en algunas áreas no significa abandonar tu versatilidad.";
            case 'comprometidos':
                return "Tu compromiso es una fortaleza valiosa. Asegúrate de equilibrarlo con momentos de flexibilidad y descanso para evitar el agotamiento y seguir disfrutando de tus proyectos a largo plazo.";
            default:
                return "";
        }
    };

    const advice = getPersonalizedAdvice(winningCategory.category);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl w-full space-y-8 animate-fade-in">
                {/* Tarjeta de resultado */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    {/* Encabezado con color según la categoría */}
                    <div className={`${categoryInfo.color} px-6 py-8 text-white text-center`}>
                        <div className="mx-auto flex items-center justify-center mb-4">
                            {categoryInfo.icon}
                        </div>
                        <h1 className="text-3xl font-extrabold">Tu Resultado</h1>
                        <p className="text-xl mt-2 font-medium">Perfil: {categoryInfo.title}</p>
                    </div>

                    {/* Contenido */}
                    <div className="px-6 py-8">
                        <div className="prose prose-lg mx-auto text-gray-700">
                            <p className="mb-6 leading-relaxed">{categoryInfo.description}</p>

                            {advice && (
                                <div className="mt-6 mb-6 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Consejo personalizado:</h3>
                                    <p className="text-gray-700">{advice}</p>
                                </div>
                            )}

                            {/* Notificación de correo electrónico */}
                            {email && (
                                <div className={`mt-6 mb-6 bg-${emailSent ? 'green' : 'blue'}-50 p-4 rounded-lg border-l-4 border-${emailSent ? 'green' : 'blue'}-500`}>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            {emailSent ? (
                                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className={`text-sm leading-5 font-medium text-${emailSent ? 'green' : 'blue'}-800`}>
                                                {emailSent ? '¡Correo enviado con éxito!' : 'Enviando resultados a tu correo...'}
                                            </h3>
                                            <div className="mt-1 text-sm leading-5 text-gray-600">
                                                {emailSent ? (
                                                    <p>Hemos enviado una copia de tus resultados a <strong>{email}</strong>. Revisa tu bandeja de entrada.</p>
                                                ) : (
                                                    <p>Estamos preparando tus resultados para enviarlos a <strong>{email}</strong>.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={onReset}
                                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition duration-150 ease-in-out"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Realizar el test nuevamente
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pie de página */}
                <div className="text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Via Propósito. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    );
};

export default ResultsDisplay;