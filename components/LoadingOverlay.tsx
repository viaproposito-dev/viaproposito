import React from 'react';

const LoadingOverlay: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-via-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-sm w-full flex flex-col items-center border border-via-sage/20">

                {/* Spinner personalizado */}
                <div className="mb-6">
                    <div className="relative">
                        {/* Círculo de fondo */}
                        <div className="w-12 h-12 border-4 border-via-sage/20 rounded-full"></div>
                        {/* Círculo animado */}
                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-via-primary rounded-full animate-spin"></div>
                    </div>
                </div>

                {/* Texto */}
                <div className="text-center">
                    <h3 className="text-lg font-poppins font-semibold text-via-primary mb-2">
                        Calculando resultados
                    </h3>
                    <p className="text-sm font-poppins text-via-primary/70 leading-relaxed">
                        Por favor espera mientras procesamos tus respuestas y preparamos tu perfil personalizado...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;