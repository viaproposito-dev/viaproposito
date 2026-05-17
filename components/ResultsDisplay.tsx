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
        blogLink: string,
        icon: React.ReactNode,
        bgColor: string,
        borderColor: string
    } => {
        switch (category) {
            case 'desorientado':
                return {
                    title: "Desorientado",
                    description: "Estás en un punto donde te sientes perdido. No tienes claridad sobre qué quieres, pero tampoco sabes por dónde empezar, así que terminas viviendo más en duda que en dirección. Probablemente has pensado cosas como \"no sé qué estoy haciendo con mi vida\" o \"todos parecen tenerlo claro menos yo\", y cuando intentas pensar en tu futuro, te abruma tanto que prefieres evitarlo. En el fondo, no es falta de capacidad, es falta de claridad y una desconexión contigo mismo. Lo que necesitas ahora no es tomar decisiones grandes, es detenerte, bajar el ruido y empezar a entenderte.",
                    blogLink: "https://www.viaproposito.com.mx/blog/que-quiero-hacer-con-mi-vida",
                    icon: (
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    ),
                    bgColor: "bg-[#A3B7AD]",
                    borderColor: "border-[#A3B7AD]"
                };
            case 'rebelde':
                return {
                    title: "Rebelde",
                    description: "Estás en un punto donde ya empezaste a cuestionarte y sabes que quieres algo diferente, pero sientes que hay algo que te detiene. No es falta de intención, es ruido interno. Probablemente has pensado \"sé que quiero cambiar, pero me da miedo equivocarme\" o \"siento que no soy suficiente o que voy tarde\", y eso hace que dudes de ti más de lo que avanzas. Lo que necesitas ahora es soltar lo que no te pertenece: cuestionar esas ideas que te limitan, separar lo que realmente quieres de lo que sientes que \"deberías\" hacer, y aceptar que equivocarse no es fallar, es parte del proceso.",
                    blogLink: "https://www.viaproposito.com.mx/blog/como-confiar-mas-en-tus-decisiones",
                    icon: (
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    ),
                    bgColor: "bg-[#C4956A]",
                    borderColor: "border-[#C4956A]"
                };
            case 'explorador':
                return {
                    title: "Explorador",
                    description: "Estás en un punto donde ya saliste de la confusión y empezaste a descubrirte, pero ahora te enfrentas a algo diferente: tienes muchas ideas, intereses y posibilidades, pero no logras elegir una. Probablemente piensas \"me gustan muchas cosas, pero no sé cuál elegir\" o \"¿y si me equivoco?\", y eso te lleva a intentar de todo sin comprometerte realmente con nada. Lo que necesitas ahora no es seguir pensando, es empezar a elegir y probar en el mundo real. Porque la claridad no llega antes de actuar, llega gracias a actuar.",
                    blogLink: "https://www.viaproposito.com.mx/blog/paralisis-de-decision",
                    icon: (
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    ),
                    bgColor: "bg-[#96AC61]",
                    borderColor: "border-[#96AC61]"
                };
            case 'constructor':
                return {
                    title: "Constructor",
                    description: "Estás en un punto donde ya tienes claridad suficiente sobre hacia dónde quieres ir y has empezado a tomar acción, pero sostener ese avance se ha vuelto el verdadero reto. Probablemente piensas \"ya sé lo que quiero, pero me cuesta mantenerme constante\" o \"quiero avanzar más rápido\". Lo que necesitas ahora es disciplina y ejecución: convertir tu intención en hábitos y tu visión en acciones medibles. Porque en esta etapa, la diferencia no la hace saber más, la hace hacer mejor y de forma consistente.",
                    blogLink: "https://www.viaproposito.com.mx/blog/sabes-lo-que-quieres",
                    icon: (
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    ),
                    bgColor: "bg-[#586E26]",
                    borderColor: "border-[#586E26]"
                };
            case 'guia':
                return {
                    title: "Guía",
                    description: "Estás en un punto donde el propósito ya no es solo algo que buscas: es algo que vives. Has construido claridad sobre quién eres, hacia dónde quieres ir y qué tipo de vida quieres crear, y has aprendido a sostenerlo con hábitos, decisiones y sistemas que te mantienen alineado incluso cuando las cosas se complican. Hoy no solo buscas crecer personalmente, también quieres generar impacto, compartir lo que has aprendido y ayudar a otros a encontrar claridad en su propio camino. Porque cuando llegas aquí, el propósito deja de ser solo personal y empieza a convertirse en una herramienta para servir e inspirar a otros.",
                    blogLink: "",
                    icon: (
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    ),
                    bgColor: "bg-[#295244]",
                    borderColor: "border-[#295244]"
                };
            default:
                return {
                    title: "Resultado",
                    description: "Gracias por completar el test. A continuación se muestra tu perfil dominante.",
                    blogLink: "",
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

                            {/* Recurso recomendado */}
                            {categoryInfo.blogLink && (
                                <div className={`bg-via-cream/50 p-5 rounded-xl border-l-4 ${categoryInfo.borderColor}`}>
                                    <h3 className="font-poppins font-semibold text-via-primary text-lg mb-3">
                                        Te podría interesar:
                                    </h3>
                                    <a
                                        href={categoryInfo.blogLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-poppins text-via-primary/80 underline underline-offset-2 hover:text-via-primary transition-colors leading-relaxed break-all"
                                    >
                                        {categoryInfo.blogLink}
                                    </a>
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