// components/InstructionsModal.tsx
import React, { useState } from 'react';

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

    const checkEmailExists = async (email: string) => {
        try {
            const response = await fetch(`/api/test-results/check-email?email=${encodeURIComponent(email)}`);

            if (!response.ok) {
                throw new Error('Error al verificar el correo');
            }

            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error('Error verificando email:', error);
            throw error;
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
            // Verificar si el email ya existe en la base de datos
            const emailExists = await checkEmailExists(email);

            if (emailExists) {
                setIsValidEmail(false);
                setError('Este correo ya ha realizado el test anteriormente. Por favor utiliza otro correo electrónico.');
                setIsLoading(false);
                return;
            }

            // Si todo está bien, continuamos con el test
            onStart(email);
        } catch (err) {
            setIsValidEmail(false);
            setError('Ocurrió un error al verificar tu correo. Inténtalo de nuevo');
            console.error('Error en verificación:', err);
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Instrucciones</h2>

                <div className="mb-6 text-gray-700">
                    <p className="mb-4">A continuación encontrarás 37 frases para evaluar qué tanto estás de acuerdo con cada una.</p>
                    <p className="mb-4">Por favor, selecciona una opción para cada pregunta según tu nivel de acuerdo.</p>
                    <p className="mb-4">Al finalizar el test, recibirás tu resultado personalizado.</p>
                </div>

                <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        onKeyDown={handleKeyDown}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${isValidEmail
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                            : 'border-red-500 focus:border-red-500 focus:ring-red-200'
                            }`}
                        placeholder="ejemplo@correo.com"
                        disabled={isLoading}
                        autoFocus
                    />
                    {!isValidEmail && error && (
                        <div className="mt-2 flex items-center text-sm text-red-600">
                            <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                        Tu correo electrónico se utilizará para fines estadísticos y para evitar duplicados en el test.
                    </p>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`w-full py-3 font-bold rounded-lg transition duration-200 ${isLoading
                        ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verificando...
                        </span>
                    ) : (
                        'Iniciar Prueba'
                    )}
                </button>
            </div>
        </div>
    );
};

export default InstructionsModal;