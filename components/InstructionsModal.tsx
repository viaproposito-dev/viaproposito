import React, { useState } from 'react';
import Image from 'next/image';

interface InstructionsModalProps {
    onStart: (email: string) => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onStart }) => {
    const [email, setEmail] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);

        // Solo validamos si el campo no está vacío o ya se intentó enviar el formulario
        if (value.length > 0 || formSubmitted) {
            setIsValidEmail(validateEmail(value));

            // Si ahora es válido y hay un error, lo limpiamos
            if (validateEmail(value) && error) {
                setError('');
            }
        } else {
            setIsValidEmail(true); // Reiniciamos el estado si está vacío y no se ha enviado
        }
    };

    const handleSubmit = async () => {
        setFormSubmitted(true);

        // Validamos que haya un correo
        if (!email) {
            setIsValidEmail(false);
            setError('Por favor ingresa tu correo electrónico');
            return;
        }

        // Validamos que sea un formato correcto
        if (!validateEmail(email)) {
            setIsValidEmail(false);
            setError('Por favor ingresa un correo electrónico válido');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Eliminamos la verificación de email existente
            // Ahora permitimos que cualquier email tome el test múltiples veces
            onStart(email);
        } catch (err) {
            setIsValidEmail(false);
            setError('Ocurrió un error inesperado. Inténtalo de nuevo');
            console.error('Error:', err);
            setIsLoading(false);
        }
    };

    // Permitir enviar con Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="fixed inset-0 bg-via-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 sm:p-8 my-4 sm:my-8 animate-fade-in border border-via-sage/20 max-h-[90vh] overflow-y-auto">
                {/* Logo */}
                <div className="text-center mb-4 sm:mb-6">
                    <Image
                        src="/iconos/icono_295244.png"
                        alt="Vía Propósito"
                        width={60}
                        height={60}
                        className="mx-auto mb-3 sm:mb-4 sm:w-20 sm:h-20"
                        priority
                    />
                    <h2 className="text-xl sm:text-2xl font-poppins font-semibold text-via-primary mb-2">
                        Bienvenido al Test
                    </h2>
                    <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-via-primary to-via-secondary mx-auto rounded-full"></div>
                </div>

                {/* Instrucciones */}
                <div className="mb-4 sm:mb-6 text-via-primary/80 space-y-2 sm:space-y-3">
                    <p className="font-poppins leading-relaxed text-sm sm:text-base">
                        A continuación encontrarás <strong className="text-via-primary">37 frases</strong> para evaluar qué tanto estás de acuerdo con cada una.
                    </p>
                    <p className="font-poppins leading-relaxed text-sm sm:text-base">
                        Por favor, selecciona una opción para cada pregunta según tu nivel de acuerdo.
                    </p>
                    <p className="font-poppins leading-relaxed text-sm sm:text-base">
                        Al finalizar el test, recibirás tu <strong className="text-via-primary">resultado personalizado</strong> por correo electrónico.
                    </p>
                </div>

                {/* Campo de email */}
                <div className="mb-4 sm:mb-6">
                    <label htmlFor="email" className="block text-sm font-poppins font-semibold text-via-primary mb-2">
                        Correo electrónico *
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        onKeyDown={handleKeyDown}
                        className={`w-full p-3 sm:p-4 border-2 rounded-lg font-poppins text-sm sm:text-base focus:ring-2 focus:outline-none transition-all duration-200 ${isValidEmail
                            ? 'border-via-sage focus:border-via-primary focus:ring-via-primary/20'
                            : 'border-red-400 focus:border-red-500 focus:ring-red-200'
                            }`}
                        placeholder="ejemplo@correo.com"
                        disabled={isLoading}
                        autoFocus
                    />

                    {/* Mensaje de error */}
                    {!isValidEmail && error && (
                        <div className="mt-2 sm:mt-3 flex items-start text-xs sm:text-sm text-red-600 bg-red-50 p-2 sm:p-3 rounded-lg border border-red-200">
                            <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-poppins">{error}</span>
                        </div>
                    )}

                    {/* Nota informativa actualizada */}
                    <p className="mt-2 sm:mt-3 text-xs font-poppins text-via-primary/60 bg-via-cream p-2 sm:p-3 rounded-lg border border-via-sage/20">
                        <svg className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 text-via-primary/40" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Tu correo se utilizará únicamente para enviarte los resultados. Puedes repetir el test cuando gustes.
                    </p>
                </div>

                {/* Botón de acción */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`w-full py-3 sm:py-4 font-poppins font-semibold text-sm sm:text-base rounded-lg transition-all duration-200 transform ${isLoading
                        ? 'bg-via-sage/50 cursor-not-allowed text-via-primary/50'
                        : 'bg-via-primary hover:bg-via-secondary text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-via-primary/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Iniciando test...
                        </span>
                    ) : (
                        <>
                            <span>Iniciar Test</span>
                            <svg className="inline ml-2 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default InstructionsModal;