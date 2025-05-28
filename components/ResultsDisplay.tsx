import React from 'react';
import Image from 'next/image';
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
        bgColor: string,
        borderColor: string
    } => {
        switch (category) {
            case 'desenganchados':
                return {
                    title: "Desenganchado",
                    description: "Tu perfil muestra una tendencia a mantenerte distante de compromisos profundos. Prefieres la independencia y evitas situaciones que requieran involucramiento emocional o social intenso. Es posible que te sientas más cómodo manteniendo cierta distancia en tus relaciones personales y profesionales.",
                    icon: (
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    ),
                    bgColor: "bg-[#A3B7AD]",
                    borderColor: "border-[#A3B7AD]"
                };
            case 'soñadores':
                return {
                    title: "Soñador",
                    description: "Tu perfil refleja que tienes muchas ideas y aspiraciones, pero puede que te falte concreción en tus planes. Tiendes a imaginar escenarios ideales sin dar necesariamente los pasos prácticos para alcanzarlos. Tu creatividad es tu fortaleza, pero podrías beneficiarte de establecer metas más definidas.",
                    icon: (
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                        </svg>
                    ),
                    bgColor: "bg-[#96AC61]",
                    borderColor: "border-[#96AC61]"
                };
            case 'aficionados':
                return {
                    title: "Aficionado",
                    description: "Tu perfil indica que exploras muchas áreas de interés sin comprometerte profundamente con ninguna. Disfrutas la variedad y las nuevas experiencias, pero puedes encontrar difícil persistir en un solo camino. Tu versatilidad es valiosa, aunque podrías conseguir más profundidad al enfocarte más.",
                    icon: (
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    ),
                    bgColor: "bg-[#586E26]",
                    borderColor: "border-[#586E26]"
                };
            case 'comprometidos':
                return {
                    title: "Comprometido",
                    description: "Tu perfil demuestra un alto nivel de compromiso con tus relaciones, objetivos y comunidad. Tomas en serio tus responsabilidades y trabajas consistentemente hacia tus metas. Valoras la profundidad en tus conexiones y tienes una visión clara de lo que quieres lograr.",
                    icon: (
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    ),
                    bgColor: "bg-[#295244]",
                    borderColor: "border-[#295244]"
                };
            default:
                return {
                    title: "Resultado",
                    description: "Gracias por completar el test. A continuación se muestra tu perfil dominante.",
                    icon: (
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    ),
                    bgColor: "bg-via-primary",
                    borderColor: "border-via-primary"
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
        <div className="min-h-screen flex items-center justify-center bg-via-cream py-8 px-4 sm:px-6">
            <div className="max-w-2xl w-full space-y-6 animate-fade-in">
                {/* Logo arriba */}
                <div className="text-center mb-6">
                    <Image
                        src="/logos/logo_295244.png"
                        alt="Vía Propósito"
                        width={200}
                        height={80}
                        className="mx-auto"
                        priority
                    />
                </div>

                {/* Tarjeta de resultado */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-via-sage/20">
                    {/* Encabezado con color según la categoría */}
                    <div className={`${categoryInfo.bgColor} px-6 py-8 text-white text-center relative`}>
                        {/* Patrón decorativo sutil */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full"></div>
                            <div className="absolute top-8 right-8 w-4 h-4 border-2 border-white rounded-full"></div>
                            <div className="absolute bottom-6 left-8 w-6 h-6 border-2 border-white rounded-full"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="mx-auto flex items-center justify-center mb-4 bg-white/20 rounded-full w-20 h-20">
                                {categoryInfo.icon}
                            </div>
                            <h1 className="text-lg font-poppins font-medium mb-2">Tu Perfil es:</h1>
                            <p className="text-3xl sm:text-4xl font-poppins font-bold">{categoryInfo.title}</p>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="px-6 py-8">
                        <div className="space-y-6">
                            {/* Descripción principal */}
                            <div className="text-center">
                                <p className="font-poppins text-via-primary leading-relaxed text-base sm:text-lg">
                                    {categoryInfo.description}
                                </p>
                            </div>

                            {/* Consejo personalizado */}
                            {advice && (
                                <div className={`bg-via-cream/50 p-5 rounded-xl border-l-4 ${categoryInfo.borderColor}`}>
                                    <h3 className="font-poppins font-semibold text-via-primary text-lg mb-3">
                                        Consejo personalizado:
                                    </h3>
                                    <p className="font-poppins text-via-primary/80 leading-relaxed">
                                        {advice}
                                    </p>
                                </div>
                            )}

                            {/* Notificación de correo electrónico */}
                            {email && (
                                <div className={`p-4 rounded-xl border-2 ${emailSent
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-blue-50 border-blue-200'
                                    }`}>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            {emailSent ? (
                                                <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <p className={`font-poppins font-semibold text-sm ${emailSent ? 'text-green-800' : 'text-blue-800'
                                                }`}>
                                                {emailSent ? '¡Correo enviado con éxito!' : 'Enviando resultados...'}
                                            </p>
                                            <p className="font-poppins text-xs text-gray-600 mt-1">
                                                {emailSent ? (
                                                    <>Hemos enviado una copia de tus resultados a <strong>{email}</strong>. Revisa tu bandeja de entrada.</>
                                                ) : (
                                                    <>Estamos preparando tus resultados para <strong>{email}</strong></>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botón de reiniciar */}
                        <div className="text-center mt-8">
                            <button
                                onClick={onReset}
                                className={`inline-flex items-center px-6 py-3 ${categoryInfo.bgColor} hover:opacity-90 text-white font-poppins font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Volver a tomar el Test
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pie de página */}
                <div className="text-center">
                    <p className="font-poppins text-via-primary/60 text-sm">
                        © {new Date().getFullYear()} Vía Propósito. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResultsDisplay;